import { Secp256k1 } from '@cosmjs/crypto';
import { toBase64 } from '@cosmjs/encoding';
import { EncodeObject } from '@cosmjs/proto-signing';
import {
  calculateFee,
  Coin,
  Coin as StargateCoin,
  DeliverTxResponse,
  GasPrice,
  SignerData,
  StdFee,
} from '@cosmjs/stargate';
import { longify } from '@cosmjs/stargate/build/queryclient';
import { arrayify, concat, splitSignature } from '@ethersproject/bytes';
import {
  ChainRestAuthApi,
  createTxRawFromSigResponse,
  DEFAULT_STD_FEE,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgGrant,
  MsgRevoke,
  MsgSend,
  MsgTransfer,
  MsgUndelegate,
  MsgVote,
  MsgWithdrawDelegatorReward,
} from '@injectivelabs/sdk-ts';
import { createCosmosSignDocFromTransaction, createTransaction, TxRestClient } from '@injectivelabs/sdk-ts';
import { EthWallet } from '@leapwallet/leap-keychain';
import BigNumber from 'bignumber.js';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import { keccak256 } from 'ethereumjs-util';

import { AccountDetails, fetchAccountDetails, InjectiveAccountRestResponse } from '../accounts';
import { ChainInfos } from '../constants';
import { getClientState, getRestUrl } from '../utils';
import { sleep } from '../utils';
import { buildGrantMsg } from './msgs/cosmos';
enum MsgTypes {
  GRANT = '/cosmos.authz.v1beta1.MsgGrant',
  REVOKE = '/cosmos.authz.v1beta1.MsgRevoke',
  SEND = '/cosmos.bank.v1beta1.MsgSend',
  IBCTRANSFER = '/ibc.applications.transfer.v1.MsgTransfer',
  GOV = '/cosmos.gov.v1beta1.MsgVote',
  DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate',
  UNDELEGAGE = '/cosmos.staking.v1beta1.MsgUndelegate',
  REDELEGATE = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  WITHDRAW_REWARD = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
}

export class InjectiveTx {
  chainRestAuthApi: ChainRestAuthApi;

  txRestClient: TxRestClient;
  restEndpoint: string;
  options?: {
    gasPrice: GasPrice;
  };

  constructor(private testnet: boolean, private wallet: EthWallet, restEndpoint?: string) {
    this.restEndpoint = restEndpoint ?? getRestUrl(ChainInfos, 'injective', testnet);
    this.chainRestAuthApi = new ChainRestAuthApi(this.restEndpoint);
    this.txRestClient = new TxRestClient(this.restEndpoint);
  }

  async grantRestake(
    fromAddress: string,
    {
      botAddress,
      validatorAddress,
      expiryDate,
      maxTokens,
    }: {
      botAddress: string;
      validatorAddress: string;
      expiryDate: string;
      maxTokens?: {
        denom?: string | undefined;
        amount?: string | undefined;
      };
    },
    fee: StdFee,
    memo: string,
  ) {
    const messages = [
      buildGrantMsg(
        '/cosmos.staking.v1beta1.StakeAuthorization',
        fromAddress,
        botAddress,
        StakeAuthorization.encode(
          StakeAuthorization.fromPartial({
            allowList: { address: [validatorAddress] },
            maxTokens: maxTokens,
            authorizationType: 1,
          }),
        ).finish(),
        expiryDate,
      ),
    ];
    return await this.signAndBroadcastTx(fromAddress, messages, fee, memo);
  }

  async revokeRestake(fromAddress: string, grantee: string, fee: StdFee, memo: string) {
    const messages = [
      {
        typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
        value: {
          messageType: '/cosmos.staking.v1beta1.MsgDelegate',
          grantee,
          granter: fromAddress,
        },
      },
    ];

    return await this.signAndBroadcastTx(fromAddress, messages, fee, memo);
  }

