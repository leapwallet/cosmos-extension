import type { AminoSignResponse, StdSignDoc } from '@cosmjs/amino';
import { makeSignDoc as makeSignDocAmino } from '@cosmjs/amino';
import { Secp256k1Signature } from '@cosmjs/crypto';
import { Int53 } from '@cosmjs/math';
import type { OfflineDirectSigner, TxBodyEncodeObject } from '@cosmjs/proto-signing';
import {
  Coin,
  GeneratedType,
  makeAuthInfoBytes,
  makeSignDoc as makeDirectSignDoc,
  OfflineSigner,
  Registry,
} from '@cosmjs/proto-signing';
import {
  AminoConverters,
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
  defaultRegistryTypes,
  SigningStargateClient,
  SigningStargateClientOptions,
  StdFee,
} from '@cosmjs/stargate';
import { arrayify } from '@ethersproject/bytes';
import { EthWallet } from '@leapwallet/leap-keychain';
import { base64, hex } from '@scure/base';
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js';
import { MsgCancelUnbondingDelegation } from 'cosmjs-types/cosmos/staking/v1beta1/tx.js';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { toRpcSig } from 'ethereumjs-util';
import { utils } from 'ethers';

import { fetchAccountDetails } from '../accounts';
import { LeapLedgerSignerEth } from '../ledger';
import { initiaAminoConverters as InitiaAminoConverters } from '../proto/initia/client';
import { initiaProtoRegistry as InitiaRegistry } from '../proto/initia/client';
import {
  encodeEthSecp256k1Pubkey,
  encodeEthSecp256k1Signature,
  encodePubkeyInitia,
  sortedJsonStringify,
} from './encoding/initia-encoding';
import {
  getInitiaCancelUnbondingDelegationMsg,
  getInitiaClaimAndStakeMsg,
  getInitiaDelegateMsg,
  getInitiaRedelegateMsg,
  getInitiaUndelegateMsg,
} from './msgs/initia';
import { Tx } from './tx';

function createDefaultAminoConverters(prefix: string): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(prefix),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createVestingAminoConverters(),
    ...InitiaAminoConverters,
  };
}

const aminoTypes = new AminoTypes(createDefaultAminoConverters('cosmos'));

export class InitiaTx extends Tx {
  constructor(
    rpcEndPoint: string,
    wallet: OfflineSigner,
    private chainId: string,
    options?: SigningStargateClientOptions,
  ) {
    super(rpcEndPoint, wallet, options);

    this.registry = new Registry([
      ...defaultRegistryTypes,
      ...(InitiaRegistry as ReadonlyArray<[string, GeneratedType]>),
    ]);
  }

