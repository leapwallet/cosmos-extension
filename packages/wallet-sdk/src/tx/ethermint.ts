/* eslint-disable @typescript-eslint/no-unused-vars */
import { Coin as StargateCoin } from '@cosmjs/amino/build/coins';
import { fromBase64 } from '@cosmjs/encoding';
import { Coin, DeliverTxResponse, StdFee, TimeoutError } from '@cosmjs/stargate';
import { arrayify, concat, splitSignature } from '@ethersproject/bytes';
import { serialize } from '@ethersproject/transactions';
import { EthWallet } from '@leapwallet/leap-keychain';
import { bech32 } from 'bech32';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { Fee, SignDoc, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import dayjs from 'dayjs';
import { keccak256 } from 'ethereumjs-util';
import { ethers } from 'ethers';

import { fetchAccountDetails } from '../accounts';
import { axiosWrapper } from '../healthy-nodes';
import { LeapKeystoneSignerEth } from '../keystone';
import { LeapLedgerSignerEth } from '../ledger';
import { ExtensionOptionsWeb3Tx } from '../proto/ethermint/web3';
import { getClientState } from '../utils';
import { sleep } from '../utils/sleep';
import distributionAbi from './evmos-abi/distribution';
import erc20Abi from './evmos-abi/erc20';
import icsAbi from './evmos-abi/ics';
import stakingAbi from './evmos-abi/staking';
import {
  createMessageSend,
  createTxIBCMsgTransfer,
  createTxMsgBeginRedelegate,
  createTxMsgDelegate,
  createTxMsgGenericRevoke,
  createTxMsgMultipleDelegate,
  createTxMsgMultipleWithdrawDelegatorReward,
  createTxMsgStakeAuthorization,
  createTxMsgStakeRevokeAuthorization,
  createTxMsgUndelegate,
  createTxMsgVote,
  createTxRaw,
  createTxRawEIP712,
  MSG_DELEGATE,
} from './msgs/ethermint';
import { fromEthSignature } from './utils';

type SignIbcArgs = {
  fromAddress: string;
  toAddress: string;
  transferAmount: StargateCoin;
  sourcePort: string;
  sourceChannel: string;
  timeoutHeight: Height | undefined;
  timeoutTimestamp: number | undefined;
  fee: StdFee;
  memo: string | undefined;
  txMemo?: string;
};

type SignSendArgs = {
  fromAddress: string;
  toAddress: string;
  amount: Coin[];
  fee: StdFee;
  memo: string;
};

type SignVoteArgs = {
  fromAddress: string;
  proposalId: string;
  option: VoteOption;
  fee: StdFee;
  memo: string;
};

type SignDelegateArgs = {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Coin;
  fee: StdFee;
  memo: string;
};

type signGrantRestakeArgs = {
  fromAddress: string;
  stakeAuthorization: {
    botAddress: string;
    validatorAddress: string;
    expiryDate: string;
    maxTokens?: {
      denom?: string | undefined;
      amount?: string | undefined;
    };
  };
  fee: StdFee;
  memo: string;
};

type signRevokeRestakeArgs = {
  fromAddress: string;
  grantee: string;
  fee: StdFee;
  memo: string;
};

type signRevokeGrantArgs = {
  msgType: string;
  fromAddress: string;
  grantee: string;
  fee: StdFee;
  memo: string;
};

type signUnDelegateArgs = {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Coin;
  fee: StdFee;
  memo: string;
};

type signWithdrawRewardsArgs = {
  delegatorAddress: string;
  validatorAddresses: string[];
  fee: StdFee;
  memo: string;
};

type signReDelegateArgs = {
  delegatorAddress: string;
  validatorDstAddress: string;
  validatorSrcAddress: string;
  amount: Coin;
  fee: StdFee;
  memo: string;
};

type signClaimAndStakeArgs = {
  delegatorAddress: string;
  validatorsWithRewards: { validator: string; amount: Coin }[];
  fee: StdFee;
  memo: string;
};

const StakingPrecompileAddress = '0x0000000000000000000000000000000000000800';
const DistributionPrecompileAddress = '0x0000000000000000000000000000000000000801';
const ICS20PrecompileAddress = '0x0000000000000000000000000000000000000802';
const erc20aevmosPrecompileAddress = '0xD4949664cD82660AaE99bEdc034a0deA8A0bd517';
const evmosRpcUrl = 'https://evmos-evm.publicnode.com';
const provider = new ethers.providers.JsonRpcProvider(evmosRpcUrl);
const stakingContract = new ethers.Contract(StakingPrecompileAddress, stakingAbi);
const icsContract = new ethers.Contract(ICS20PrecompileAddress, icsAbi);
const erc20Contract = new ethers.Contract(erc20aevmosPrecompileAddress, erc20Abi);
const distributionContract = new ethers.Contract(DistributionPrecompileAddress, distributionAbi);

function bech32ToEthAddress(bech32Address: string): string {
  const { words } = bech32.decode(bech32Address);
  const data = bech32.fromWords(words);
  return ethers.utils.hexlify(data);
}

export class EthermintTxHandler {
  protected chain;

  constructor(
    private restUrl: string,
    protected wallet: EthWallet | LeapLedgerSignerEth | LeapKeystoneSignerEth,
    chainId?: string,
    evmChainId?: string,
  ) {
    this.chain = {
      chainId: evmChainId ? parseInt(evmChainId) : 9001,
      cosmosChainId: chainId ? chainId : 'evmos_9001-2',
    };
  }

  protected static getFeeObject(fee: StdFee) {
    return {
      amount: fee.amount[0].amount,
      denom: fee.amount[0].denom,
      gas: fee.gas,
    };
  }

  async sign(signerAddress: string, accountNumber: number, tx: any) {
    if (this.wallet instanceof LeapLedgerSignerEth) {
      const signature = await (this.wallet as LeapLedgerSignerEth).signEip712(signerAddress, tx.eipToSign);

      const extension = {
        typeUrl: '/ethermint.types.v1.ExtensionOptionsWeb3Tx',
        value: ExtensionOptionsWeb3Tx.encode(
          ExtensionOptionsWeb3Tx.fromPartial({
            typedDataChainId: BigInt(this.chain.chainId.toString()),
            feePayer: signerAddress,
            feePayerSig: fromEthSignature(signature),
          }),
        ).finish(),
      };
      tx.legacyAmino.body.extensionOptions = [extension];
      const body = TxBody.fromPartial(tx.legacyAmino.body);
      const txRaw = createTxRawEIP712(body, tx.legacyAmino.authInfo);

      return Buffer.from(txRaw as Uint8Array).toString('base64');
    }

    if (this.wallet instanceof LeapKeystoneSignerEth || this.wallet.constructor.name === 'LeapKeystoneSignerEth') {
      const _wallet = this.wallet as LeapKeystoneSignerEth;
      const signature = await _wallet.signEip712(signerAddress, tx.eipToSign);

      const extension = {
        typeUrl: '/ethermint.types.v1.ExtensionOptionsWeb3Tx',
        value: ExtensionOptionsWeb3Tx.encode(
          ExtensionOptionsWeb3Tx.fromPartial({
            typedDataChainId: BigInt(this.chain.chainId.toString()),
            feePayer: signerAddress,
            feePayerSig: fromEthSignature(signature),
          }),
        ).finish(),
      };
      tx.legacyAmino.body.extensionOptions = [extension];
      const body = TxBody.fromPartial(tx.legacyAmino.body);
      const txRaw = createTxRawEIP712(body, tx.legacyAmino.authInfo);

      return Buffer.from(txRaw as Uint8Array).toString('base64');
    }

    if (!(this.wallet instanceof EthWallet)) {
      const signDoc = SignDoc.fromPartial({
        authInfoBytes: tx.signDirect.authInfo.serializeBinary(),
        bodyBytes: tx.signDirect.body.serializeBinary(),
        chainId: this.chain.cosmosChainId,
        accountNumber: accountNumber,
      });
      const signedData = await (this.wallet as any).signDirect(signerAddress, signDoc);
      const txRaw = createTxRaw(tx.signDirect.body.serializeBinary(), tx.signDirect.authInfo.serializeBinary(), [
        fromBase64(signedData.signature.signature),
      ]);
      return Buffer.from(txRaw.value).toString('base64');
    } else {
      const dataToSign = `0x${Buffer.from(tx.signDirect.signBytes, 'base64').toString('hex')}`;

      const rawSignature = this.wallet.sign(signerAddress, dataToSign);
      const _splitSignature = splitSignature(rawSignature);
      const txRaw = createTxRaw(tx.signDirect.body.serializeBinary(), tx.signDirect.authInfo.serializeBinary(), [
        arrayify(concat([_splitSignature.r, _splitSignature.s])),
      ]);
      return Buffer.from(txRaw.value).toString('base64');
    }
  }

  async signAndBroadcast(signerAddress: string, accountNumber: number, tx: any) {
    const txRaw = await this.sign(signerAddress, accountNumber, tx);
    return this.broadcastTx(txRaw);
  }

  async broadcastTx(signedTx: any): Promise<string> {
    const baseURL = this.restUrl;
    const { data: result } = await axiosWrapper({
      baseURL,
      method: 'post',
      url: '/cosmos/tx/v1beta1/txs',
      data: JSON.stringify({
        tx_bytes: signedTx,
        mode: 2,
      }),
    });

    const txResponse = result.tx_response;
    if (txResponse?.code) {
      throw new Error(txResponse.raw_log);
    }
    return txResponse.txhash;
  }

  async pollForTx(txHash: string, timeout = 40000, pollcount = 0): Promise<DeliverTxResponse> {
    const limit = 20;
    const timedOut = pollcount > limit;
    if (timedOut) {
      throw new TimeoutError(
        `Transaction with ID ${txHash} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
          timeout / 1000
        } seconds.`,
        txHash,
      );
    }
    const baseURL = this.restUrl;
    await sleep(2000);
    let result;

    try {
      if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
        const { data } = await axiosWrapper({
          baseURL: evmosRpcUrl,
          method: 'post',
          data: { jsonrpc: '2.0', method: 'eth_getTransactionReceipt', params: [txHash], id: 100 },
        });
        result = {
          code: parseInt(data?.result?.status) === 1 ? 0 : 1,
          height: parseInt(data?.result?.blockNumber),
          rawLog: data?.result?.logs,
          gasUsed: parseInt(data?.result?.gasUsed),
        };
      } else {
        const { data } = await axiosWrapper({ baseURL, method: 'get', url: `/cosmos/tx/v1beta1/txs/${txHash}` });
        result = data;
      }
    } catch (_) {
      return this.pollForTx(txHash, timeout, pollcount + 1);
    }

    const txResponse = result?.tx_response;
    if (txResponse?.code) {
      return this.pollForTx(txHash, timeout, pollcount + 1);
    }
    return {
      code: result?.code,
      height: result?.height,
      rawLog: result?.rawLog,
      transactionHash: txHash,
      gasUsed: result?.gasUsed,
      gasWanted: result?.gasWanted,
      events: result?.events,
    };
  }

  protected async getSender(address: string, pubkey: string) {
    const account = await fetchAccountDetails(this.restUrl ?? '', address);

    return {
      accountAddress: address,
      sequence: parseInt(account.sequence),
      accountNumber: parseInt(account.accountNumber),
      pubkey,
    };
  }

  async signIbcTx({
    fromAddress,
    toAddress,
    transferAmount,
    sourcePort,
    sourceChannel,
    timeoutTimestamp = undefined,
    fee,
    memo,
    txMemo,
  }: SignIbcArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const clientState = await getClientState(this.restUrl ?? '', sourceChannel, sourcePort);
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: fromAddress,
    });

    const tx = createTxIBCMsgTransfer(this.chain, sender, stdFee, memo ?? '', {
      sourcePort,
      sourceChannel,
      amount: transferAmount.amount,
      denom: transferAmount.denom,
      receiver: toAddress,
      memo: txMemo ?? '',
      revisionHeight:
        parseInt(clientState?.data?.identified_client_state.client_state.latest_height.revision_height ?? '0') + 200,
      revisionNumber: parseInt(
        clientState?.data?.identified_client_state.client_state.latest_height.revision_number ?? '0',
      ),
      timeoutTimestamp: timeoutTimestamp
        ? ((timeoutTimestamp + 100_000) * 1_000_000_000).toString()
        : ((Date.now() + 1_000_000) * 1_000_000).toString(),
    });

    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async sendIBCTokens(
    fromAddress: string,
    toAddress: string,
    transferAmount: StargateCoin,
    sourcePort: string,
    sourceChannel: string,
    timeoutHeight: Height | undefined,
    timeoutTimestamp: number | undefined,
    fee: StdFee,
    memo: string | undefined,
    txMemo: string = '',
  ) {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const ethSenderAddress = bech32ToEthAddress(fromAddress);
      const clientState = await getClientState(this.restUrl ?? '', sourceChannel, sourcePort);
      const tx = await icsContract.populateTransaction.transfer(
        sourcePort,
        sourceChannel,
        transferAmount.denom,
        ethers.BigNumber.from(transferAmount.amount),
        ethSenderAddress,
        toAddress,
        {
          revisionNumber: ethers.BigNumber.from(
            clientState?.data?.identified_client_state.client_state.latest_height.revision_number ?? '0',
          ),
          revisionHeight: ethers.BigNumber.from(
            clientState?.data?.identified_client_state.client_state.latest_height.revision_height ?? '0',
          ).add(200),
        },
        timeoutTimestamp
          ? ((timeoutTimestamp + 100_000) * 1_000_000_000).toString()
          : ((Date.now() + 1_000_000) * 1_000_000).toString(),
        memo,
      );
      return this.signAndBroadcastEvmosLedgerTx(tx, fromAddress, fee);
    } else {
      const txRaw = await this.signIbcTx({
        fromAddress,
        toAddress,
        transferAmount,
        sourcePort,
        sourceChannel,
        timeoutHeight,
        timeoutTimestamp,
        fee,
        memo,
        txMemo,
      });

      return this.broadcastTx(txRaw);
    }
  }

  async getTargetAccount(fromAddress: string) {
    const walletAccount = await this.wallet.getAccounts();
    return walletAccount.find((account) => account.address === fromAddress) || walletAccount[0];
  }

  async signSendTx({ fromAddress, toAddress, amount, fee, memo }: SignSendArgs) {
    const walletAccount = await this.getTargetAccount(fromAddress);

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount.pubkey).toString('base64'));

    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: fromAddress,
    });

    const tx = createMessageSend(this.chain, sender, stdFee, memo, {
      destinationAddress: toAddress,
      amount: amount[0].amount,
      denom: amount[0].denom,
    });

    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async sendTokens(fromAddress: string, toAddress: string, amount: Coin[], fee: StdFee, memo = '') {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const ethToAddress = bech32ToEthAddress(toAddress);
      const tx = await erc20Contract.populateTransaction.transfer(
        ethToAddress,
        ethers.BigNumber.from(amount[0].amount),
      );
      const gasLimit = await provider.estimateGas(tx);
      const gasAmount: Coin = {
        amount: ethers.BigNumber.from(fee.amount[0].amount).div(fee.gas).mul(gasLimit).toString(),
        denom: fee.amount[0].denom,
      };
      return this.signAndBroadcastEvmosLedgerTx(tx, fromAddress, {
        ...fee,
        gas: gasLimit.toString(),
        amount: [gasAmount],
      });
    } else {
      const txRaw = await this.signSendTx({ fromAddress, toAddress, amount, fee, memo });
      return this.broadcastTx(txRaw);
    }
  }

  async signVoteTx({ fromAddress, proposalId, option, fee, memo }: SignVoteArgs) {
    const walletAccount = await this.getTargetAccount(fromAddress);

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount.pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: fromAddress,
    });
    const tx = createTxMsgVote(this.chain, sender, stdFee, memo, {
      proposalId: parseInt(proposalId),
      option,
    });
    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async vote(fromAddress: string, proposalId: string, option: VoteOption, fee: StdFee, memo = '') {
    const txRaw = await this.signVoteTx({ fromAddress, proposalId, option, fee, memo });
    return this.broadcastTx(txRaw);
  }

  async signDelegateTx({ delegatorAddress, validatorAddress, amount, fee, memo }: SignDelegateArgs) {
    const walletAccount = await this.getTargetAccount(delegatorAddress);

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount.pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgDelegate(this.chain, sender, stdFee, memo, {
      validatorAddress,
      amount: amount.amount,
      denom: amount.denom,
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async delegate(delegatorAddress: string, validatorAddress: string, amount: Coin, fee: StdFee, memo = '') {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const ethDelegatorAddress = bech32ToEthAddress(delegatorAddress);
      const tx = await stakingContract.populateTransaction.delegate(
        ethDelegatorAddress,
        validatorAddress,
        ethers.BigNumber.from(amount.amount),
      );
      return this.signAndBroadcastEvmosLedgerTx(tx, delegatorAddress, fee);
    } else {
      const txRaw = await this.signDelegateTx({ delegatorAddress, validatorAddress, amount, fee, memo });
      return this.broadcastTx(txRaw);
    }
  }

  async signGrantRestakeTx({
    fromAddress,
    fee,
    memo,
    stakeAuthorization: { botAddress, validatorAddress, expiryDate, maxTokens },
  }: signGrantRestakeArgs) {
    const walletAccount = await this.getTargetAccount(fromAddress);

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount.pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: fromAddress,
    });

    const tx = createTxMsgStakeAuthorization(this.chain, sender, stdFee, memo, {
      bot_address: botAddress,
      validator_address: validatorAddress,
      duration_in_seconds: dayjs(expiryDate).unix(),
      maxTokens: maxTokens?.amount,
      denom: stdFee.amount[0].denom,
    });
    return this.sign(fromAddress, sender.accountNumber, tx);
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
    memo = '',
  ) {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const tx = await stakingContract.populateTransaction.approve(
        bech32ToEthAddress(validatorAddress),
        ethers.BigNumber.from(maxTokens?.amount ?? '0'),
        [MSG_DELEGATE],
      );
      return this.signAndBroadcastEvmosLedgerTx(tx, fromAddress, fee);
    } else {
      const txRaw = await this.signGrantRestakeTx({
        fromAddress,
        fee,
        memo,
        stakeAuthorization: {
          botAddress,
          validatorAddress,
          expiryDate,
          maxTokens,
        },
      });
      return this.broadcastTx(txRaw);
    }
  }

  async signRevokeRestakeTx({ fromAddress, grantee, fee, memo }: signRevokeRestakeArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: fromAddress,
    });
    const tx = createTxMsgStakeRevokeAuthorization(this.chain, sender, stdFee, memo, {
      bot_address: grantee,
    });
    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async revokeRestake(fromAddress: string, grantee: string, fee: StdFee, memo = '') {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const ethGranteeAddress = bech32ToEthAddress(grantee);
      const tx = await stakingContract.populateTransaction.revoke(ethGranteeAddress, [MSG_DELEGATE]);
      return this.signAndBroadcastEvmosLedgerTx(tx, fromAddress, fee);
    } else {
      const txRaw = await this.signRevokeRestakeTx({ fromAddress, grantee, fee, memo });
      return this.broadcastTx(txRaw);
    }
  }

  async signRevokeGrantTx({ msgType, fee, fromAddress, grantee, memo }: signRevokeGrantArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: fromAddress,
    });
    const tx = createTxMsgGenericRevoke(this.chain, sender, stdFee, memo ?? '', {
      botAddress: grantee,
      typeUrl: msgType,
    });
    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async revokeGrant(msgType: string, fromAddress: string, grantee: string, fee: StdFee, memo = '') {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const ethGranteeAddress = bech32ToEthAddress(grantee);
      const tx = await stakingContract.populateTransaction.revoke(ethGranteeAddress, [msgType]);
      return this.signAndBroadcastEvmosLedgerTx(tx, fromAddress, fee);
    } else {
      const txRaw = await this.signRevokeGrantTx({ msgType, fromAddress, grantee, fee, memo });
      return this.broadcastTx(txRaw);
    }
  }

  async signUnDelegateTx({ amount, delegatorAddress, fee, memo, validatorAddress }: signUnDelegateArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgUndelegate(this.chain, sender, stdFee, memo ?? '', {
      validatorAddress,
      amount: amount.amount,
      denom: amount.denom,
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async unDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin, fee: StdFee, memo = '') {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const ethDelegatorAddress = bech32ToEthAddress(delegatorAddress);
      const tx = await stakingContract.populateTransaction.undelegate(
        ethDelegatorAddress,
        validatorAddress,
        ethers.BigNumber.from(amount.amount),
      );
      return this.signAndBroadcastEvmosLedgerTx(tx, delegatorAddress, fee);
    } else {
      const txRaw = await this.signUnDelegateTx({ delegatorAddress, validatorAddress, amount, fee, memo });
      return this.broadcastTx(txRaw);
    }
  }

  async signWithdrawRewardsTx({ delegatorAddress, fee, memo, validatorAddresses }: signWithdrawRewardsArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgMultipleWithdrawDelegatorReward(this.chain, sender, stdFee, memo ?? '', {
      validatorAddresses,
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async withdrawRewards(delegatorAddress: string, validatorAddresses: string[], fee: StdFee, memo = '') {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const ethDelegatorAddress = bech32ToEthAddress(delegatorAddress);
      const tx = await distributionContract.populateTransaction.withdrawDelegatorRewards(
        ethDelegatorAddress,
        validatorAddresses[0],
      );
      return this.signAndBroadcastEvmosLedgerTx(tx, delegatorAddress, fee);
    } else {
      const txRaw = await this.signWithdrawRewardsTx({ delegatorAddress, validatorAddresses, fee, memo });
      return this.broadcastTx(txRaw);
    }
  }

  async signReDelegateTx({
    amount,
    delegatorAddress,
    fee,
    memo,
    validatorDstAddress,
    validatorSrcAddress,
  }: signReDelegateArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgBeginRedelegate(this.chain, sender, stdFee, memo ?? '', {
      validatorSrcAddress,
      validatorDstAddress,
      amount: amount.amount,
      denom: amount.denom,
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async reDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    fee: StdFee,
    memo = '',
  ) {
    if (this.chain.cosmosChainId === 'evmos_9001-2' && this.wallet instanceof LeapLedgerSignerEth) {
      const ethDelegatorAddress = bech32ToEthAddress(delegatorAddress);
      const tx = await stakingContract.populateTransaction.redelegate(
        ethDelegatorAddress,
        validatorSrcAddress,
        validatorDstAddress,
        ethers.BigNumber.from(amount.amount),
      );
      return this.signAndBroadcastEvmosLedgerTx(tx, delegatorAddress, fee);
    } else {
      const txRaw = await this.signReDelegateTx({
        delegatorAddress,
        validatorDstAddress,
        validatorSrcAddress,
        amount,
        fee,
        memo,
      });
      return this.broadcastTx(txRaw);
    }
  }

  async signClaimAndStakeTx({ delegatorAddress, fee, memo, validatorsWithRewards }: signClaimAndStakeArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgMultipleDelegate(this.chain, sender, stdFee, memo ?? '', {
      values: validatorsWithRewards.map((validatorWithReward) => ({
        validatorAddress: validatorWithReward.validator,
        amount: validatorWithReward.amount.amount,
        denom: validatorWithReward.amount.denom,
      })),
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async claimAndStake(
    delegatorAddress: string,
    validatorsWithRewards: { validator: string; amount: Coin }[],
    fee: StdFee,
    memo = '',
  ) {
    const txRaw = await this.signClaimAndStakeTx({ delegatorAddress, fee, memo, validatorsWithRewards });
    return this.broadcastTx(txRaw);
  }

  async signAndBroadcastEvmosLedgerTx(tx: ethers.PopulatedTransaction, sender: string, fee: StdFee) {
    try {
      const ethSenderAddress = bech32ToEthAddress(sender);
      tx.chainId = this.chain.chainId;
      tx.nonce = await provider.getTransactionCount(ethSenderAddress);
      tx.gasLimit = ethers.BigNumber.from(fee.gas);
      tx.gasPrice = ethers.BigNumber.from(parseInt(fee.amount[0].amount) / parseInt(fee.gas));
      const hash = keccak256(Buffer.from(serialize(tx).replace('0x', ''), 'hex'));
      const signature = await (this.wallet as LeapLedgerSignerEth).sign(sender, hash);
      const v = Number(signature.v) - 27;

      const formattedSignature = concat([
        signature.r,
        signature.s,
        v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
      ]);
      const signedtx = ethers.utils.serializeTransaction(tx, formattedSignature);
      const txResponse = await provider.sendTransaction(signedtx);
      const receipt = await txResponse.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.log(error?.message);
      console.log(error);
      return '';
    }
  }
}