  async revokeGrant(msgType: string, fromAddress: string, grantee: string, fee: number | StdFee | 'auto', memo = '') {
    const revokeMsg = [
      {
        typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
        value: {
          messageType: msgType,
          grantee,
          granter: fromAddress,
        },
      },
    ];

    return await this.signAndBroadcastTx(fromAddress, revokeMsg, fee, memo);
  }

  async sendTokens(
    fromAddress: string,
    toAddress: string,
    amount: StargateCoin[],
    fee: number | StdFee | 'auto',
    memo = '',
  ) {
    return (await this._sendTokens(fromAddress, toAddress, amount, false, fee, memo)) as unknown as string;
  }

  async simulateSend(fromAddress: string, toAddress: string, amount: StargateCoin[]) {
    return (await this._sendTokens(fromAddress, toAddress, amount, true)) as unknown as number;
  }

  async sendIBCTokens(
    fromAddress: string,
    toAddress: string,
    transferAmount: StargateCoin,
    sourcePort: string,
    sourceChannel: string,
    timeoutHeight: Height | undefined,
    timeoutTimestamp: number | undefined,
    fee: number | StdFee | 'auto',
    memo: string | undefined,
  ) {
    return (await this._sendIBCTokens(
      fromAddress,
      toAddress,
      transferAmount,
      sourcePort,
      sourceChannel,
      timeoutHeight,
      timeoutTimestamp,
      false,
      fee,
      memo,
    )) as unknown as string;
  }

  async vote(
    fromAddress: string,
    proposalId: string,
    option: VoteOption,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    return (await this._vote(fromAddress, proposalId, option, false, fees, memo)) as unknown as string;
  }

  async simulateVote(fromAddress: string, proposalId: string, option: VoteOption) {
    return this?._vote(fromAddress, proposalId, option, true) as unknown as number;
  }

