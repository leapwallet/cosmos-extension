import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
import { ProofOps, ProofOpsAmino } from '../../tendermint/crypto/proof';

/** MsgSubmitQueryResponse represents a message type to fulfil a query request. */
export interface MsgSubmitQueryResponse {
  chainId: string;
  queryId: string;
  result: Uint8Array;
  proofOps?: ProofOps;
  height: bigint;
  fromAddress: string;
}

export interface MsgSubmitQueryResponseProtoMsg {
  typeUrl: '/stride.interchainquery.v1.MsgSubmitQueryResponse';
  value: Uint8Array;
}

/** MsgSubmitQueryResponse represents a message type to fulfil a query request. */
export interface MsgSubmitQueryResponseAmino {
  chain_id?: string;
  query_id?: string;
  result?: string;
  proof_ops?: ProofOpsAmino;
  height?: string;
  from_address?: string;
}

export interface MsgSubmitQueryResponseAminoMsg {
  type: '/stride.interchainquery.v1.MsgSubmitQueryResponse';
  value: MsgSubmitQueryResponseAmino;
}

function createBaseMsgSubmitQueryResponse(): MsgSubmitQueryResponse {
  return {
    chainId: '',
    queryId: '',
    result: new Uint8Array(),
    proofOps: undefined,
    height: BigInt(0),
    fromAddress: '',
  };
}

export const MsgSubmitQueryResponse = {
  typeUrl: '/stride.interchainquery.v1.MsgSubmitQueryResponse',
  encode(message: MsgSubmitQueryResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    if (message.queryId !== '') {
      writer.uint32(18).string(message.queryId);
    }
    if (message.result.length !== 0) {
      writer.uint32(26).bytes(message.result);
    }
    if (message.proofOps !== undefined) {
      ProofOps.encode(message.proofOps, writer.uint32(34).fork()).ldelim();
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(40).int64(message.height);
    }
    if (message.fromAddress !== '') {
      writer.uint32(50).string(message.fromAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitQueryResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubmitQueryResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 2:
          message.queryId = reader.string();
          break;
        case 3:
          message.result = reader.bytes();
          break;
        case 4:
          message.proofOps = ProofOps.decode(reader, reader.uint32());
          break;
        case 5:
          message.height = reader.int64();
          break;
        case 6:
          message.fromAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSubmitQueryResponse>): MsgSubmitQueryResponse {
    const message = createBaseMsgSubmitQueryResponse();
    message.chainId = object.chainId ?? '';
    message.queryId = object.queryId ?? '';
    message.result = object.result ?? new Uint8Array();
    message.proofOps =
      object.proofOps !== undefined && object.proofOps !== null ? ProofOps.fromPartial(object.proofOps) : undefined;
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.fromAddress = object.fromAddress ?? '';
    return message;
  },
  fromAmino(object: MsgSubmitQueryResponseAmino): MsgSubmitQueryResponse {
    const message = createBaseMsgSubmitQueryResponse();
    if (object.chain_id !== undefined && object.chain_id !== null) {
      message.chainId = object.chain_id;
    }
    if (object.query_id !== undefined && object.query_id !== null) {
      message.queryId = object.query_id;
    }
    if (object.result !== undefined && object.result !== null) {
      message.result = bytesFromBase64(object.result);
    }
    if (object.proof_ops !== undefined && object.proof_ops !== null) {
      message.proofOps = ProofOps.fromAmino(object.proof_ops);
    }
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.from_address !== undefined && object.from_address !== null) {
      message.fromAddress = object.from_address;
    }
    return message;
  },
  toAmino(message: MsgSubmitQueryResponse): MsgSubmitQueryResponseAmino {
    const obj: any = {};
    obj.chain_id = message.chainId === '' ? undefined : message.chainId;
    obj.query_id = message.queryId === '' ? undefined : message.queryId;
    obj.result = message.result ? base64FromBytes(message.result) : undefined;
    obj.proof_ops = message.proofOps ? ProofOps.toAmino(message.proofOps) : undefined;
    obj.height = message.height !== BigInt(0) ? message.height.toString() : undefined;
    obj.from_address = message.fromAddress === '' ? undefined : message.fromAddress;
    return obj;
  },
  fromAminoMsg(object: MsgSubmitQueryResponseAminoMsg): MsgSubmitQueryResponse {
    return MsgSubmitQueryResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSubmitQueryResponseProtoMsg): MsgSubmitQueryResponse {
    return MsgSubmitQueryResponse.decode(message.value);
  },
  toProto(message: MsgSubmitQueryResponse): Uint8Array {
    return MsgSubmitQueryResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgSubmitQueryResponse): MsgSubmitQueryResponseProtoMsg {
    return {
      typeUrl: '/stride.interchainquery.v1.MsgSubmitQueryResponse',
      value: MsgSubmitQueryResponse.encode(message).finish(),
    };
  },
};
