import { BinaryReader, BinaryWriter } from '../../../binary';
/** Params defines the parameters for the module. */
export interface Params {
  /**
   * btc_confirmation_depth is the confirmation depth in BTC.
   * A block is considered irreversible only when it is at least k-deep in BTC
   * (k in research paper)
   */
  btcConfirmationDepth: bigint;
  /**
   * checkpoint_finalization_timeout is the maximum time window (measured in BTC
   * blocks) between a checkpoint
   * - being submitted to BTC, and
   * - being reported back to BBN
   * If a checkpoint has not been reported back within w BTC blocks, then BBN
   * has dishonest majority and is stalling checkpoints (w in research paper)
   */
  checkpointFinalizationTimeout: bigint;
  /**
   * 4byte tag in hex format, required to be present in the OP_RETURN transaction
   * related to babylon
   */
  checkpointTag: string;
}
export interface ParamsProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.Params';
  value: Uint8Array;
}
/** Params defines the parameters for the module. */
export interface ParamsAmino {
  /**
   * btc_confirmation_depth is the confirmation depth in BTC.
   * A block is considered irreversible only when it is at least k-deep in BTC
   * (k in research paper)
   */
  btc_confirmation_depth?: string;
  /**
   * checkpoint_finalization_timeout is the maximum time window (measured in BTC
   * blocks) between a checkpoint
   * - being submitted to BTC, and
   * - being reported back to BBN
   * If a checkpoint has not been reported back within w BTC blocks, then BBN
   * has dishonest majority and is stalling checkpoints (w in research paper)
   */
  checkpoint_finalization_timeout?: string;
  /**
   * 4byte tag in hex format, required to be present in the OP_RETURN transaction
   * related to babylon
   */
  checkpoint_tag?: string;
}
export interface ParamsAminoMsg {
  type: '/babylon.btccheckpoint.v1.Params';
  value: ParamsAmino;
}
/** Params defines the parameters for the module. */
export interface ParamsSDKType {
  btc_confirmation_depth: bigint;
  checkpoint_finalization_timeout: bigint;
  checkpoint_tag: string;
}
function createBaseParams(): Params {
  return {
    btcConfirmationDepth: BigInt(0),
    checkpointFinalizationTimeout: BigInt(0),
    checkpointTag: '',
  };
}
export const Params = {
  typeUrl: '/babylon.btccheckpoint.v1.Params',
  encode(message: Params, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.btcConfirmationDepth !== BigInt(0)) {
      writer.uint32(8).uint64(message.btcConfirmationDepth);
    }
    if (message.checkpointFinalizationTimeout !== BigInt(0)) {
      writer.uint32(16).uint64(message.checkpointFinalizationTimeout);
    }
    if (message.checkpointTag !== '') {
      writer.uint32(26).string(message.checkpointTag);
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
          message.btcConfirmationDepth = reader.uint64();
          break;
        case 2:
          message.checkpointFinalizationTimeout = reader.uint64();
          break;
        case 3:
          message.checkpointTag = reader.string();
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
    message.btcConfirmationDepth =
      object.btcConfirmationDepth !== undefined && object.btcConfirmationDepth !== null
        ? BigInt(object.btcConfirmationDepth.toString())
        : BigInt(0);
    message.checkpointFinalizationTimeout =
      object.checkpointFinalizationTimeout !== undefined && object.checkpointFinalizationTimeout !== null
        ? BigInt(object.checkpointFinalizationTimeout.toString())
        : BigInt(0);
    message.checkpointTag = object.checkpointTag ?? '';
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    if (object.btc_confirmation_depth !== undefined && object.btc_confirmation_depth !== null) {
      message.btcConfirmationDepth = BigInt(object.btc_confirmation_depth);
    }
    if (object.checkpoint_finalization_timeout !== undefined && object.checkpoint_finalization_timeout !== null) {
      message.checkpointFinalizationTimeout = BigInt(object.checkpoint_finalization_timeout);
    }
    if (object.checkpoint_tag !== undefined && object.checkpoint_tag !== null) {
      message.checkpointTag = object.checkpoint_tag;
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.btc_confirmation_depth =
      message.btcConfirmationDepth !== BigInt(0) ? message.btcConfirmationDepth?.toString() : undefined;
    obj.checkpoint_finalization_timeout =
      message.checkpointFinalizationTimeout !== BigInt(0)
        ? message.checkpointFinalizationTimeout?.toString()
        : undefined;
    obj.checkpoint_tag = message.checkpointTag === '' ? undefined : message.checkpointTag;
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
      typeUrl: '/babylon.btccheckpoint.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