  async delegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    return (await this._delegate(delegatorAddress, validatorAddress, amount, false, fees, memo)) as unknown as string;
  }

  async simulateDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin) {
    return (await this._delegate(delegatorAddress, validatorAddress, amount, true)) as unknown as number;
  }

  async unDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: number | StdFee | 'auto',
    memo?: string,
  ) {
    return (await this._unDelegate(delegatorAddress, validatorAddress, amount, false, fee, memo)) as unknown as string;
  }

  async cancelunDelegation(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    creationHeight: string,
    fee: number | StdFee | 'auto',
    memo?: string,
  ) {
    return (await this._cancelUnDelegate(
      delegatorAddress,
      validatorAddress,
      amount,
      false,
      creationHeight,
      fee,
      memo,
    )) as unknown as string;
  }

  async simulateUnDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin) {
    return (await this._unDelegate(delegatorAddress, validatorAddress, amount, true)) as unknown as number;
  }

  async withdrawRewards(
    delegatorAddress: string,
    validatorAddresses: string[],
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    return (await this._withdrawRewards(delegatorAddress, validatorAddresses, false, fees, memo)) as unknown as string;
  }

  async simulateWithdrawRewards(delegatorAddress: string, validatorAddresses: string[]) {
    return (await this._withdrawRewards(delegatorAddress, validatorAddresses, true)) as unknown as number;
  }

  async reDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    return (await this._reDelegate(
      delegatorAddress,
      validatorDstAddress,
      validatorSrcAddress,
      amount,
      false,
      fees,
      memo,
    )) as unknown as string;
  }

  async simulateReDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
  ) {
    return (await this._reDelegate(
      delegatorAddress,
      validatorDstAddress,
      validatorSrcAddress,
      amount,
      true,
    )) as unknown as number;
  }

  async signAndBroadcastTx(signerAddress: string, msgs: any, fee: StdFee | 'auto' | number, memo = '') {
    const txRaw = await this.signTx(signerAddress, msgs, fee, memo);

    return await this.broadcastTx(txRaw);
  }

  async simulate(signerAddress: string, msgs: EncodeObject[]) {
    const { txRaw } = await this.createTx(signerAddress, msgs, DEFAULT_STD_FEE);

    const simulationResult = await this.txRestClient.simulate(txRaw);
    return simulationResult.gasInfo.gasWanted;
  }

  async pollForTx(txHash: string): Promise<DeliverTxResponse> {
    try {
      const result = await this.txRestClient.fetchTxPoll(txHash);

      return {
        code: result.code,
        height: result.height,
        rawLog: result.rawLog,
        transactionHash: result.txHash,
        gasUsed: result.gasUsed,
        gasWanted: result.gasWanted,
        // this is added just to make the interface compatible with CosmosClient
        events: [],
      };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async _vote(
    fromAddress: string,
    proposalId: string,
    option: VoteOption,
    simulate: boolean,
    fees?: number | StdFee | 'auto',
    memo?: string,
  ) {
    const voteMsg = {
      typeUrl: '/cosmos.gov.v1beta1.MsgVote',
      value: {
        vote: option,
        proposalId: longify(proposalId),
        voter: fromAddress,
      },
    };
    if (simulate && !fees) {
      return await this.simulate(fromAddress, [voteMsg]);
    } else if (fees) {
      return await this.signAndBroadcastTx(fromAddress, [voteMsg], fees, memo);
    }
  }

  private async _reDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    simulate: boolean,
    fees?: number | StdFee | 'auto',
    memo?: string,
  ) {
    const msg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      value: {
        injectiveAddress: delegatorAddress,
        srcValidatorAddress: validatorSrcAddress,
        dstValidatorAddress: validatorDstAddress,
        amount: {
          amount: amount.amount,
          denom: amount.denom,
        },
      },
    };

    if (simulate && !fees) {
      return await this.simulate(delegatorAddress, [msg]);
    } else if (fees) {
      return await this.signAndBroadcastTx(delegatorAddress, [msg], fees, memo);
    }
  }

  private async _sendTokens(
    fromAddress: string,
    toAddress: string,
    amount: StargateCoin[],
    simulate: boolean,
    fee?: number | StdFee | 'auto',
    memo = '',
  ) {
    const sendMsg = {
      typeUrl: MsgTypes.SEND,
      value: {
        srcInjectiveAddress: fromAddress,
        dstInjectiveAddress: toAddress,
        amount: {
          amount: amount[0].amount,
          denom: amount[0].denom,
        },
      },
    };
    if (simulate) {
      return await this.simulate(fromAddress, [sendMsg]);
    } else if (fee) {
      return await this.signAndBroadcastTx(fromAddress, [sendMsg], fee, memo);
    }
  }

  private async _sendIBCTokens(
    fromAddress: string,
    toAddress: string,
    transferAmount: StargateCoin,
    sourcePort: string,
    sourceChannel: string,
    timeoutHeight: any | undefined,
    timeoutTimestamp: number | undefined,
    simulate: boolean,
    fee?: number | StdFee | 'auto',
    memo?: string,
  ) {
    let height = timeoutHeight;
    if (!height) {
      const channelIdData = await getClientState(this.restEndpoint, sourceChannel, 'transfer');

      const latest_height = channelIdData.data.identified_client_state.client_state.latest_height;

      height = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        revisionHeight: latest_height.revision_height + 1,
        revisionNumber: latest_height.revision_number,
      };
    }
    const transferMsg = {
      typeUrl: MsgTypes.IBCTRANSFER,
      value: {
        amount: {
          amount: transferAmount.amount,
          denom: transferAmount.denom,
        },
        sender: fromAddress,
        receiver: toAddress,
        port: sourcePort,
        channelId: sourceChannel,
        height,
        timeout: undefined,
      },
    };
    if (simulate) {
      return await this.simulate(fromAddress, [transferMsg]);
    } else if (fee) {
      try {
        return await this.signAndBroadcastTx(fromAddress, [transferMsg], fee, memo);
      } catch (e) {
        console.log('logging e', e);
      }
    }
  }

  private async _delegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    simulate: boolean,
    fees?: number | StdFee | 'auto',
    memo?: string,
  ) {
    const delegateMsg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: {
        injectiveAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: {
          amount: amount.amount,
          denom: amount.denom,
        },
      },
    };
    if (simulate && !fees) {
      return await this.simulate(delegatorAddress, [delegateMsg]);
    } else if (fees) {
      return await this.signAndBroadcastTx(delegatorAddress, [delegateMsg], fees, memo);
    }
  }

  private async _unDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    simulate: boolean,
    fee?: number | StdFee | 'auto',
    memo?: string,
  ) {
    const undelegateMsg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
      value: {
        injectiveAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: {
          amount: amount.amount,
          denom: amount.denom,
        },
      },
    };
    if (simulate && !fee) {
      return await this.simulate(delegatorAddress, [undelegateMsg]);
    } else if (fee) {
      return await this.signAndBroadcastTx(delegatorAddress, [undelegateMsg], fee, memo);
    }
  }

  private async _cancelUnDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    simulate: boolean,
    creationHeight: string,
    fee?: number | StdFee | 'auto',
    memo?: string,
  ) {
    const undelegateMsg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
      value: {
        injectiveAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        creationHeight: longify(creationHeight),
        amount: {
          amount: amount.amount,
          denom: amount.denom,
        },
      },
    };
    if (simulate && !fee) {
      return await this.simulate(delegatorAddress, [undelegateMsg]);
    } else if (fee) {
      return await this.signAndBroadcastTx(delegatorAddress, [undelegateMsg], fee, memo);
    }
  }

  private async _withdrawRewards(
    delegatorAddress: string,
    validatorAddresses: string[],
    simulate: boolean,
    fee?: number | StdFee | 'auto',
    memo?: string,
  ) {
    const msg = validatorAddresses.map((validatorAddress) => {
      return {
        typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
        value: {
          delegatorAddress: delegatorAddress,
          validatorAddress: validatorAddress,
        },
      };
    });
    if (simulate && !fee) {
      return await this.simulate(delegatorAddress, msg);
    } else if (fee) {
      return await this.signAndBroadcastTx(
        delegatorAddress,
        msg,
        fee ?? {
          amount: DEFAULT_STD_FEE.amount.map((amt) => ({
            amount: new BigNumber(amt.amount).multipliedBy(1.2).toString(),
            denom: amt.denom,
          })),
          gas: new BigNumber(DEFAULT_STD_FEE.gas).multipliedBy(1.2).toString(),
        },
        memo,
      );
    }
  }

  async broadcastTx(txRaw: any, retry = 3): Promise<string> {
    try {
      const txResponse: any = await this.txRestClient.broadcast(txRaw);
      return txResponse.txHash;
    } catch (error: any) {
      if (error && error.toString().includes("Cannot read properties of undefined (reading 'code')") && retry > 0) {
        await sleep(1000);
        return this.broadcastTx(txRaw, retry - 1);
      }
      throw new Error(error);
    }
  }

  async signTx(signerAddress: string, msgs: EncodeObject[], fee: StdFee | 'auto' | number, memo = '') {
    try {
      const usedFee = await this.getFees(signerAddress, msgs, fee);
      const { txRaw, signBytes, signDoc } = await this.createTx(signerAddress, msgs, usedFee, memo);

      if (!(this.wallet instanceof EthWallet)) {
        const _signDoc = createCosmosSignDocFromTransaction({
          txRaw,
          chainId: signDoc.getChainId(),
          accountNumber: signDoc.getAccountNumber(),
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const signedTx = await this.wallet.signDirect(signerAddress, _signDoc);
        const _txRaw = createTxRawFromSigResponse(signedTx);
        return _txRaw;
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const rawSignature = await this.wallet?.sign(signerAddress, keccak256(signBytes));
        const _splitSignature = splitSignature(rawSignature);
        const signature = arrayify(concat([_splitSignature.r, _splitSignature.s]));
        txRaw.setSignaturesList([signature]);
        return txRaw;
      }
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async fetchAccountDetails(address: string): Promise<AccountDetails> {
    try {
      const data = await this.chainRestAuthApi.fetchAccount(address);

      const baseAccount = (data as InjectiveAccountRestResponse).account.base_account;

      return {
        address: baseAccount.address,
        accountNumber: baseAccount.account_number,
        sequence: baseAccount.sequence,
        pubKey: {
          type: baseAccount.pub_key ? baseAccount.pub_key['@type'] : '',
          key: baseAccount.pub_key ? baseAccount.pub_key.key : '',
        },
      } as AccountDetails;
    } catch (e) {
      throw new Error((e as any).message);
    }
  }

  async getFees(signerAddress: string, msgs: EncodeObject[], fee: StdFee | 'auto' | number) {
    let usedFee: StdFee;
    if (fee === 'auto' || typeof fee === 'number') {
      if (!this.options?.gasPrice) {
        throw new Error('Gas price must be set in the client options when auto gas is used.');
      }
      const gasEstimation = await this.simulate(signerAddress, msgs);
      const multiplier = fee !== 'auto' ? fee : 1.3;
      if (!gasEstimation) {
        throw new Error('unable to get gas estimate');
      }
      usedFee = calculateFee(Math.round(gasEstimation * multiplier), this.options?.gasPrice);
    } else {
      usedFee = fee;
    }
    return {
      amount: usedFee.amount.map((amount) => amount),
      gas: usedFee.gas,
    };
  }

  async createTx(signerAddress: string, msgs: EncodeObject[], fee: StdFee, memo = '') {
    const accountDetails = await fetchAccountDetails(this.restEndpoint, signerAddress);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const walletAccount = !(this.wallet instanceof EthWallet)
      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        await this.wallet.getAccounts(this.testnet ? 'injective-888' : 'injective-1')
      : this.wallet.getAccounts();
    const pubkey = walletAccount[0].pubkey;

    const signerData: SignerData = {
      accountNumber: parseInt(accountDetails.accountNumber, 10),
      chainId: ChainInfos.injective.chainId,
      sequence: parseInt(accountDetails.sequence, 10),
    };

    const message = msgs.map((msg) => {
      switch (msg.typeUrl) {
        case MsgTypes.IBCTRANSFER:
          return new MsgTransfer(msg.value).toDirectSign();
        case MsgTypes.GOV:
          return new MsgVote(msg.value).toDirectSign();
        case MsgTypes.DELEGATE:
          return new MsgDelegate(msg.value).toDirectSign();
        case MsgTypes.UNDELEGAGE:
          return new MsgUndelegate(msg.value).toDirectSign();
        case MsgTypes.REDELEGATE:
          return new MsgBeginRedelegate(msg.value).toDirectSign();
        case MsgTypes.WITHDRAW_REWARD:
          return new MsgWithdrawDelegatorReward(msg.value).toDirectSign();
        case MsgTypes.GRANT:
          return new MsgGrant(msg.value).toDirectSign();
        case MsgTypes.REVOKE:
          return new MsgRevoke(msg.value).toDirectSign();
        default:
          return new MsgSend(msg.value).toDirectSign();
      }
    });

    const pubKey = toBase64(Secp256k1.compressPubkey(pubkey));

    const tx = createTransaction({
      memo,
      pubKey: pubKey,
      chainId: this.testnet ? 'injective-888' : 'injective-1',
      message,
      sequence: signerData.sequence,
      fee: fee as StdFee,
      accountNumber: signerData.accountNumber,
    });

    return tx;
  }
}
