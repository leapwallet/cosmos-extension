import Long from 'long';
import * as _m0 from 'protobufjs/minimal';

import { DeepPartial } from '../../../proto/helpers';

export interface Validator {
  name: string;
  address: string;
  weight: Long;
  delegation: string;
  slashQueryProgressTracker: string;
  slashQueryCheckpoint: string;
  internalSharesToTokensRate: string;
  delegationChangesInProgress: Long;
  slashQueryInProgress: boolean;
}
export interface ValidatorSDKType {
  name: string;
  address: string;
  weight: Long;
  delegation: string;
  slash_query_progress_tracker: string;
  slash_query_checkpoint: string;
  internal_shares_to_tokens_rate: string;
  delegation_changes_in_progress: Long;
  slash_query_in_progress: boolean;
}

function createBaseValidator(): Validator {
  return {
    name: '',
    address: '',
    weight: Long.UZERO,
    delegation: '',
    slashQueryProgressTracker: '',
    slashQueryCheckpoint: '',
    internalSharesToTokensRate: '',
    delegationChangesInProgress: Long.ZERO,
    slashQueryInProgress: false,
  };
}

export const Validator = {
  encode(message: Validator, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }

    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }

    if (!message.weight.isZero()) {
      writer.uint32(48).uint64(message.weight);
    }

    if (message.delegation !== '') {
      writer.uint32(42).string(message.delegation);
    }

    if (message.slashQueryProgressTracker !== '') {
      writer.uint32(74).string(message.slashQueryProgressTracker);
    }

    if (message.slashQueryCheckpoint !== '') {
      writer.uint32(98).string(message.slashQueryCheckpoint);
    }

    if (message.internalSharesToTokensRate !== '') {
      writer.uint32(82).string(message.internalSharesToTokensRate);
    }

    if (!message.delegationChangesInProgress.isZero()) {
      writer.uint32(88).int64(message.delegationChangesInProgress);
    }

    if (message.slashQueryInProgress === true) {
      writer.uint32(104).bool(message.slashQueryInProgress);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Validator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidator();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;

        case 2:
          message.address = reader.string();
          break;

        case 6:
          message.weight = reader.uint64() as Long;
          break;

        case 5:
          message.delegation = reader.string();
          break;

        case 9:
          message.slashQueryProgressTracker = reader.string();
          break;

        case 12:
          message.slashQueryCheckpoint = reader.string();
          break;

        case 10:
          message.internalSharesToTokensRate = reader.string();
          break;

        case 11:
          message.delegationChangesInProgress = reader.int64() as Long;
          break;

        case 13:
          message.slashQueryInProgress = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<Validator>): Validator {
    const message = createBaseValidator();
    message.name = object.name ?? '';
    message.address = object.address ?? '';
    message.weight =
      object.weight !== undefined && object.weight !== null ? Long.fromValue(object.weight as Long) : Long.UZERO;
    message.delegation = object.delegation ?? '';
    message.slashQueryProgressTracker = object.slashQueryProgressTracker ?? '';
    message.slashQueryCheckpoint = object.slashQueryCheckpoint ?? '';
    message.internalSharesToTokensRate = object.internalSharesToTokensRate ?? '';
    message.delegationChangesInProgress =
      object.delegationChangesInProgress !== undefined && object.delegationChangesInProgress !== null
        ? Long.fromValue(object.delegationChangesInProgress as Long)
        : Long.ZERO;
    message.slashQueryInProgress = object.slashQueryInProgress ?? false;
    return message;
  },
};
