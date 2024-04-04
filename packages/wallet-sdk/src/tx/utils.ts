import { coin, StdSignDoc } from '@cosmjs/amino';
import { sha256 } from '@cosmjs/crypto';
import { fromBase64, toHex } from '@cosmjs/encoding';
import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import {
  authzTypes,
  bankTypes,
  distributionTypes,
  feegrantTypes,
  govTypes,
  ibcTypes,
  stakingTypes,
  vestingTypes,
} from '@cosmjs/stargate/build/modules';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import Long from 'long';

import { ChainInfos, SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { sleep } from '../utils';

export function getTxHashFromSignedTx({
  authInfoBytes,
  bodyBytes,
  signatures,
}: {
  authInfoBytes: Uint8Array;
  bodyBytes: Uint8Array;
  signatures: Uint8Array[];
}): string {
  const txRaw = TxRaw.encode({
    bodyBytes,
    authInfoBytes,
    signatures,
  }).finish();
  return toHex(sha256(txRaw)).toUpperCase();
}

export function getTxHashFromSignedTxAmino(signedTx: StdSignDoc, signature: any, pubkey: any, chain: SupportedChain) {
  const defaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
    ['/cosmos.base.v1beta1.Coin', Coin],
    ...authzTypes,
    ...bankTypes,
    ...distributionTypes,
    ...feegrantTypes,
    ...govTypes,
    ...stakingTypes,
    ...ibcTypes,
    ...vestingTypes,
  ];

  const registry = new Registry(defaultRegistryTypes);

  const bodyBytes = TxBody.encode(
    TxBody.fromPartial({
      messages: signedTx.msgs.map((msg: any) => registry.encodeAsAny(msg)),
      memo: signedTx.memo,
    }),
  ).finish();

  const signedTxBodyBytes = bodyBytes;
  const signedAuthInfoBytes = AuthInfo.encode({
    signerInfos: [
      {
        publicKey: {
          typeUrl: pubkeyTypeUrl(chain),
          value: PubKey.encode({
            key: pubkey,
          }).finish(),
        },
        sequence: Long.fromNumber(parseInt(signedTx.sequence), true),
        modeInfo: { single: { mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON } },
      },
    ],
    fee: Fee.fromPartial({
      amount: signedTx.fee.amount.map((amount: any) => {
        return { amount: amount.amount, denom: amount.denom };
      }),
      gasLimit: parseInt(signedTx.fee.gas),
    }),
  }).finish();

  const txRaw = TxRaw.encode({
    bodyBytes: signedTxBodyBytes,
    authInfoBytes: signedAuthInfoBytes,
    signatures: [fromBase64(signature)],
  }).finish();

  return toHex(sha256(txRaw)).toUpperCase();
}

function pubkeyTypeUrl(chain: SupportedChain) {
  if (chain === 'injective') {
    return '/injective.crypto.v1beta1.ethsecp256k1.PubKey';
  }

  if (ChainInfos[chain].bip44.coinType === '60') {
    return '/ethermint.crypto.v1.ethsecp256k1.PubKey';
  }
  return '/cosmos.crypto.secp256k1.PubKey';
}

export async function getTxData(txHash: string, lcdUrl: string) {
  try {
    const data = await axiosWrapper({
      baseURL: lcdUrl,
      method: 'get',
      url: `/cosmos/tx/v1beta1/txs/${txHash}`,
    });

    if (data.data.code === 3) {
      return {
        code: data.data.code,
      };
    }
    const result = data.data.tx_response;

    return {
      code: result.code,
      height: result.height,
      rawLog: result.rawLog,
      transactionHash: txHash,
      gasUsed: result.gasUsed,
      gasWanted: result.gasWanted,
    };
  } catch (e) {
    return null;
  }
}

export async function getIBCAcknowledgement(
  originChainLcd: string,
  recevingChainLcd: string,
  transactionHash: string,
  pollCount = 100,
) {
  const { sequence, channelId } = await getIbcTxData(originChainLcd, transactionHash);
  const packetAck = await pollForPacketAck(recevingChainLcd, sequence, channelId, pollCount);

  if (packetAck.data.acknowledgement) {
    return packetAck.data.packet_acknowledgement;
  }
}

export async function getIbcTxData(originChainLcd: string, transactionHash: string) {
  // get the tx data
  const tx = await axiosWrapper({
    baseURL: originChainLcd,
    method: 'get',
    url: `/cosmos/tx/v1beta1/txs/${transactionHash}`,
  });

  const txData = tx.data.tx_response;
  // get the sequence number and port id of the packet
  const sentPckt = txData.logs[0].events.find((event: any) => event.type === 'send_packet');

  const sequence = sentPckt.attributes.find((attr: any) => attr.key === 'packet_sequence').value;
  const channelId = txData.logs
    .find((log: any) => log.msg_index === 0)
    .events.find((event: any) => event.type === 'send_packet')
    .attributes.find((attr: any) => attr.key === 'packet_dst_channel').value;
  const receivingAddress = tx.data.tx.body.messages[0].receiver;

  return { sequence, channelId, receivingAddress };
}

export async function pollForPacketAck(
  receivingChainLcd: string,
  sequence: string,
  channelId: string,
  intervalCount = 10,
): Promise<any> {
  if (intervalCount <= 0) {
    throw new Error('Timeout waiting for acknowledgement');
  }
  try {
    return await axiosWrapper({
      baseURL: receivingChainLcd,
      method: 'get',
      url: `/ibc/core/channel/v1/channels/${channelId}/ports/transfer/packet_acks/${sequence}`,
    });
  } catch (e) {
    await sleep(1000);
    return pollForPacketAck(receivingChainLcd, sequence, channelId, intervalCount - 1);
  }
}

export function getSimulationFee(denom: string, amount = '100') {
  return [coin(amount, denom)];
}

export function fromEthSignature(signature: { v: number | string; r: string; s: string }): Uint8Array {
  const r = Buffer.from(signature.r.replace('0x', ''), 'hex');
  const s = Buffer.from(signature.s.replace('0x', ''), 'hex');

  if (r.length !== 32 || s.length !== 32) {
    throw new Error('Invalid Signature');
  }

  const v = typeof signature.v === 'string' ? parseInt(signature.v, 16) : signature.v;

  if (!Number.isInteger(v) || v < 27) {
    throw new Error('Invalid Signature');
  }

  const vBuffer = Buffer.from([v % 256]);

  const formattedSignature = Buffer.concat([r, s, vBuffer]);
  if (formattedSignature.length !== 65) {
    throw new Error('Formatted signature has an invalid length');
  }

  return formattedSignature;
}
