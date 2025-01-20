import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
/** BTCSigType indicates the type of btc_sig in a pop */
export enum BTCSigType {
  /** BIP340 - BIP340 means the btc_sig will follow the BIP-340 encoding */
  BIP340 = 0,
  /** BIP322 - BIP322 means the btc_sig will follow the BIP-322 encoding */
  BIP322 = 1,
  /**
   * ECDSA - ECDSA means the btc_sig will follow the ECDSA encoding
   * ref: https://github.com/okx/js-wallet-sdk/blob/a57c2acbe6ce917c0aa4e951d96c4e562ad58444/packages/coin-bitcoin/src/BtcWallet.ts#L331
   */
  ECDSA = 2,
  UNRECOGNIZED = -1,
}
export const BTCSigTypeSDKType = BTCSigType;
export const BTCSigTypeAmino = BTCSigType;
export function bTCSigTypeFromJSON(object: any): BTCSigType {
  switch (object) {
    case 0:
    case 'BIP340':
      return BTCSigType.BIP340;
    case 1:
    case 'BIP322':
      return BTCSigType.BIP322;
    case 2:
    case 'ECDSA':
      return BTCSigType.ECDSA;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return BTCSigType.UNRECOGNIZED;
  }
}
export function bTCSigTypeToJSON(object: BTCSigType): string {
  switch (object) {
    case BTCSigType.BIP340:
      return 'BIP340';
    case BTCSigType.BIP322:
      return 'BIP322';
    case BTCSigType.ECDSA:
      return 'ECDSA';
    case BTCSigType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/**
 * ProofOfPossessionBTC is the proof of possession that a Babylon
 * address and a Bitcoin secp256k1 secret key are held by the same
 * person
 */
export interface ProofOfPossessionBTC {
  /** btc_sig_type indicates the type of btc_sig in the pop */
  btcSigType: BTCSigType;
  /**
   * btc_sig is the signature generated via sign(sk_btc, babylon_staker_address)
   * the signature follows encoding in either BIP-340 spec or BIP-322 spec
   */
  btcSig: Uint8Array;
}
export interface ProofOfPossessionBTCProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.ProofOfPossessionBTC';
  value: Uint8Array;
}
/**
 * ProofOfPossessionBTC is the proof of possession that a Babylon
 * address and a Bitcoin secp256k1 secret key are held by the same
 * person
 */
export interface ProofOfPossessionBTCAmino {
  /** btc_sig_type indicates the type of btc_sig in the pop */
  btc_sig_type?: BTCSigType;
  /**
   * btc_sig is the signature generated via sign(sk_btc, babylon_staker_address)
   * the signature follows encoding in either BIP-340 spec or BIP-322 spec
   */
  btc_sig?: string;
}
export interface ProofOfPossessionBTCAminoMsg {
  type: '/babylon.btcstaking.v1.ProofOfPossessionBTC';
  value: ProofOfPossessionBTCAmino;
}
/**
 * ProofOfPossessionBTC is the proof of possession that a Babylon
 * address and a Bitcoin secp256k1 secret key are held by the same
 * person
 */
export interface ProofOfPossessionBTCSDKType {
  btc_sig_type: BTCSigType;
  btc_sig: Uint8Array;
}
/**
 * BIP322Sig is a BIP-322 signature together with the address corresponding to
 * the signer
 */
export interface BIP322Sig {
  /** address is the signer's address */
  address: string;
  /** sig is the actual signature in BIP-322 format */
  sig: Uint8Array;
}
export interface BIP322SigProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.BIP322Sig';
  value: Uint8Array;
}
/**
 * BIP322Sig is a BIP-322 signature together with the address corresponding to
 * the signer
 */
export interface BIP322SigAmino {
  /** address is the signer's address */
  address?: string;
  /** sig is the actual signature in BIP-322 format */
  sig?: string;
}
export interface BIP322SigAminoMsg {
  type: '/babylon.btcstaking.v1.BIP322Sig';
  value: BIP322SigAmino;
}
/**
 * BIP322Sig is a BIP-322 signature together with the address corresponding to
 * the signer
 */