  async initClient() {
    this.client = await SigningStargateClient.connectWithSigner(this.rpcEndPoint, this.wallet, {
      broadcastPollIntervalMs: this.options?.broadcastPollIntervalMs ?? 5_000,
      aminoTypes,
    });

    this.client.registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant);
    this.client.registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke);
    this.client.registry.register('/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation', MsgCancelUnbondingDelegation);
  }

  async addInitiaRegistry() {
    (InitiaRegistry as ReadonlyArray<[string, GeneratedType]>).forEach((registryEntry) =>
      this.client?.registry.register(registryEntry[0], registryEntry[1]),
    );
  }

  async delegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const delegateMsg = getInitiaDelegateMsg(delegatorAddress, validatorAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [delegateMsg], fees as StdFee, memo);
  }

  async unDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const undelegateMsg = getInitiaUndelegateMsg(delegatorAddress, validatorAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [undelegateMsg], fees as StdFee, memo);
  }

  async reDelegate(
    delegatorAddress: string,
    validatorSrcAddress: string,
    validatorDstAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const redelegateMsg = getInitiaRedelegateMsg(delegatorAddress, validatorSrcAddress, validatorDstAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [redelegateMsg], fees as StdFee, memo);
  }

  async cancelUnDelegation(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    creationHeight: string,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const cancelUnbondingDelegationMsg = getInitiaCancelUnbondingDelegationMsg(
      delegatorAddress,
      validatorAddress,
      amount,
      creationHeight,
    );
    return await this.signAndBroadcastTx(delegatorAddress, [cancelUnbondingDelegationMsg], fees as StdFee, memo);
  }

  async claimAndStake(
    delegatorAddress: string,
    validatorsWithRewards: { validator: string; amount: Coin }[],
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const claimAndStakeMsg = getInitiaClaimAndStakeMsg(delegatorAddress, validatorsWithRewards);
    return await this.signAndBroadcastTx(delegatorAddress, claimAndStakeMsg, fees as StdFee, memo);
  }

  async signEvmTx(signerAddress: string, message: any, fees: number | StdFee | 'auto', memo?: string): Promise<TxRaw> {
    if (!this.wallet) throw new Error('Signer not initialized');
    if (!this.client) throw new Error('Client not initialized');

    if (this.wallet instanceof LeapLedgerSignerEth) {
      const accountDetails = await fetchAccountDetails(this.lcdEndpoint ?? '', signerAddress);
      const { accountNumber, sequence } = accountDetails;

      const [accountFromSigner] = await this.wallet.getAccounts();
      const pubkey = encodePubkeyInitia(encodeEthSecp256k1Pubkey(accountFromSigner.pubkey));
      const signMode = SignMode.SIGN_MODE_EIP_191;
      const msgs = message.map((msg: any) => aminoTypes.toAmino(msg));

      const signDoc = makeSignDocAmino(msgs, fees as StdFee, this.chainId, memo, accountNumber, sequence);

      const { signature, signed } = await signEIP191(signerAddress, signDoc, this.wallet);
      const signedTxBody = {
        messages: signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
        memo,
      };
      const signedTxBodyEncodeObject: TxBodyEncodeObject = {
        typeUrl: '/cosmos.tx.v1beta1.TxBody',
        value: signedTxBody,
      };

      const signedTxBodyBytes = this.registry.encode(signedTxBodyEncodeObject);
      const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
      const signedSequence = Int53.fromString(signed.sequence).toNumber();
      const signedAuthInfoBytes = makeAuthInfoBytes(
        [{ pubkey, sequence: signedSequence }],
        signed.fee.amount,
        signedGasLimit,
        signed.fee.granter,
        signed.fee.payer,
        signMode,
      );
      return TxRaw.fromPartial({
        bodyBytes: signedTxBodyBytes,
        authInfoBytes: signedAuthInfoBytes,
        signatures: [base64.decode(signature.signature)],
      });
    } else {
      const accountDetails = await fetchAccountDetails(this.lcdEndpoint ?? '', signerAddress);
      const { accountNumber, sequence } = accountDetails;

      const accountFromSigner = (await this.wallet.getAccounts()).find((account) => account.address === signerAddress);
      if (!accountFromSigner) {
        throw new Error('Failed to retrieve account from signer');
      }
      const pubkey = encodePubkeyInitia(encodeEthSecp256k1Pubkey(accountFromSigner.pubkey));
      const txBodyEncodeObject: TxBodyEncodeObject = {
        typeUrl: '/cosmos.tx.v1beta1.TxBody',
        value: {
          messages: message,
          memo: memo,
          timeoutHeight: undefined,
        },
      };
      const txBodyBytes = this.registry.encode(txBodyEncodeObject);
      const _fee = fees as StdFee;
      const gasLimit = Int53.fromString(_fee.gas).toNumber();

      const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey, sequence: parseInt(sequence) }],
        _fee.amount,
        gasLimit,
        _fee.granter,
        _fee.payer,
      );
      const signDoc = makeDirectSignDoc(txBodyBytes, authInfoBytes, this.chainId, parseInt(accountNumber));
      const signer = this.wallet as OfflineDirectSigner;
      const { signature, signed } = await signer.signDirect(signerAddress, signDoc);
      return TxRaw.fromPartial({
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        signatures: [base64.decode(signature.signature)],
      });
    }
  }

  async signTx(address: string, message: any, fees: number | StdFee | 'auto', memo?: string): Promise<TxRaw> {
    if (this.wallet instanceof EthWallet || this.wallet instanceof LeapLedgerSignerEth) {
      return await this.signEvmTx(address, message, fees, memo);
    } else {
      return await super.signTx(address, message, fees, memo);
    }
  }

  async signAndBroadcastTx(address: string, message: any, fees: number | StdFee | 'auto', memo?: string) {
    const signedTx = await this.signTx(address, message, fees, memo);
    return await this.broadcastTx(signedTx);
  }
}

export async function signEIP191(
  signerAddress: string,
  signDoc: StdSignDoc,
  signer: LeapLedgerSignerEth,
): Promise<AminoSignResponse> {
  const signDocAminoJSON = sortedJsonStringify(signDoc);
  const account = await signer.getAccounts();
  const messageBytes = utils.toUtf8Bytes(signDocAminoJSON);
  const signatureObj = await signer.signPersonalMessage(signerAddress, messageBytes);

  const rpcSigArgs = {
    v: signatureObj.v,
    r: Buffer.from(arrayify(signatureObj.r)),
    s: Buffer.from(arrayify(signatureObj.s)),
  };
  const signatureHex = toRpcSig(rpcSigArgs.v, rpcSigArgs.r, rpcSigArgs.s);
  const signatureFromHex = hex.decode(signatureHex.replace('0x', '')).subarray(0, -1);
  const secp256signature = Secp256k1Signature.fromFixedLength(signatureFromHex);
  const signatureBytes = secp256signature.toFixedLength();
  const signature = encodeEthSecp256k1Signature(account[0].pubkey, signatureBytes);
  return { signed: signDoc, signature };
}
