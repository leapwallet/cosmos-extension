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
import { arrayify, concat, joinSignature, SignatureLike, splitSignature } from '@ethersproject/bytes';
import {
  ChainRestAuthApi,
  ChainRestTendermintApi,
  createSignDocFromTransaction,
  createTransaction,
  createTxRawEIP712,
  createTxRawFromSigResponse,
  createWeb3Extension,
  DEFAULT_STD_FEE,
  getEip712TypedData,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgExecuteContract,
  MsgExecuteContractCompat,
  MsgGrant,
  MsgRevoke,
  MsgSend,
  MsgTransfer,
  MsgUndelegate,
  MsgVote,
  MsgWithdrawDelegatorReward,
  SIGN_AMINO,
  TxClient,
  TxRestClient,
} from '@injectivelabs/sdk-ts';
import { EthWallet } from '@leapwallet/leap-keychain';
import BigNumber from 'bignumber.js';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import { keccak256 } from 'ethereumjs-util';

import { fetchAccountDetails } from '../accounts';
import { ChainInfos } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { LeapLedgerSignerEth } from '../ledger';
import { getClientState, getRestUrl, sleep } from '../utils';
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
  MSG_EXECUTE_CONTRACT = '/cosmwasm.wasm.v1.MsgExecuteContract',
}

export class InjectiveTx {
  chainRestAuthApi: ChainRestAuthApi;

  txRestClient: TxRestClient;
  restEndpoint: string;
  options?: {
    gasPrice: GasPrice;
  };
  chainId: string;
  evmChainId: number;

