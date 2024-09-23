/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../../../helpers';
export interface ExtensionOptionsWeb3Tx {
  /**
   * typedDataChainID used only in EIP712 Domain and should match
   * Ethereum network ID in a Web3 provider (e.g. Metamask).
   */
  typedDataChainID: bigint;
  /**
   * feePayer is an account address for the fee payer. It will be validated
   * during EIP712 signature checking.
   */
  feePayer: string;
  /**
   * feePayerSig is a signature data from the fee paying account,
   * allows to perform fee delegation when using EIP712 Domain.
   */
  feePayerSig: Uint8Array;
}
export interface ExtensionOptionsWeb3TxProtoMsg {
  typeUrl: '/injective.types.v1beta1.ExtensionOptionsWeb3Tx';
  value: Uint8Array;
}
export interface ExtensionOptionsWeb3TxAmino {
  /**
   * typedDataChainID used only in EIP712 Domain and should match
   * Ethereum network ID in a Web3 provider (e.g. Metamask).
   */
  typedDataChainID?: string;
  /**
   * feePayer is an account address for the fee payer. It will be validated
   * during EIP712 signature checking.
   */
  feePayer?: string;
  /**
   * feePayerSig is a signature data from the fee paying account,
   * allows to perform fee delegation when using EIP712 Domain.
   */
  feePayerSig?: string;
}
export interface ExtensionOptionsWeb3TxAminoMsg {
  type: '/injective.types.v1beta1.ExtensionOptionsWeb3Tx';
  value: ExtensionOptionsWeb3TxAmino;
}
export interface ExtensionOptionsWeb3TxSDKType {
  typedDataChainID: bigint;
  feePayer: string;
  feePayerSig: Uint8Array;
}
function createBaseExtensionOptionsWeb3Tx(): ExtensionOptionsWeb3Tx {
  return {
    typedDataChainID: BigInt(0),
    feePayer: '',
    feePayerSig: new Uint8Array(),
  };
}
export const ExtensionOptionsWeb3Tx = {
  typeUrl: '/injective.types.v1beta1.ExtensionOptionsWeb3Tx',
  encode(message: ExtensionOptionsWeb3Tx, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.typedDataChainID !== BigInt(0)) {
      writer.uint32(8).uint64(message.typedDataChainID);
    }
    if (message.feePayer !== '') {
      writer.uint32(18).string(message.feePayer);
    }
    if (message.feePayerSig.length !== 0) {
      writer.uint32(26).bytes(message.feePayerSig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ExtensionOptionsWeb3Tx {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExtensionOptionsWeb3Tx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.typedDataChainID = reader.uint64();
          break;
        case 2:
          message.feePayer = reader.string();
          break;
        case 3:
          message.feePayerSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ExtensionOptionsWeb3Tx>): ExtensionOptionsWeb3Tx {
    const message = createBaseExtensionOptionsWeb3Tx();
    message.typedDataChainID =
      object.typedDataChainID !== undefined && object.typedDataChainID !== null
        ? BigInt(object.typedDataChainID.toString())
        : BigInt(0);
    message.feePayer = object.feePayer ?? '';
    message.feePayerSig = object.feePayerSig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ExtensionOptionsWeb3TxAmino): ExtensionOptionsWeb3Tx {
    const message = createBaseExtensionOptionsWeb3Tx();
    if (object.typedDataChainID !== undefined && object.typedDataChainID !== null) {
      message.typedDataChainID = BigInt(object.typedDataChainID);
    }
    if (object.feePayer !== undefined && object.feePayer !== null) {
      message.feePayer = object.feePayer;
    }
    if (object.feePayerSig !== undefined && object.feePayerSig !== null) {
      message.feePayerSig = bytesFromBase64(object.feePayerSig);
    }
    return message;
  },
  toAmino(message: ExtensionOptionsWeb3Tx): ExtensionOptionsWeb3TxAmino {
    const obj: any = {};
    obj.typedDataChainID = message.typedDataChainID !== BigInt(0) ? (message.typedDataChainID?.toString)() : undefined;
    obj.feePayer = message.feePayer === '' ? undefined : message.feePayer;
    obj.feePayerSig = message.feePayerSig ? base64FromBytes(message.feePayerSig) : undefined;
    return obj;
  },
  fromAminoMsg(object: ExtensionOptionsWeb3TxAminoMsg): ExtensionOptionsWeb3Tx {
    return ExtensionOptionsWeb3Tx.fromAmino(object.value);
  },
  fromProtoMsg(message: ExtensionOptionsWeb3TxProtoMsg): ExtensionOptionsWeb3Tx {
    return ExtensionOptionsWeb3Tx.decode(message.value);
  },
  toProto(message: ExtensionOptionsWeb3Tx): Uint8Array {
    return ExtensionOptionsWeb3Tx.encode(message).finish();
  },
  toProtoMsg(message: ExtensionOptionsWeb3Tx): ExtensionOptionsWeb3TxProtoMsg {
    return {
      typeUrl: '/injective.types.v1beta1.ExtensionOptionsWeb3Tx',
      value: ExtensionOptionsWeb3Tx.encode(message).finish(),
    };
  },
};
