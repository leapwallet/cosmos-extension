// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { BinaryReader, BinaryWriter } from '../binary';
import { Coin, CoinAmino, CoinSDKType } from '../coin';
import { Algorithm } from './algorithm';
import { Route, RouteAmino, RouteSDKType, Swap, SwapAmino, SwapSDKType } from './swap';
export interface MsgWithdrawProtocolFees {
  /** Address of the signer who is requesting the fee withdrawal. */
  signer: string;
  /** Address to which the withdrawn fees will be sent. */
  to: string;
}
export interface MsgWithdrawProtocolFeesProtoMsg {
  typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFees';
  value: Uint8Array;
}
export interface MsgWithdrawProtocolFeesAmino {
  /** Address of the signer who is requesting the fee withdrawal. */
  signer?: string;
  /** Address to which the withdrawn fees will be sent. */
  to?: string;
}
export interface MsgWithdrawProtocolFeesAminoMsg {
  type: 'swap/WithdrawProtocolFees';
  value: MsgWithdrawProtocolFeesAmino;
}
export interface MsgWithdrawProtocolFeesSDKType {
  signer: string;
  to: string;
}
export interface MsgWithdrawProtocolFeesResponse {}
export interface MsgWithdrawProtocolFeesResponseProtoMsg {
  typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFeesResponse';
  value: Uint8Array;
}
export interface MsgWithdrawProtocolFeesResponseAmino {}
export interface MsgWithdrawProtocolFeesResponseAminoMsg {
  type: '/noble.swap.v1.MsgWithdrawProtocolFeesResponse';
  value: MsgWithdrawProtocolFeesResponseAmino;
}
export interface MsgWithdrawProtocolFeesResponseSDKType {}
export interface MsgWithdrawRewards {
  /** Address of the signer who is requesting the reward withdrawal. */
  signer: string;
}
export interface MsgWithdrawRewardsProtoMsg {
  typeUrl: '/noble.swap.v1.MsgWithdrawRewards';
  value: Uint8Array;
}
export interface MsgWithdrawRewardsAmino {
  /** Address of the signer who is requesting the reward withdrawal. */
  signer?: string;
}
export interface MsgWithdrawRewardsAminoMsg {
  type: 'swap/WithdrawRewards';
  value: MsgWithdrawRewardsAmino;
}
export interface MsgWithdrawRewardsSDKType {
  signer: string;
}
export interface MsgWithdrawRewardsResponse {
  /** List of rewards withdrawn by the user. */
  rewards: Coin[];
}
export interface MsgWithdrawRewardsResponseProtoMsg {
  typeUrl: '/noble.swap.v1.MsgWithdrawRewardsResponse';
  value: Uint8Array;
}
export interface MsgWithdrawRewardsResponseAmino {
  /** List of rewards withdrawn by the user. */
  rewards: CoinAmino[];
}
export interface MsgWithdrawRewardsResponseAminoMsg {
  type: '/noble.swap.v1.MsgWithdrawRewardsResponse';
  value: MsgWithdrawRewardsResponseAmino;
}
export interface MsgWithdrawRewardsResponseSDKType {
  rewards: CoinSDKType[];
}
export interface MsgSwap {
  /** Address of the signer who is initiating the swap. */
  signer: string;
  /** The coin to be swapped. */
  amount: Coin;
  /** The routes through which the swap will occur. */
  routes: Route[];
  /** The minimum amount of tokens expected after the swap. */
  min: Coin;
}
export interface MsgSwapProtoMsg {
  typeUrl: '/noble.swap.v1.MsgSwap';
  value: Uint8Array;
}
export interface MsgSwapAmino {
  /** Address of the signer who is initiating the swap. */
  signer?: string;
  /** The coin to be swapped. */
  amount?: CoinAmino;
  /** The routes through which the swap will occur. */
  routes?: RouteAmino[];
  /** The minimum amount of tokens expected after the swap. */
  min?: CoinAmino;
}
export interface MsgSwapAminoMsg {
  type: 'swap/Swap';
  value: MsgSwapAmino;
}
export interface MsgSwapSDKType {
  signer: string;
  amount: CoinSDKType;
  routes: RouteSDKType[];
  min: CoinSDKType;
}
export interface MsgSwapResponse {
  /** The resulting amount of tokens after the swap. */
  result: Coin;
  /** Details of each individual swap involved in the process. */
  swaps: Swap[];
}
export interface MsgSwapResponseProtoMsg {
  typeUrl: '/noble.swap.v1.MsgSwapResponse';
  value: Uint8Array;
}
export interface MsgSwapResponseAmino {
  /** The resulting amount of tokens after the swap. */
  result?: CoinAmino;
  /** Details of each individual swap involved in the process. */
  swaps?: SwapAmino[];
}
export interface MsgSwapResponseAminoMsg {
  type: '/noble.swap.v1.MsgSwapResponse';
  value: MsgSwapResponseAmino;
}
export interface MsgSwapResponseSDKType {
  result: CoinSDKType;
  swaps: SwapSDKType[];
}
export interface MsgPauseByAlgorithm {
  /** Address of the signer who is requesting to pause the pools. */
  signer: string;
  /** The algorithm used by the pools to be paused. */
  algorithm: Algorithm;
}
export interface MsgPauseByAlgorithmProtoMsg {
  typeUrl: '/noble.swap.v1.MsgPauseByAlgorithm';
  value: Uint8Array;
}
export interface MsgPauseByAlgorithmAmino {
  /** Address of the signer who is requesting to pause the pools. */
  signer?: string;
  /** The algorithm used by the pools to be paused. */
  algorithm?: Algorithm;
}
export interface MsgPauseByAlgorithmAminoMsg {
  type: 'swap/PauseByAlgorithm';
  value: MsgPauseByAlgorithmAmino;
}
export interface MsgPauseByAlgorithmSDKType {
  signer: string;
  algorithm: Algorithm;
}
export interface MsgPauseByAlgorithmResponse {
  /** List of IDs of the paused pools. */
  pausedPools: bigint[];
}
export interface MsgPauseByAlgorithmResponseProtoMsg {
  typeUrl: '/noble.swap.v1.MsgPauseByAlgorithmResponse';
  value: Uint8Array;
}
export interface MsgPauseByAlgorithmResponseAmino {
  /** List of IDs of the paused pools. */
  paused_pools?: string[];
}
export interface MsgPauseByAlgorithmResponseAminoMsg {
  type: '/noble.swap.v1.MsgPauseByAlgorithmResponse';
  value: MsgPauseByAlgorithmResponseAmino;
}
export interface MsgPauseByAlgorithmResponseSDKType {
  paused_pools: bigint[];
}
export interface MsgPauseByPoolIds {
  /** Address of the signer who is requesting to pause the pools. */
  signer: string;
  /** List of IDs of the pools to be paused. */
  poolIds: bigint[];
}
export interface MsgPauseByPoolIdsProtoMsg {
  typeUrl: '/noble.swap.v1.MsgPauseByPoolIds';
  value: Uint8Array;
}
export interface MsgPauseByPoolIdsAmino {
  /** Address of the signer who is requesting to pause the pools. */
  signer?: string;
  /** List of IDs of the pools to be paused. */
  pool_ids?: string[];
}
export interface MsgPauseByPoolIdsAminoMsg {
  type: 'swap/PauseByPoolIds';
  value: MsgPauseByPoolIdsAmino;
}
export interface MsgPauseByPoolIdsSDKType {
  signer: string;
  pool_ids: bigint[];
}
export interface MsgPauseByPoolIdsResponse {
  /** List of IDs of the paused pools. */
  pausedPools: bigint[];
}
export interface MsgPauseByPoolIdsResponseProtoMsg {
  typeUrl: '/noble.swap.v1.MsgPauseByPoolIdsResponse';
  value: Uint8Array;
}
export interface MsgPauseByPoolIdsResponseAmino {
  /** List of IDs of the paused pools. */
  paused_pools?: string[];
}
export interface MsgPauseByPoolIdsResponseAminoMsg {
  type: '/noble.swap.v1.MsgPauseByPoolIdsResponse';
  value: MsgPauseByPoolIdsResponseAmino;
}
export interface MsgPauseByPoolIdsResponseSDKType {
  paused_pools: bigint[];
}
export interface MsgUnpauseByAlgorithm {
  /** Address of the signer who is requesting to unpause the pools. */
  signer: string;
  /** The algorithm used by the pools to be unpaused. */
  algorithm: Algorithm;
}
export interface MsgUnpauseByAlgorithmProtoMsg {
  typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithm';
  value: Uint8Array;
}
export interface MsgUnpauseByAlgorithmAmino {
  /** Address of the signer who is requesting to unpause the pools. */
  signer?: string;
  /** The algorithm used by the pools to be unpaused. */
  algorithm?: Algorithm;
}
export interface MsgUnpauseByAlgorithmAminoMsg {
  type: 'swap/UnpauseByAlgorithm';
  value: MsgUnpauseByAlgorithmAmino;
}
export interface MsgUnpauseByAlgorithmSDKType {
  signer: string;
  algorithm: Algorithm;
}
export interface MsgUnpauseByAlgorithmResponse {
  /** List of IDs of the unpaused pools. */
  unpausedPools: bigint[];
}
export interface MsgUnpauseByAlgorithmResponseProtoMsg {
  typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithmResponse';
  value: Uint8Array;
}
export interface MsgUnpauseByAlgorithmResponseAmino {
  /** List of IDs of the unpaused pools. */
  unpaused_pools?: string[];
}
export interface MsgUnpauseByAlgorithmResponseAminoMsg {
  type: '/noble.swap.v1.MsgUnpauseByAlgorithmResponse';
  value: MsgUnpauseByAlgorithmResponseAmino;
}
export interface MsgUnpauseByAlgorithmResponseSDKType {
  unpaused_pools: bigint[];
}
export interface MsgUnpauseByPoolIds {
  /** Address of the signer who is requesting to unpause the pools. */
  signer: string;
  /** List of IDs of the pools to be unpaused. */
  poolIds: bigint[];
}
export interface MsgUnpauseByPoolIdsProtoMsg {
  typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIds';
  value: Uint8Array;
}
export interface MsgUnpauseByPoolIdsAmino {
  /** Address of the signer who is requesting to unpause the pools. */
  signer?: string;
  /** List of IDs of the pools to be unpaused. */
  pool_ids?: string[];
}
export interface MsgUnpauseByPoolIdsAminoMsg {
  type: 'swap/UnpauseByPoolIds';
  value: MsgUnpauseByPoolIdsAmino;
}
export interface MsgUnpauseByPoolIdsSDKType {
  signer: string;
  pool_ids: bigint[];
}
export interface MsgUnpauseByPoolIdsResponse {
  /** List of IDs of the unpaused pools. */
  unpausedPools: bigint[];
}
export interface MsgUnpauseByPoolIdsResponseProtoMsg {
  typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIdsResponse';
  value: Uint8Array;
}
export interface MsgUnpauseByPoolIdsResponseAmino {
  /** List of IDs of the unpaused pools. */
  unpaused_pools?: string[];
}
export interface MsgUnpauseByPoolIdsResponseAminoMsg {
  type: '/noble.swap.v1.MsgUnpauseByPoolIdsResponse';
  value: MsgUnpauseByPoolIdsResponseAmino;
}
export interface MsgUnpauseByPoolIdsResponseSDKType {
  unpaused_pools: bigint[];
}
function createBaseMsgWithdrawProtocolFees(): MsgWithdrawProtocolFees {
  return {
    signer: '',
    to: '',
  };
}
export const MsgWithdrawProtocolFees = {
  typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFees',
  encode(message: MsgWithdrawProtocolFees, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.to !== '') {
      writer.uint32(18).string(message.to);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWithdrawProtocolFees {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawProtocolFees();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.to = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWithdrawProtocolFees>): MsgWithdrawProtocolFees {
    const message = createBaseMsgWithdrawProtocolFees();
    message.signer = object.signer ?? '';
    message.to = object.to ?? '';
    return message;
  },
  fromAmino(object: MsgWithdrawProtocolFeesAmino): MsgWithdrawProtocolFees {
    const message = createBaseMsgWithdrawProtocolFees();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.to !== undefined && object.to !== null) {
      message.to = object.to;
    }
    return message;
  },
  toAmino(message: MsgWithdrawProtocolFees): MsgWithdrawProtocolFeesAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.to = message.to === '' ? undefined : message.to;
    return obj;
  },
  fromAminoMsg(object: MsgWithdrawProtocolFeesAminoMsg): MsgWithdrawProtocolFees {
    return MsgWithdrawProtocolFees.fromAmino(object.value);
  },
  toAminoMsg(message: MsgWithdrawProtocolFees): MsgWithdrawProtocolFeesAminoMsg {
    return {
      type: 'swap/WithdrawProtocolFees',
      value: MsgWithdrawProtocolFees.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgWithdrawProtocolFeesProtoMsg): MsgWithdrawProtocolFees {
    return MsgWithdrawProtocolFees.decode(message.value);
  },
  toProto(message: MsgWithdrawProtocolFees): Uint8Array {
    return MsgWithdrawProtocolFees.encode(message).finish();
  },
  toProtoMsg(message: MsgWithdrawProtocolFees): MsgWithdrawProtocolFeesProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFees',
      value: MsgWithdrawProtocolFees.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdrawProtocolFeesResponse(): MsgWithdrawProtocolFeesResponse {
  return {};
}
export const MsgWithdrawProtocolFeesResponse = {
  typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFeesResponse',
  encode(_: MsgWithdrawProtocolFeesResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWithdrawProtocolFeesResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawProtocolFeesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgWithdrawProtocolFeesResponse>): MsgWithdrawProtocolFeesResponse {
    const message = createBaseMsgWithdrawProtocolFeesResponse();
    return message;
  },
  fromAmino(_: MsgWithdrawProtocolFeesResponseAmino): MsgWithdrawProtocolFeesResponse {
    const message = createBaseMsgWithdrawProtocolFeesResponse();
    return message;
  },
  toAmino(_: MsgWithdrawProtocolFeesResponse): MsgWithdrawProtocolFeesResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgWithdrawProtocolFeesResponseAminoMsg): MsgWithdrawProtocolFeesResponse {
    return MsgWithdrawProtocolFeesResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWithdrawProtocolFeesResponseProtoMsg): MsgWithdrawProtocolFeesResponse {
    return MsgWithdrawProtocolFeesResponse.decode(message.value);
  },
  toProto(message: MsgWithdrawProtocolFeesResponse): Uint8Array {
    return MsgWithdrawProtocolFeesResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgWithdrawProtocolFeesResponse): MsgWithdrawProtocolFeesResponseProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFeesResponse',
      value: MsgWithdrawProtocolFeesResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdrawRewards(): MsgWithdrawRewards {
  return {
    signer: '',
  };
}
export const MsgWithdrawRewards = {
  typeUrl: '/noble.swap.v1.MsgWithdrawRewards',
  encode(message: MsgWithdrawRewards, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWithdrawRewards {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawRewards();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWithdrawRewards>): MsgWithdrawRewards {
    const message = createBaseMsgWithdrawRewards();
    message.signer = object.signer ?? '';
    return message;
  },
  fromAmino(object: MsgWithdrawRewardsAmino): MsgWithdrawRewards {
    const message = createBaseMsgWithdrawRewards();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    return message;
  },
  toAmino(message: MsgWithdrawRewards): MsgWithdrawRewardsAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    return obj;
  },
  fromAminoMsg(object: MsgWithdrawRewardsAminoMsg): MsgWithdrawRewards {
    return MsgWithdrawRewards.fromAmino(object.value);
  },
  toAminoMsg(message: MsgWithdrawRewards): MsgWithdrawRewardsAminoMsg {
    return {
      type: 'swap/WithdrawRewards',
      value: MsgWithdrawRewards.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgWithdrawRewardsProtoMsg): MsgWithdrawRewards {
    return MsgWithdrawRewards.decode(message.value);
  },
  toProto(message: MsgWithdrawRewards): Uint8Array {
    return MsgWithdrawRewards.encode(message).finish();
  },
  toProtoMsg(message: MsgWithdrawRewards): MsgWithdrawRewardsProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgWithdrawRewards',
      value: MsgWithdrawRewards.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdrawRewardsResponse(): MsgWithdrawRewardsResponse {
  return {
    rewards: [],
  };
}
export const MsgWithdrawRewardsResponse = {
  typeUrl: '/noble.swap.v1.MsgWithdrawRewardsResponse',
  encode(message: MsgWithdrawRewardsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.rewards) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWithdrawRewardsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawRewardsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rewards.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWithdrawRewardsResponse>): MsgWithdrawRewardsResponse {
    const message = createBaseMsgWithdrawRewardsResponse();
    message.rewards = object.rewards?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgWithdrawRewardsResponseAmino): MsgWithdrawRewardsResponse {
    const message = createBaseMsgWithdrawRewardsResponse();
    message.rewards = object.rewards?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgWithdrawRewardsResponse): MsgWithdrawRewardsResponseAmino {
    const obj: any = {};
    if (message.rewards) {
      obj.rewards = message.rewards.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.rewards = message.rewards;
    }
    return obj;
  },
  fromAminoMsg(object: MsgWithdrawRewardsResponseAminoMsg): MsgWithdrawRewardsResponse {
    return MsgWithdrawRewardsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWithdrawRewardsResponseProtoMsg): MsgWithdrawRewardsResponse {
    return MsgWithdrawRewardsResponse.decode(message.value);
  },
  toProto(message: MsgWithdrawRewardsResponse): Uint8Array {
    return MsgWithdrawRewardsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgWithdrawRewardsResponse): MsgWithdrawRewardsResponseProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgWithdrawRewardsResponse',
      value: MsgWithdrawRewardsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSwap(): MsgSwap {
  return {
    signer: '',
    amount: Coin.fromPartial({}),
    routes: [],
    min: Coin.fromPartial({}),
  };
}
export const MsgSwap = {
  typeUrl: '/noble.swap.v1.MsgSwap',
  encode(message: MsgSwap, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.routes) {
      Route.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.min !== undefined) {
      Coin.encode(message.min, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSwap {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSwap();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        case 3:
          message.routes.push(Route.decode(reader, reader.uint32()));
          break;
        case 4:
          message.min = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSwap>): MsgSwap {
    const message = createBaseMsgSwap();
    message.signer = object.signer ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    message.routes = object.routes?.map((e) => Route.fromPartial(e)) || [];
    message.min = object.min !== undefined && object.min !== null ? Coin.fromPartial(object.min) : undefined;
    return message;
  },
  fromAmino(object: MsgSwapAmino): MsgSwap {
    const message = createBaseMsgSwap();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    message.routes = object.routes?.map((e) => Route.fromAmino(e)) || [];
    if (object.min !== undefined && object.min !== null) {
      message.min = Coin.fromAmino(object.min);
    }
    return message;
  },
  toAmino(message: MsgSwap): MsgSwapAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    if (message.routes) {
      obj.routes = message.routes.map((e) => (e ? Route.toAmino(e) : undefined));
    } else {
      obj.routes = message.routes;
    }
    obj.min = message.min ? Coin.toAmino(message.min) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSwapAminoMsg): MsgSwap {
    return MsgSwap.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSwap): MsgSwapAminoMsg {
    return {
      type: 'swap/Swap',
      value: MsgSwap.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSwapProtoMsg): MsgSwap {
    return MsgSwap.decode(message.value);
  },
  toProto(message: MsgSwap): Uint8Array {
    return MsgSwap.encode(message).finish();
  },
  toProtoMsg(message: MsgSwap): MsgSwapProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgSwap',
      value: MsgSwap.encode(message).finish(),
    };
  },
};
function createBaseMsgSwapResponse(): MsgSwapResponse {
  return {
    result: Coin.fromPartial({}),
    swaps: [],
  };
}
export const MsgSwapResponse = {
  typeUrl: '/noble.swap.v1.MsgSwapResponse',
  encode(message: MsgSwapResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.result !== undefined) {
      Coin.encode(message.result, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.swaps) {
      Swap.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSwapResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSwapResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.result = Coin.decode(reader, reader.uint32());
          break;
        case 2:
          message.swaps.push(Swap.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSwapResponse>): MsgSwapResponse {
    const message = createBaseMsgSwapResponse();
    message.result =
      object.result !== undefined && object.result !== null ? Coin.fromPartial(object.result) : undefined;
    message.swaps = object.swaps?.map((e) => Swap.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgSwapResponseAmino): MsgSwapResponse {
    const message = createBaseMsgSwapResponse();
    if (object.result !== undefined && object.result !== null) {
      message.result = Coin.fromAmino(object.result);
    }
    message.swaps = object.swaps?.map((e) => Swap.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgSwapResponse): MsgSwapResponseAmino {
    const obj: any = {};
    obj.result = message.result ? Coin.toAmino(message.result) : undefined;
    if (message.swaps) {
      obj.swaps = message.swaps.map((e) => (e ? Swap.toAmino(e) : undefined));
    } else {
      obj.swaps = message.swaps;
    }
    return obj;
  },
  fromAminoMsg(object: MsgSwapResponseAminoMsg): MsgSwapResponse {
    return MsgSwapResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSwapResponseProtoMsg): MsgSwapResponse {
    return MsgSwapResponse.decode(message.value);
  },
  toProto(message: MsgSwapResponse): Uint8Array {
    return MsgSwapResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgSwapResponse): MsgSwapResponseProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgSwapResponse',
      value: MsgSwapResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgPauseByAlgorithm(): MsgPauseByAlgorithm {
  return {
    signer: '',
    algorithm: 0,
  };
}
export const MsgPauseByAlgorithm = {
  typeUrl: '/noble.swap.v1.MsgPauseByAlgorithm',
  encode(message: MsgPauseByAlgorithm, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.algorithm !== 0) {
      writer.uint32(16).int32(message.algorithm);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPauseByAlgorithm {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPauseByAlgorithm();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.algorithm = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgPauseByAlgorithm>): MsgPauseByAlgorithm {
    const message = createBaseMsgPauseByAlgorithm();
    message.signer = object.signer ?? '';
    message.algorithm = object.algorithm ?? 0;
    return message;
  },
  fromAmino(object: MsgPauseByAlgorithmAmino): MsgPauseByAlgorithm {
    const message = createBaseMsgPauseByAlgorithm();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.algorithm !== undefined && object.algorithm !== null) {
      message.algorithm = object.algorithm;
    }
    return message;
  },
  toAmino(message: MsgPauseByAlgorithm): MsgPauseByAlgorithmAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.algorithm = message.algorithm === 0 ? undefined : message.algorithm;
    return obj;
  },
  fromAminoMsg(object: MsgPauseByAlgorithmAminoMsg): MsgPauseByAlgorithm {
    return MsgPauseByAlgorithm.fromAmino(object.value);
  },
  toAminoMsg(message: MsgPauseByAlgorithm): MsgPauseByAlgorithmAminoMsg {
    return {
      type: 'swap/PauseByAlgorithm',
      value: MsgPauseByAlgorithm.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgPauseByAlgorithmProtoMsg): MsgPauseByAlgorithm {
    return MsgPauseByAlgorithm.decode(message.value);
  },
  toProto(message: MsgPauseByAlgorithm): Uint8Array {
    return MsgPauseByAlgorithm.encode(message).finish();
  },
  toProtoMsg(message: MsgPauseByAlgorithm): MsgPauseByAlgorithmProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgPauseByAlgorithm',
      value: MsgPauseByAlgorithm.encode(message).finish(),
    };
  },
};
function createBaseMsgPauseByAlgorithmResponse(): MsgPauseByAlgorithmResponse {
  return {
    pausedPools: [],
  };
}
export const MsgPauseByAlgorithmResponse = {
  typeUrl: '/noble.swap.v1.MsgPauseByAlgorithmResponse',
  encode(message: MsgPauseByAlgorithmResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.pausedPools) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPauseByAlgorithmResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPauseByAlgorithmResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.pausedPools.push(reader.uint64());
            }
          } else {
            message.pausedPools.push(reader.uint64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgPauseByAlgorithmResponse>): MsgPauseByAlgorithmResponse {
    const message = createBaseMsgPauseByAlgorithmResponse();
    message.pausedPools = object.pausedPools?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: MsgPauseByAlgorithmResponseAmino): MsgPauseByAlgorithmResponse {
    const message = createBaseMsgPauseByAlgorithmResponse();
    message.pausedPools = object.paused_pools?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: MsgPauseByAlgorithmResponse): MsgPauseByAlgorithmResponseAmino {
    const obj: any = {};
    if (message.pausedPools) {
      obj.paused_pools = message.pausedPools.map((e) => e.toString());
    } else {
      obj.paused_pools = message.pausedPools;
    }
    return obj;
  },
  fromAminoMsg(object: MsgPauseByAlgorithmResponseAminoMsg): MsgPauseByAlgorithmResponse {
    return MsgPauseByAlgorithmResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgPauseByAlgorithmResponseProtoMsg): MsgPauseByAlgorithmResponse {
    return MsgPauseByAlgorithmResponse.decode(message.value);
  },
  toProto(message: MsgPauseByAlgorithmResponse): Uint8Array {
    return MsgPauseByAlgorithmResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgPauseByAlgorithmResponse): MsgPauseByAlgorithmResponseProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgPauseByAlgorithmResponse',
      value: MsgPauseByAlgorithmResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgPauseByPoolIds(): MsgPauseByPoolIds {
  return {
    signer: '',
    poolIds: [],
  };
}
export const MsgPauseByPoolIds = {
  typeUrl: '/noble.swap.v1.MsgPauseByPoolIds',
  encode(message: MsgPauseByPoolIds, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    writer.uint32(18).fork();
    for (const v of message.poolIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPauseByPoolIds {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPauseByPoolIds();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.poolIds.push(reader.uint64());
            }
          } else {
            message.poolIds.push(reader.uint64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgPauseByPoolIds>): MsgPauseByPoolIds {
    const message = createBaseMsgPauseByPoolIds();
    message.signer = object.signer ?? '';
    message.poolIds = object.poolIds?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: MsgPauseByPoolIdsAmino): MsgPauseByPoolIds {
    const message = createBaseMsgPauseByPoolIds();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    message.poolIds = object.pool_ids?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: MsgPauseByPoolIds): MsgPauseByPoolIdsAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    if (message.poolIds) {
      obj.pool_ids = message.poolIds.map((e) => e.toString());
    } else {
      obj.pool_ids = message.poolIds;
    }
    return obj;
  },
  fromAminoMsg(object: MsgPauseByPoolIdsAminoMsg): MsgPauseByPoolIds {
    return MsgPauseByPoolIds.fromAmino(object.value);
  },
  toAminoMsg(message: MsgPauseByPoolIds): MsgPauseByPoolIdsAminoMsg {
    return {
      type: 'swap/PauseByPoolIds',
      value: MsgPauseByPoolIds.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgPauseByPoolIdsProtoMsg): MsgPauseByPoolIds {
    return MsgPauseByPoolIds.decode(message.value);
  },
  toProto(message: MsgPauseByPoolIds): Uint8Array {
    return MsgPauseByPoolIds.encode(message).finish();
  },
  toProtoMsg(message: MsgPauseByPoolIds): MsgPauseByPoolIdsProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgPauseByPoolIds',
      value: MsgPauseByPoolIds.encode(message).finish(),
    };
  },
};
function createBaseMsgPauseByPoolIdsResponse(): MsgPauseByPoolIdsResponse {
  return {
    pausedPools: [],
  };
}
export const MsgPauseByPoolIdsResponse = {
  typeUrl: '/noble.swap.v1.MsgPauseByPoolIdsResponse',
  encode(message: MsgPauseByPoolIdsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.pausedPools) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPauseByPoolIdsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPauseByPoolIdsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.pausedPools.push(reader.uint64());
            }
          } else {
            message.pausedPools.push(reader.uint64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgPauseByPoolIdsResponse>): MsgPauseByPoolIdsResponse {
    const message = createBaseMsgPauseByPoolIdsResponse();
    message.pausedPools = object.pausedPools?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: MsgPauseByPoolIdsResponseAmino): MsgPauseByPoolIdsResponse {
    const message = createBaseMsgPauseByPoolIdsResponse();
    message.pausedPools = object.paused_pools?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: MsgPauseByPoolIdsResponse): MsgPauseByPoolIdsResponseAmino {
    const obj: any = {};
    if (message.pausedPools) {
      obj.paused_pools = message.pausedPools.map((e) => e.toString());
    } else {
      obj.paused_pools = message.pausedPools;
    }
    return obj;
  },
  fromAminoMsg(object: MsgPauseByPoolIdsResponseAminoMsg): MsgPauseByPoolIdsResponse {
    return MsgPauseByPoolIdsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgPauseByPoolIdsResponseProtoMsg): MsgPauseByPoolIdsResponse {
    return MsgPauseByPoolIdsResponse.decode(message.value);
  },
  toProto(message: MsgPauseByPoolIdsResponse): Uint8Array {
    return MsgPauseByPoolIdsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgPauseByPoolIdsResponse): MsgPauseByPoolIdsResponseProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgPauseByPoolIdsResponse',
      value: MsgPauseByPoolIdsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUnpauseByAlgorithm(): MsgUnpauseByAlgorithm {
  return {
    signer: '',
    algorithm: 0,
  };
}
export const MsgUnpauseByAlgorithm = {
  typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithm',
  encode(message: MsgUnpauseByAlgorithm, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.algorithm !== 0) {
      writer.uint32(16).int32(message.algorithm);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUnpauseByAlgorithm {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnpauseByAlgorithm();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.algorithm = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUnpauseByAlgorithm>): MsgUnpauseByAlgorithm {
    const message = createBaseMsgUnpauseByAlgorithm();
    message.signer = object.signer ?? '';
    message.algorithm = object.algorithm ?? 0;
    return message;
  },
  fromAmino(object: MsgUnpauseByAlgorithmAmino): MsgUnpauseByAlgorithm {
    const message = createBaseMsgUnpauseByAlgorithm();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.algorithm !== undefined && object.algorithm !== null) {
      message.algorithm = object.algorithm;
    }
    return message;
  },
  toAmino(message: MsgUnpauseByAlgorithm): MsgUnpauseByAlgorithmAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.algorithm = message.algorithm === 0 ? undefined : message.algorithm;
    return obj;
  },
  fromAminoMsg(object: MsgUnpauseByAlgorithmAminoMsg): MsgUnpauseByAlgorithm {
    return MsgUnpauseByAlgorithm.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUnpauseByAlgorithm): MsgUnpauseByAlgorithmAminoMsg {
    return {
      type: 'swap/UnpauseByAlgorithm',
      value: MsgUnpauseByAlgorithm.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUnpauseByAlgorithmProtoMsg): MsgUnpauseByAlgorithm {
    return MsgUnpauseByAlgorithm.decode(message.value);
  },
  toProto(message: MsgUnpauseByAlgorithm): Uint8Array {
    return MsgUnpauseByAlgorithm.encode(message).finish();
  },
  toProtoMsg(message: MsgUnpauseByAlgorithm): MsgUnpauseByAlgorithmProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithm',
      value: MsgUnpauseByAlgorithm.encode(message).finish(),
    };
  },
};
function createBaseMsgUnpauseByAlgorithmResponse(): MsgUnpauseByAlgorithmResponse {
  return {
    unpausedPools: [],
  };
}
export const MsgUnpauseByAlgorithmResponse = {
  typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithmResponse',
  encode(message: MsgUnpauseByAlgorithmResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.unpausedPools) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUnpauseByAlgorithmResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnpauseByAlgorithmResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.unpausedPools.push(reader.uint64());
            }
          } else {
            message.unpausedPools.push(reader.uint64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUnpauseByAlgorithmResponse>): MsgUnpauseByAlgorithmResponse {
    const message = createBaseMsgUnpauseByAlgorithmResponse();
    message.unpausedPools = object.unpausedPools?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: MsgUnpauseByAlgorithmResponseAmino): MsgUnpauseByAlgorithmResponse {
    const message = createBaseMsgUnpauseByAlgorithmResponse();
    message.unpausedPools = object.unpaused_pools?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: MsgUnpauseByAlgorithmResponse): MsgUnpauseByAlgorithmResponseAmino {
    const obj: any = {};
    if (message.unpausedPools) {
      obj.unpaused_pools = message.unpausedPools.map((e) => e.toString());
    } else {
      obj.unpaused_pools = message.unpausedPools;
    }
    return obj;
  },
  fromAminoMsg(object: MsgUnpauseByAlgorithmResponseAminoMsg): MsgUnpauseByAlgorithmResponse {
    return MsgUnpauseByAlgorithmResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUnpauseByAlgorithmResponseProtoMsg): MsgUnpauseByAlgorithmResponse {
    return MsgUnpauseByAlgorithmResponse.decode(message.value);
  },
  toProto(message: MsgUnpauseByAlgorithmResponse): Uint8Array {
    return MsgUnpauseByAlgorithmResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUnpauseByAlgorithmResponse): MsgUnpauseByAlgorithmResponseProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithmResponse',
      value: MsgUnpauseByAlgorithmResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUnpauseByPoolIds(): MsgUnpauseByPoolIds {
  return {
    signer: '',
    poolIds: [],
  };
}
export const MsgUnpauseByPoolIds = {
  typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIds',
  encode(message: MsgUnpauseByPoolIds, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    writer.uint32(18).fork();
    for (const v of message.poolIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUnpauseByPoolIds {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnpauseByPoolIds();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.poolIds.push(reader.uint64());
            }
          } else {
            message.poolIds.push(reader.uint64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUnpauseByPoolIds>): MsgUnpauseByPoolIds {
    const message = createBaseMsgUnpauseByPoolIds();
    message.signer = object.signer ?? '';
    message.poolIds = object.poolIds?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: MsgUnpauseByPoolIdsAmino): MsgUnpauseByPoolIds {
    const message = createBaseMsgUnpauseByPoolIds();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    message.poolIds = object.pool_ids?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: MsgUnpauseByPoolIds): MsgUnpauseByPoolIdsAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    if (message.poolIds) {
      obj.pool_ids = message.poolIds.map((e) => e.toString());
    } else {
      obj.pool_ids = message.poolIds;
    }
    return obj;
  },
  fromAminoMsg(object: MsgUnpauseByPoolIdsAminoMsg): MsgUnpauseByPoolIds {
    return MsgUnpauseByPoolIds.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUnpauseByPoolIds): MsgUnpauseByPoolIdsAminoMsg {
    return {
      type: 'swap/UnpauseByPoolIds',
      value: MsgUnpauseByPoolIds.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUnpauseByPoolIdsProtoMsg): MsgUnpauseByPoolIds {
    return MsgUnpauseByPoolIds.decode(message.value);
  },
  toProto(message: MsgUnpauseByPoolIds): Uint8Array {
    return MsgUnpauseByPoolIds.encode(message).finish();
  },
  toProtoMsg(message: MsgUnpauseByPoolIds): MsgUnpauseByPoolIdsProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIds',
      value: MsgUnpauseByPoolIds.encode(message).finish(),
    };
  },
};
function createBaseMsgUnpauseByPoolIdsResponse(): MsgUnpauseByPoolIdsResponse {
  return {
    unpausedPools: [],
  };
}
export const MsgUnpauseByPoolIdsResponse = {
  typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIdsResponse',
  encode(message: MsgUnpauseByPoolIdsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.unpausedPools) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUnpauseByPoolIdsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnpauseByPoolIdsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.unpausedPools.push(reader.uint64());
            }
          } else {
            message.unpausedPools.push(reader.uint64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUnpauseByPoolIdsResponse>): MsgUnpauseByPoolIdsResponse {
    const message = createBaseMsgUnpauseByPoolIdsResponse();
    message.unpausedPools = object.unpausedPools?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: MsgUnpauseByPoolIdsResponseAmino): MsgUnpauseByPoolIdsResponse {
    const message = createBaseMsgUnpauseByPoolIdsResponse();
    message.unpausedPools = object.unpaused_pools?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: MsgUnpauseByPoolIdsResponse): MsgUnpauseByPoolIdsResponseAmino {
    const obj: any = {};
    if (message.unpausedPools) {
      obj.unpaused_pools = message.unpausedPools.map((e) => e.toString());
    } else {
      obj.unpaused_pools = message.unpausedPools;
    }
    return obj;
  },
  fromAminoMsg(object: MsgUnpauseByPoolIdsResponseAminoMsg): MsgUnpauseByPoolIdsResponse {
    return MsgUnpauseByPoolIdsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUnpauseByPoolIdsResponseProtoMsg): MsgUnpauseByPoolIdsResponse {
    return MsgUnpauseByPoolIdsResponse.decode(message.value);
  },
  toProto(message: MsgUnpauseByPoolIdsResponse): Uint8Array {
    return MsgUnpauseByPoolIdsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUnpauseByPoolIdsResponse): MsgUnpauseByPoolIdsResponseProtoMsg {
    return {
      typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIdsResponse',
      value: MsgUnpauseByPoolIdsResponse.encode(message).finish(),
    };
  },
};

export interface MsgClaimYield {
  signer: string;
}
export interface MsgClaimYieldProtoMsg {
  typeUrl: '/noble.dollar.v1.MsgClaimYield';
  value: Uint8Array;
}
/** MsgClaimYield is a message holders of the Noble Dollar can use to claim their yield. */
export interface MsgClaimYieldAmino {
  signer?: string;
}
export interface MsgClaimYieldAminoMsg {
  type: 'dollar/ClaimYield';
  value: MsgClaimYieldAmino;
}
/** MsgClaimYield is a message holders of the Noble Dollar can use to claim their yield. */
export interface MsgClaimYieldSDKType {
  signer: string;
}
/** MsgClaimYieldResponse is the response of the ClaimYield message. */
export interface MsgClaimYieldResponse {}
export interface MsgClaimYieldResponseProtoMsg {
  typeUrl: '/noble.dollar.v1.MsgClaimYieldResponse';
  value: Uint8Array;
}
/** MsgClaimYieldResponse is the response of the ClaimYield message. */
export interface MsgClaimYieldResponseAmino {}
export interface MsgClaimYieldResponseAminoMsg {
  type: '/noble.dollar.v1.MsgClaimYieldResponse';
  value: MsgClaimYieldResponseAmino;
}
/** MsgClaimYieldResponse is the response of the ClaimYield message. */
export interface MsgClaimYieldResponseSDKType {}
/** MsgSetPausedState allows the authority to configure the Noble Dollar Portal paused state. */
export interface MsgSetPausedState {
  signer: string;
  paused: boolean;
}
export interface MsgSetPausedStateProtoMsg {
  typeUrl: '/noble.dollar.v1.MsgSetPausedState';
  value: Uint8Array;
}
/** MsgSetPausedState allows the authority to configure the Noble Dollar Portal paused state. */
export interface MsgSetPausedStateAmino {
  signer?: string;
  paused?: boolean;
}
export interface MsgSetPausedStateAminoMsg {
  type: 'dollar/SetPausedState';
  value: MsgSetPausedStateAmino;
}
/** MsgSetPausedState allows the authority to configure the Noble Dollar Portal paused state. */
export interface MsgSetPausedStateSDKType {
  signer: string;
  paused: boolean;
}
/** MsgSetPausedStateResponse is the response of the SetPausedState message. */
export interface MsgSetPausedStateResponse {}
export interface MsgSetPausedStateResponseProtoMsg {
  typeUrl: '/noble.dollar.v1.MsgSetPausedStateResponse';
  value: Uint8Array;
}
/** MsgSetPausedStateResponse is the response of the SetPausedState message. */
export interface MsgSetPausedStateResponseAmino {}
export interface MsgSetPausedStateResponseAminoMsg {
  type: '/noble.dollar.v1.MsgSetPausedStateResponse';
  value: MsgSetPausedStateResponseAmino;
}
/** MsgSetPausedStateResponse is the response of the SetPausedState message. */
export interface MsgSetPausedStateResponseSDKType {}
function createBaseMsgClaimYield(): MsgClaimYield {
  return {
    signer: '',
  };
}
export const MsgClaimYield = {
  typeUrl: '/noble.dollar.v1.MsgClaimYield',
  encode(message: MsgClaimYield, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimYield {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimYield();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgClaimYield>): MsgClaimYield {
    const message = createBaseMsgClaimYield();
    message.signer = object.signer ?? '';
    return message;
  },
  fromAmino(object: MsgClaimYieldAmino): MsgClaimYield {
    const message = createBaseMsgClaimYield();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    return message;
  },
  toAmino(message: MsgClaimYield): MsgClaimYieldAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    return obj;
  },
  fromAminoMsg(object: MsgClaimYieldAminoMsg): MsgClaimYield {
    return MsgClaimYield.fromAmino(object.value);
  },
  toAminoMsg(message: MsgClaimYield): MsgClaimYieldAminoMsg {
    return {
      type: 'dollar/ClaimYield',
      value: MsgClaimYield.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgClaimYieldProtoMsg): MsgClaimYield {
    return MsgClaimYield.decode(message.value);
  },
  toProto(message: MsgClaimYield): Uint8Array {
    return MsgClaimYield.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimYield): MsgClaimYieldProtoMsg {
    return {
      typeUrl: '/noble.dollar.v1.MsgClaimYield',
      value: MsgClaimYield.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimYieldResponse(): MsgClaimYieldResponse {
  return {};
}
export const MsgClaimYieldResponse = {
  typeUrl: '/noble.dollar.v1.MsgClaimYieldResponse',
  encode(_: MsgClaimYieldResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimYieldResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimYieldResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgClaimYieldResponse>): MsgClaimYieldResponse {
    const message = createBaseMsgClaimYieldResponse();
    return message;
  },
  fromAmino(_: MsgClaimYieldResponseAmino): MsgClaimYieldResponse {
    const message = createBaseMsgClaimYieldResponse();
    return message;
  },
  toAmino(_: MsgClaimYieldResponse): MsgClaimYieldResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgClaimYieldResponseAminoMsg): MsgClaimYieldResponse {
    return MsgClaimYieldResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgClaimYieldResponseProtoMsg): MsgClaimYieldResponse {
    return MsgClaimYieldResponse.decode(message.value);
  },
  toProto(message: MsgClaimYieldResponse): Uint8Array {
    return MsgClaimYieldResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimYieldResponse): MsgClaimYieldResponseProtoMsg {
    return {
      typeUrl: '/noble.dollar.v1.MsgClaimYieldResponse',
      value: MsgClaimYieldResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetPausedState(): MsgSetPausedState {
  return {
    signer: '',
    paused: false,
  };
}
export const MsgSetPausedState = {
  typeUrl: '/noble.dollar.v1.MsgSetPausedState',
  encode(message: MsgSetPausedState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.paused === true) {
      writer.uint32(16).bool(message.paused);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSetPausedState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetPausedState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.paused = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetPausedState>): MsgSetPausedState {
    const message = createBaseMsgSetPausedState();
    message.signer = object.signer ?? '';
    message.paused = object.paused ?? false;
    return message;
  },
  fromAmino(object: MsgSetPausedStateAmino): MsgSetPausedState {
    const message = createBaseMsgSetPausedState();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.paused !== undefined && object.paused !== null) {
      message.paused = object.paused;
    }
    return message;
  },
  toAmino(message: MsgSetPausedState): MsgSetPausedStateAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.paused = message.paused === false ? undefined : message.paused;
    return obj;
  },
  fromAminoMsg(object: MsgSetPausedStateAminoMsg): MsgSetPausedState {
    return MsgSetPausedState.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSetPausedState): MsgSetPausedStateAminoMsg {
    return {
      type: 'dollar/SetPausedState',
      value: MsgSetPausedState.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSetPausedStateProtoMsg): MsgSetPausedState {
    return MsgSetPausedState.decode(message.value);
  },
  toProto(message: MsgSetPausedState): Uint8Array {
    return MsgSetPausedState.encode(message).finish();
  },
  toProtoMsg(message: MsgSetPausedState): MsgSetPausedStateProtoMsg {
    return {
      typeUrl: '/noble.dollar.v1.MsgSetPausedState',
      value: MsgSetPausedState.encode(message).finish(),
    };
  },
};
function createBaseMsgSetPausedStateResponse(): MsgSetPausedStateResponse {
  return {};
}
export const MsgSetPausedStateResponse = {
  typeUrl: '/noble.dollar.v1.MsgSetPausedStateResponse',
  encode(_: MsgSetPausedStateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSetPausedStateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetPausedStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgSetPausedStateResponse>): MsgSetPausedStateResponse {
    const message = createBaseMsgSetPausedStateResponse();
    return message;
  },
  fromAmino(_: MsgSetPausedStateResponseAmino): MsgSetPausedStateResponse {
    const message = createBaseMsgSetPausedStateResponse();
    return message;
  },
  toAmino(_: MsgSetPausedStateResponse): MsgSetPausedStateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgSetPausedStateResponseAminoMsg): MsgSetPausedStateResponse {
    return MsgSetPausedStateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSetPausedStateResponseProtoMsg): MsgSetPausedStateResponse {
    return MsgSetPausedStateResponse.decode(message.value);
  },
  toProto(message: MsgSetPausedStateResponse): Uint8Array {
    return MsgSetPausedStateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgSetPausedStateResponse): MsgSetPausedStateResponseProtoMsg {
    return {
      typeUrl: '/noble.dollar.v1.MsgSetPausedStateResponse',
      value: MsgSetPausedStateResponse.encode(message).finish(),
    };
  },
};
