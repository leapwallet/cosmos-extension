/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Coin, GeneratedType, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  accountFromAny,
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
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js';
import { MsgCancelUnbondingDelegation } from 'cosmjs-types/cosmos/staking/v1beta1/tx.js';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, SignerInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { fetchAccountDetails } from '../accounts';
import { axiosWrapper } from '../healthy-nodes';
import { Route } from '../proto/noble/swap';
import { MsgClaimYield, MsgSwap } from '../proto/noble/tx';
import { AminoConverter } from '../proto/noble/tx.amino';
import { registry } from '../proto/noble/tx.registry';
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
    ...AminoConverter,
  };
}

export class NobleTx extends Tx {
  constructor(rpcEndPoint: string, wallet: OfflineSigner, options?: SigningStargateClientOptions) {
    super(rpcEndPoint, wallet, options);
    this.registry = new Registry([...defaultRegistryTypes, ...(registry as ReadonlyArray<[string, GeneratedType]>)]);
  }

  async initClient() {
    if (!this.wallet) throw new Error('Wallet not connected');
    this.client = await SigningStargateClient.connectWithSigner(this.rpcEndPoint, this.wallet, {
      broadcastPollIntervalMs: this.options?.broadcastPollIntervalMs ?? 5_000,
      accountParser: (input: any) => {
        return accountFromAny(input);
      },
      aminoTypes: new AminoTypes(createDefaultAminoConverters('cosmos')),
    });
    this.client.registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant);
    this.client.registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke);
    this.client.registry.register('/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation', MsgCancelUnbondingDelegation);
  }

  async addNobleRegistry() {
    (registry as ReadonlyArray<[string, GeneratedType]>).forEach((registryEntry) =>
      this.client?.registry.register(registryEntry[0], registryEntry[1]),
    );
  }

  async swap(signer: string, amount: Coin, routes: Route[], min: Coin, fee: number | StdFee | 'auto', memo = '') {
    const swapMessage = {
      typeUrl: '/noble.swap.v1.MsgSwap',
      value: {
        signer: signer,
        amount: amount,
        routes: routes,
        min: min,
      },
    };

    return await this.signAndBroadcastTx(signer, [swapMessage], fee, memo);
  }

  async claim(signer: string, fee: number | StdFee | 'auto', memo = '') {
    const claimMessage = {
      typeUrl: '/noble.dollar.v1.MsgClaimYield',
      value: {
        signer: signer,
      },
    };

    return await this.signAndBroadcastTx(signer, [claimMessage], fee, memo);
  }
}

async function simulateTx(lcd: string, signerAddress: string, msgs: any[], fee: Omit<StdFee, 'gas'> = { amount: [] }) {
  const account = await fetchAccountDetails(lcd, signerAddress);

  const unsignedTx = TxRaw.encode({
    bodyBytes: TxBody.encode(
      TxBody.fromPartial({
        messages: msgs,
      }),
    ).finish(),
    authInfoBytes: AuthInfo.encode({
      signerInfos: [
        SignerInfo.fromPartial({
          // Pub key is ignored.
          // It is fine to ignore the pub key when simulating tx.
          // However, the estimated gas would be slightly smaller because tx size doesn't include pub key.
          modeInfo: {
            single: {
              mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
            },
            multi: undefined,
          },
          sequence: `${account.sequence}`,
        }),
      ],
      fee: Fee.fromPartial({
        amount: fee.amount.map((amount) => {
          return { amount: amount.amount, denom: amount.denom };
        }),
      }),
    }).finish(),
    signatures: [new Uint8Array(64)],
  }).finish();

  const result = await axiosWrapper({
    baseURL: lcd,
    method: 'post',
    url: '/cosmos/tx/v1beta1/simulate',
    timeout: 20_000,
    data: {
      tx_bytes: Buffer.from(unsignedTx).toString('base64'),
    },
  });

  if (
    result &&
    // @ts-ignore
    (result.code === 'ERR_BAD_RESPONSE' || result.code === 'ERR_BAD_REQUEST') &&
    // @ts-ignore
    result.response &&
    // @ts-ignore
    result.response.data
  ) {
    // @ts-ignore
    throw new Error(result.response.data.message);
  }

  if (result.data?.error) {
    throw new Error(result.data?.error);
  }

  const gasUsed = parseInt(result.data?.gas_info?.gas_used);
  const gasWanted = parseInt(result.data?.gas_info?.gas_wanted);
  const amountOut = parseInt(result.data?.result?.msg_responses?.[0]?.result?.amount);
  if (Number.isNaN(gasUsed)) {
    throw new Error(`Invalid integer gas: ${result.data?.gas_info?.gas_used}`);
  }
  return {
    gasUsed,
    gasWanted,
    amountOut,
  };
}

export async function simulateSwapUSD(lcdEndpoint: string, signer: string, amount: Coin, min: Coin) {
  const pools = await getNobleSwapPools(lcdEndpoint);
  const encodedMsg = {
    typeUrl: '/noble.swap.v1.MsgSwap',
    value: MsgSwap.encode({
      signer: signer,
      amount: amount,
      routes: [{ denomTo: amount.denom === 'uusdc' ? 'uusdn' : 'uusdc', poolId: pools?.[0]?.id }],
      min: min,
    }).finish(),
  };
  return await simulateTx(lcdEndpoint, signer, [encodedMsg]);
}

export async function simulateClaimUSD(lcdEndpoint: string, signer: string) {
  const encodedMsg = {
    typeUrl: '/noble.dollar.v1.MsgClaimYield',
    value: MsgClaimYield.encode({
      signer: signer,
    }).finish(),
  };
  return await simulateTx(lcdEndpoint, signer, [encodedMsg]);
}

export async function getNobleSwapPools(lcdEndpoint: string) {
  const { data } = await axiosWrapper({
    baseURL: lcdEndpoint,
    method: 'GET',
    url: '/noble/swap/v1/pools',
  });

  return data.pools;
}

export async function getNobleClaimYield(lcdEndpoint: string, signer: string) {
  const { data } = await axiosWrapper({
    baseURL: lcdEndpoint,
    method: 'GET',
    url: `/noble/dollar/v1/yield/${signer}`,
  });

  return data;
}