  constructor(private testnet: boolean, private wallet: EthWallet | LeapLedgerSignerEth, restEndpoint?: string) {
    this.restEndpoint = restEndpoint ?? getRestUrl(ChainInfos, 'injective', testnet);
    this.chainRestAuthApi = new ChainRestAuthApi(this.restEndpoint);
    this.txRestClient = new TxRestClient(this.restEndpoint);
    this.chainId = testnet ? ChainInfos.injective.testnetChainId ?? 'injective-888' : 'injective-1';
    this.evmChainId = testnet
      ? parseInt(ChainInfos.injective.evmChainIdTestnet ?? '888')
      : parseInt(ChainInfos.injective.evmChainId ?? '1');
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
    _: number | undefined,
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
      const response = await axiosWrapper({
        baseURL: this.restEndpoint,
        url: 'cosmos/tx/v1beta1/txs',
        method: 'post',
        data: {
          tx_bytes: TxClient.encode(txRaw),
          mode: 2,
        },
      });
      const txResponse = response.data.tx_response;
      return txResponse.txhash;
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
      if (this.wallet instanceof LeapLedgerSignerEth) {
        const wallet = this.wallet as LeapLedgerSignerEth;
        const { eip712Tx, txRaw } = await this.createEip712Tx(signerAddress, msgs, usedFee, memo);
        const signature = await wallet.signEip712(signerAddress, eip712Tx);
        const signatureStr = joinSignature(signature as SignatureLike);
        const signatureBuffer = Buffer.from(signatureStr.replace('0x', ''), 'hex');
        const web3Extension = createWeb3Extension({ ethereumChainId: this.testnet ? 888 : 1 });
        const txRawEip712 = createTxRawEIP712(txRaw, web3Extension);
        txRawEip712.signatures.push(signatureBuffer);
        return txRawEip712;
      }
      const { txRaw, signBytes, signDoc } = await this.createTx(signerAddress, msgs, usedFee, memo);

      if (!(this.wallet instanceof EthWallet)) {
        const _signDoc = createSignDocFromTransaction({
          txRaw,
          chainId: signDoc.chainId,
          accountNumber: parseInt(signDoc.accountNumber),
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
        txRaw.signatures.push(signature);
        return txRaw;
      }
    } catch (e: any) {
      throw new Error(e);
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

  async createEip712Tx(signerAddress: string, msgs: EncodeObject[], _fee: StdFee, memo = '') {
    const accountDetails = await fetchAccountDetails(this.restEndpoint, signerAddress);
    const chainRestTendermintApi = new ChainRestTendermintApi(this.restEndpoint);
    const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
    const latestHeight = latestBlock.header.height;
    const formatIbcMessage = (msg: EncodeObject) => {
      return {
        ...msg.value,
        timeout: '8446744073709551615',
        height: {
          revisionHeight: parseInt(msg.value.height.revisionHeight),
          revisionNumber: parseInt(msg.value.height.revisionNumber),
        },
      };
    };

    const fee = {
      amount: _fee.amount.map((amt) => {
        return {
          amount: amt.amount,
          denom: amt.denom,
        };
      }),
      gas: _fee.gas,
    };

    const messages = msgs.map((msg) => {
      switch (msg.typeUrl) {
        case MsgTypes.IBCTRANSFER:
          return MsgTransfer.fromJSON(formatIbcMessage(msg));
        case MsgTypes.MSG_EXECUTE_CONTRACT:
          return MsgExecuteContractCompat.fromJSON(msg.value);
        case MsgTypes.GOV:
          return MsgVote.fromJSON({ ...msg.value, proposalId: msg.value.proposalId.toInt() });
        case MsgTypes.DELEGATE:
          return MsgDelegate.fromJSON(msg.value);
        case MsgTypes.UNDELEGAGE:
          return MsgUndelegate.fromJSON(msg.value);
        case MsgTypes.REDELEGATE:
          return MsgBeginRedelegate.fromJSON(msg.value);
        case MsgTypes.WITHDRAW_REWARD:
          return MsgWithdrawDelegatorReward.fromJSON(msg.value);
        case MsgTypes.GRANT:
          return MsgGrant.fromJSON(msg.value);
        case MsgTypes.REVOKE:
          return MsgRevoke.fromJSON(msg.value);
        default:
          return MsgSend.fromJSON(msg.value);
      }
    });

    const timeoutHeight = new BigNumber(latestHeight).plus(90);

    const eip712Tx = getEip712TypedData({
      msgs: messages,
      tx: {
        accountNumber: accountDetails.accountNumber.toString(),
        sequence: accountDetails.sequence.toString(),
        chainId: this.chainId,
        timeoutHeight: timeoutHeight.toString(),
        memo,
      },
      fee,
      ethereumChainId: this.evmChainId,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const index = eip712Tx.types.MsgValue.findIndex((value) => value.name === 'timeout_timestamp');
    if (index > -1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      eip712Tx.types.MsgValue[index].type = 'uint64';
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const memoIndex = eip712Tx.types.MsgValue.findIndex((value) => value.name === 'memo');
    if (!eip712Tx.message.msgs.every((msg) => msg.value.memo) && memoIndex > -1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      eip712Tx.types.MsgValue.splice(memoIndex, 1);
    }

    const signerData: SignerData = {
      accountNumber: parseInt(accountDetails.accountNumber, 10),
      chainId: ChainInfos.injective.chainId,
      sequence: parseInt(accountDetails.sequence, 10),
    };

    const wallet = this.wallet as unknown as LeapLedgerSignerEth;
    const accounts = await wallet.getAccounts();

    const pubKey = toBase64(Secp256k1.compressPubkey(accounts[0].pubkey));

    const { txRaw } = createTransaction({
      message: messages,
      memo,
      signMode: SIGN_AMINO,
      pubKey,
      sequence: signerData.sequence,
      timeoutHeight: timeoutHeight.toNumber(),
      accountNumber: signerData.accountNumber,
      chainId: this.chainId,
      fee,
    });

    return { eip712Tx, txRaw };
  }

  async createTx(signerAddress: string, msgs: EncodeObject[], fee: StdFee, memo = '') {
    const accountDetails = await fetchAccountDetails(this.restEndpoint, signerAddress);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const walletAccount = !(this.wallet instanceof EthWallet)
      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        await this.wallet.getAccounts(this.chainId)
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
          return new MsgTransfer(msg.value);
        case MsgTypes.MSG_EXECUTE_CONTRACT:
          return new MsgExecuteContract(msg.value);
        case MsgTypes.GOV:
          return new MsgVote(msg.value);
        case MsgTypes.DELEGATE:
          return new MsgDelegate(msg.value);
        case MsgTypes.UNDELEGAGE:
          return new MsgUndelegate(msg.value);
        case MsgTypes.REDELEGATE:
          return new MsgBeginRedelegate(msg.value);
        case MsgTypes.WITHDRAW_REWARD:
          return new MsgWithdrawDelegatorReward(msg.value);
        case MsgTypes.GRANT:
          return new MsgGrant(msg.value);
        case MsgTypes.REVOKE:
          return new MsgRevoke(msg.value);
        default:
          return new MsgSend(msg.value);
      }
    });

    const pubKey = toBase64(Secp256k1.compressPubkey(pubkey));

    const tx = createTransaction({
      memo,
      pubKey: pubKey,
      chainId: this.chainId,
      message,
      sequence: signerData.sequence,
      fee: fee as StdFee,
      accountNumber: signerData.accountNumber,
    });

    return tx;
  }
}
