import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';

/**
 * ProofOp defines an operation used for calculating Merkle root
 * The data could be arbitrary format, providing nessecary data
 * for example neighbouring node hash
 */
export interface ProofOp {
  type: string;
  key: Uint8Array;
  data: Uint8Array;
}

export interface ProofOpProtoMsg {
  typeUrl: '/tendermint.crypto.ProofOp';
  value: Uint8Array;
}

/** ProofOps is Merkle proof defined by the list of ProofOps */
export interface ProofOps {
  ops: ProofOp[];
}

export interface ProofOpsProtoMsg {
  typeUrl: '/tendermint.crypto.ProofOps';
  value: Uint8Array;
}

/**
 * ProofOp defines an operation used for calculating Merkle root
 * The data could be arbitrary format, providing nessecary data
 * for example neighbouring node hash
 */
export interface ProofOpAmino {
  type?: string;
  key?: string;
  data?: string;
}

export interface ProofOpAminoMsg {
  type: '/tendermint.crypto.ProofOp';
  value: ProofOpAmino;
}

/** ProofOps is Merkle proof defined by the list of ProofOps */
export interface ProofOpsAmino {
  ops?: ProofOpAmino[];
}

export interface ProofOpsAminoMsg {
  type: '/tendermint.crypto.ProofOps';
  value: ProofOpsAmino;
}

function createBaseProofOp(): ProofOp {
  return {
    type: '',
    key: new Uint8Array(),
    data: new Uint8Array(),
  };
}

export const ProofOp = {
  typeUrl: '/tendermint.crypto.ProofOp',
  encode(message: ProofOp, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.type !== '') {
      writer.uint32(10).string(message.type);
    }
    if (message.key.length !== 0) {
      writer.uint32(18).bytes(message.key);
    }
    if (message.data.length !== 0) {
      writer.uint32(26).bytes(message.data);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ProofOp {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProofOp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;
        case 2:
          message.key = reader.bytes();
          break;
        case 3:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ProofOp>): ProofOp {
    const message = createBaseProofOp();
    message.type = object.type ?? '';
    message.key = object.key ?? new Uint8Array();
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ProofOpAmino): ProofOp {
    const message = createBaseProofOp();
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    }
    if (object.key !== undefined && object.key !== null) {
      message.key = bytesFromBase64(object.key);
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },
  toAmino(message: ProofOp): ProofOpAmino {
    const obj: any = {};
    obj.type = message.type === '' ? undefined : message.type;
    obj.key = message.key ? base64FromBytes(message.key) : undefined;
    obj.data = message.data ? base64FromBytes(message.data) : undefined;
    return obj;
  },
  fromAminoMsg(object: ProofOpAminoMsg): ProofOp {
    return ProofOp.fromAmino(object.value);
  },
  fromProtoMsg(message: ProofOpProtoMsg): ProofOp {
    return ProofOp.decode(message.value);
  },
  toProto(message: ProofOp): Uint8Array {
    return ProofOp.encode(message).finish();
  },
  toProtoMsg(message: ProofOp): ProofOpProtoMsg {
    return {
      typeUrl: '/tendermint.crypto.ProofOp',
      value: ProofOp.encode(message).finish(),
    };
  },
};

function createBaseProofOps(): ProofOps {
  return {
    ops: [],
  };
}

export const ProofOps = {
  typeUrl: '/tendermint.crypto.ProofOps',
  encode(message: ProofOps, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.ops) {
      ProofOp.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ProofOps {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProofOps();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ops.push(ProofOp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ProofOps>): ProofOps {
    const message = createBaseProofOps();
    message.ops = object.ops?.map((e) => ProofOp.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: ProofOpsAmino): ProofOps {
    const message = createBaseProofOps();
    message.ops = object.ops?.map((e) => ProofOp.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: ProofOps): ProofOpsAmino {
    const obj: any = {};
    if (message.ops) {
      obj.ops = message.ops.map((e) => (e ? ProofOp.toAmino(e) : undefined));
    } else {
      obj.ops = message.ops;
    }
    return obj;
  },
  fromAminoMsg(object: ProofOpsAminoMsg): ProofOps {
    return ProofOps.fromAmino(object.value);
  },
  fromProtoMsg(message: ProofOpsProtoMsg): ProofOps {
    return ProofOps.decode(message.value);
  },
  toProto(message: ProofOps): Uint8Array {
    return ProofOps.encode(message).finish();
  },
  toProtoMsg(message: ProofOps): ProofOpsProtoMsg {
    return {
      typeUrl: '/tendermint.crypto.ProofOps',
      value: ProofOps.encode(message).finish(),
    };
  },
};