export interface BIP322SigSDKType {
  address: string;
  sig: Uint8Array;
}
function createBaseProofOfPossessionBTC(): ProofOfPossessionBTC {
  return {
    btcSigType: 0,
    btcSig: new Uint8Array(),
  };
}
export const ProofOfPossessionBTC = {
  typeUrl: '/babylon.btcstaking.v1.ProofOfPossessionBTC',
  encode(message: ProofOfPossessionBTC, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.btcSigType !== 0) {
      writer.uint32(8).int32(message.btcSigType);
    }
    if (message.btcSig.length !== 0) {
      writer.uint32(18).bytes(message.btcSig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ProofOfPossessionBTC {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProofOfPossessionBTC();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.btcSigType = reader.int32() as any;
          break;
        case 2:
          message.btcSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ProofOfPossessionBTC>): ProofOfPossessionBTC {
    const message = createBaseProofOfPossessionBTC();
    message.btcSigType = object.btcSigType ?? 0;
    message.btcSig = object.btcSig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ProofOfPossessionBTCAmino): ProofOfPossessionBTC {
    const message = createBaseProofOfPossessionBTC();
    if (object.btc_sig_type !== undefined && object.btc_sig_type !== null) {
      message.btcSigType = object.btc_sig_type;
    }
    if (object.btc_sig !== undefined && object.btc_sig !== null) {
      message.btcSig = bytesFromBase64(object.btc_sig);
    }
    return message;
  },
  toAmino(message: ProofOfPossessionBTC): ProofOfPossessionBTCAmino {
    const obj: any = {};
    obj.btc_sig_type = message.btcSigType === 0 ? undefined : message.btcSigType;
    obj.btc_sig = message.btcSig ? base64FromBytes(message.btcSig) : undefined;
    return obj;
  },
  fromAminoMsg(object: ProofOfPossessionBTCAminoMsg): ProofOfPossessionBTC {
    return ProofOfPossessionBTC.fromAmino(object.value);
  },
  fromProtoMsg(message: ProofOfPossessionBTCProtoMsg): ProofOfPossessionBTC {
    return ProofOfPossessionBTC.decode(message.value);
  },
  toProto(message: ProofOfPossessionBTC): Uint8Array {
    return ProofOfPossessionBTC.encode(message).finish();
  },
  toProtoMsg(message: ProofOfPossessionBTC): ProofOfPossessionBTCProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.ProofOfPossessionBTC',
      value: ProofOfPossessionBTC.encode(message).finish(),
    };
  },
};
function createBaseBIP322Sig(): BIP322Sig {
  return {
    address: '',
    sig: new Uint8Array(),
  };
}
export const BIP322Sig = {
  typeUrl: '/babylon.btcstaking.v1.BIP322Sig',
  encode(message: BIP322Sig, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.sig.length !== 0) {
      writer.uint32(18).bytes(message.sig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BIP322Sig {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBIP322Sig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.sig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BIP322Sig>): BIP322Sig {
    const message = createBaseBIP322Sig();
    message.address = object.address ?? '';
    message.sig = object.sig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: BIP322SigAmino): BIP322Sig {
    const message = createBaseBIP322Sig();
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    }
    if (object.sig !== undefined && object.sig !== null) {
      message.sig = bytesFromBase64(object.sig);
    }
    return message;
  },
  toAmino(message: BIP322Sig): BIP322SigAmino {
    const obj: any = {};
    obj.address = message.address === '' ? undefined : message.address;
    obj.sig = message.sig ? base64FromBytes(message.sig) : undefined;
    return obj;
  },
  fromAminoMsg(object: BIP322SigAminoMsg): BIP322Sig {
    return BIP322Sig.fromAmino(object.value);
  },
  fromProtoMsg(message: BIP322SigProtoMsg): BIP322Sig {
    return BIP322Sig.decode(message.value);
  },
  toProto(message: BIP322Sig): Uint8Array {
    return BIP322Sig.encode(message).finish();
  },
  toProtoMsg(message: BIP322Sig): BIP322SigProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.BIP322Sig',
      value: BIP322Sig.encode(message).finish(),
    };
  },
};
