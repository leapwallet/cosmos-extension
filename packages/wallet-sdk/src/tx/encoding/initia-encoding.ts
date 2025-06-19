import type { Pubkey, SinglePubkey, StdSignature } from '@cosmjs/amino';
import { pubkeyType } from '@cosmjs/amino';
import { encodePubkey } from '@cosmjs/proto-signing';
import { base64 } from '@scure/base';
import { PubKey as CosmosCryptoSecp256k1Pubkey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { Any } from 'cosmjs-types/google/protobuf/any';

export function sortedObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortedObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
  sortedKeys.forEach((key) => {
    result[key] = sortedObject(obj[key]);
  });
  return result;
}

export function sortedJsonStringify(obj: any): string {
  return JSON.stringify(sortedObject(obj));
}

export interface EthSecp256k1Pubkey extends SinglePubkey {
  readonly type: 'initia/PubKeyEthSecp256k1';
  readonly value: string;
}

export const pubkeyTypeInitia = {
  ...pubkeyType,
  /** https://github.com/initia-labs/initia/blob/main/crypto/ethsecp256k1/ethsecp256k1.go#L40 */
  ethsecp256k1: 'initia/PubKeyEthSecp256k1' as const,
};

/**
 * Takes a Secp256k1 public key as raw bytes and returns the Amino JSON
 * representation of it (the type/value wrapper object).
 */
export function encodeEthSecp256k1Pubkey(pubkey: Uint8Array): EthSecp256k1Pubkey {
  if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
    throw new Error('Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03');
  }
  return {
    type: pubkeyTypeInitia.ethsecp256k1,
    value: base64.encode(pubkey),
  };
}

export function isEthSecp256k1Pubkey(pubkey: Pubkey): pubkey is EthSecp256k1Pubkey {
  return (pubkey as EthSecp256k1Pubkey).type === 'initia/PubKeyEthSecp256k1';
}

export function encodePubkeyInitia(pubkey: Pubkey): Any {
  if (isEthSecp256k1Pubkey(pubkey)) {
    const pubkeyProto = CosmosCryptoSecp256k1Pubkey.fromPartial({
      key: base64.decode(pubkey.value),
    });
    return Any.fromPartial({
      typeUrl: '/initia.crypto.v1beta1.ethsecp256k1.PubKey',
      value: Uint8Array.from(CosmosCryptoSecp256k1Pubkey.encode(pubkeyProto).finish()),
    });
  }

  return encodePubkey(pubkey);
}

export function encodeEthSecp256k1Signature(pubkey: Uint8Array, signature: Uint8Array): StdSignature {
  if (signature.length !== 64) {
    throw new Error(
      'Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s.',
    );
  }

  return {
    pub_key: encodeEthSecp256k1Pubkey(pubkey),
    signature: base64.encode(signature),
  };
}
