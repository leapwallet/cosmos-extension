import { BinaryReader, BinaryWriter } from '../../../binary';
/** Params defines the parameters for the module. */
export interface Params {
  /** epoch_interval is the number of consecutive blocks to form an epoch */
  epochInterval: bigint;
}
export interface ParamsProtoMsg {
  typeUrl: '/babylon.epoching.v1.Params';
  value: Uint8Array;
}
/** Params defines the parameters for the module. */
export interface ParamsAmino {
  /** epoch_interval is the number of consecutive blocks to form an epoch */
  epoch_interval?: string;
}
export interface ParamsAminoMsg {
  type: '/babylon.epoching.v1.Params';
  value: ParamsAmino;
}
/** Params defines the parameters for the module. */
export interface ParamsSDKType {
  epoch_interval: bigint;
}
function createBaseParams(): Params {
  return {
    epochInterval: BigInt(0),
  };
}
export const Params = {
  typeUrl: '/babylon.epoching.v1.Params',
  encode(message: Params, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochInterval !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochInterval);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochInterval = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.epochInterval =
      object.epochInterval !== undefined && object.epochInterval !== null
        ? BigInt(object.epochInterval.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    if (object.epoch_interval !== undefined && object.epoch_interval !== null) {
      message.epochInterval = BigInt(object.epoch_interval);
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.epoch_interval = message.epochInterval !== BigInt(0) ? message.epochInterval?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
