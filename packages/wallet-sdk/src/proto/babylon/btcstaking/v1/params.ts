import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
/** Params defines the parameters for the module. */
export interface Params {
  /**
   * covenant_pks is the list of public keys held by the covenant committee
   * each PK follows encoding in BIP-340 spec on Bitcoin
   */
  covenantPks: Uint8Array[];
  /**
   * covenant_quorum is the minimum number of signatures needed for the covenant
   * multisignature
   */
  covenantQuorum: number;
  /**
   * slashing address is the address that the slashed BTC goes to
   * the address is in string on Bitcoin
   */
  slashingAddress: string;
  /**
   * min_slashing_tx_fee_sat is the minimum amount of tx fee (quantified
   * in Satoshi) needed for the pre-signed slashing tx
   * TODO: change to satoshi per byte?
   */
  minSlashingTxFeeSat: bigint;
  /** min_commission_rate is the chain-wide minimum commission rate that a finality provider can charge their delegators */
  minCommissionRate: string;
  /**
   * slashing_rate determines the portion of the staked amount to be slashed,
   * expressed as a decimal (e.g., 0.5 for 50%).
   */
  slashingRate: string;
  /** max_active_finality_providers is the maximum number of active finality providers in the BTC staking protocol */
  maxActiveFinalityProviders: number;
  /** min_unbonding_time is the minimum time for unbonding transaction timelock in BTC blocks */
  minUnbondingTime: number;
  /**
   * min_unbonding_rate is the minimum amount of BTC that are required in unbonding
   * output, expressed as a fraction of staking output
   * example: if min_unbonding_rate=0.9, then the unbonding output value
   * must be at least 90% of staking output, for staking request to be considered
   * valid
   */
  minUnbondingRate: string;
}
export interface ParamsProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.Params';
  value: Uint8Array;
}
/** Params defines the parameters for the module. */
export interface ParamsAmino {
  /**
   * covenant_pks is the list of public keys held by the covenant committee
   * each PK follows encoding in BIP-340 spec on Bitcoin
   */
  covenant_pks?: string[];
  /**
   * covenant_quorum is the minimum number of signatures needed for the covenant
   * multisignature
   */
  covenant_quorum?: number;
  /**
   * slashing address is the address that the slashed BTC goes to
   * the address is in string on Bitcoin
   */
  slashing_address?: string;
  /**
   * min_slashing_tx_fee_sat is the minimum amount of tx fee (quantified
   * in Satoshi) needed for the pre-signed slashing tx
   * TODO: change to satoshi per byte?
   */
  min_slashing_tx_fee_sat?: string;
  /** min_commission_rate is the chain-wide minimum commission rate that a finality provider can charge their delegators */
  min_commission_rate?: string;
  /**
   * slashing_rate determines the portion of the staked amount to be slashed,
   * expressed as a decimal (e.g., 0.5 for 50%).
   */
  slashing_rate?: string;
  /** max_active_finality_providers is the maximum number of active finality providers in the BTC staking protocol */
  max_active_finality_providers?: number;
  /** min_unbonding_time is the minimum time for unbonding transaction timelock in BTC blocks */
  min_unbonding_time?: number;
  /**
   * min_unbonding_rate is the minimum amount of BTC that are required in unbonding
   * output, expressed as a fraction of staking output
   * example: if min_unbonding_rate=0.9, then the unbonding output value
   * must be at least 90% of staking output, for staking request to be considered
   * valid
   */
  min_unbonding_rate?: string;
}
export interface ParamsAminoMsg {
  type: '/babylon.btcstaking.v1.Params';
  value: ParamsAmino;
}
/** Params defines the parameters for the module. */
export interface ParamsSDKType {
  covenant_pks: Uint8Array[];
  covenant_quorum: number;
  slashing_address: string;
  min_slashing_tx_fee_sat: bigint;
  min_commission_rate: string;
  slashing_rate: string;
  max_active_finality_providers: number;
  min_unbonding_time: number;
  min_unbonding_rate: string;
}
/** StoredParams attach information about the version of stored parameters */
export interface StoredParams {
  /**
   * version of the stored parameters. Each parameters update
   * increments version number by 1
   */
  version: number;
  /** NOTE: Parameters must always be provided */
  params: Params;
}
export interface StoredParamsProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.StoredParams';
  value: Uint8Array;
}
/** StoredParams attach information about the version of stored parameters */
export interface StoredParamsAmino {
  /**
   * version of the stored parameters. Each parameters update
   * increments version number by 1
   */
  version?: number;
  /** NOTE: Parameters must always be provided */
  params?: ParamsAmino;
}
export interface StoredParamsAminoMsg {
  type: '/babylon.btcstaking.v1.StoredParams';
  value: StoredParamsAmino;
}
/** StoredParams attach information about the version of stored parameters */
export interface StoredParamsSDKType {
  version: number;
  params: ParamsSDKType;
}
function createBaseParams(): Params {
  return {
    covenantPks: [],
    covenantQuorum: 0,
    slashingAddress: '',
    minSlashingTxFeeSat: BigInt(0),
    minCommissionRate: '',
    slashingRate: '',
    maxActiveFinalityProviders: 0,
    minUnbondingTime: 0,
    minUnbondingRate: '',
  };
}
export const Params = {
  typeUrl: '/babylon.btcstaking.v1.Params',
  encode(message: Params, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.covenantPks) {
      writer.uint32(10).bytes(v!);
    }
    if (message.covenantQuorum !== 0) {
      writer.uint32(16).uint32(message.covenantQuorum);
    }
    if (message.slashingAddress !== '') {
      writer.uint32(26).string(message.slashingAddress);
    }
    if (message.minSlashingTxFeeSat !== BigInt(0)) {
      writer.uint32(32).int64(message.minSlashingTxFeeSat);
    }
    if (message.minCommissionRate !== '') {
      writer.uint32(42).string(Decimal.fromUserInput(message.minCommissionRate, 18).atomics);
    }
    if (message.slashingRate !== '') {
      writer.uint32(50).string(Decimal.fromUserInput(message.slashingRate, 18).atomics);
    }
    if (message.maxActiveFinalityProviders !== 0) {
      writer.uint32(56).uint32(message.maxActiveFinalityProviders);
    }
    if (message.minUnbondingTime !== 0) {
      writer.uint32(64).uint32(message.minUnbondingTime);
    }
    if (message.minUnbondingRate !== '') {
      writer.uint32(74).string(Decimal.fromUserInput(message.minUnbondingRate, 18).atomics);
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
          message.covenantPks.push(reader.bytes());
          break;
        case 2:
          message.covenantQuorum = reader.uint32();
          break;
        case 3:
          message.slashingAddress = reader.string();
          break;
        case 4:
          message.minSlashingTxFeeSat = reader.int64();
          break;
        case 5:
          message.minCommissionRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 6:
          message.slashingRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 7:
          message.maxActiveFinalityProviders = reader.uint32();
          break;
        case 8:
          message.minUnbondingTime = reader.uint32();
          break;
        case 9:
          message.minUnbondingRate = Decimal.fromAtomics(reader.string(), 18).toString();
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
    message.covenantPks = object.covenantPks?.map((e) => e) || [];
    message.covenantQuorum = object.covenantQuorum ?? 0;
    message.slashingAddress = object.slashingAddress ?? '';
    message.minSlashingTxFeeSat =
      object.minSlashingTxFeeSat !== undefined && object.minSlashingTxFeeSat !== null
        ? BigInt(object.minSlashingTxFeeSat.toString())
        : BigInt(0);
    message.minCommissionRate = object.minCommissionRate ?? '';
    message.slashingRate = object.slashingRate ?? '';
    message.maxActiveFinalityProviders = object.maxActiveFinalityProviders ?? 0;
    message.minUnbondingTime = object.minUnbondingTime ?? 0;
    message.minUnbondingRate = object.minUnbondingRate ?? '';
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    message.covenantPks = object.covenant_pks?.map((e) => bytesFromBase64(e)) || [];
    if (object.covenant_quorum !== undefined && object.covenant_quorum !== null) {
      message.covenantQuorum = object.covenant_quorum;
    }
    if (object.slashing_address !== undefined && object.slashing_address !== null) {
      message.slashingAddress = object.slashing_address;
    }
    if (object.min_slashing_tx_fee_sat !== undefined && object.min_slashing_tx_fee_sat !== null) {
      message.minSlashingTxFeeSat = BigInt(object.min_slashing_tx_fee_sat);
    }
    if (object.min_commission_rate !== undefined && object.min_commission_rate !== null) {
      message.minCommissionRate = object.min_commission_rate;
    }
    if (object.slashing_rate !== undefined && object.slashing_rate !== null) {
      message.slashingRate = object.slashing_rate;
    }
    if (object.max_active_finality_providers !== undefined && object.max_active_finality_providers !== null) {
      message.maxActiveFinalityProviders = object.max_active_finality_providers;
    }
    if (object.min_unbonding_time !== undefined && object.min_unbonding_time !== null) {
      message.minUnbondingTime = object.min_unbonding_time;
    }
    if (object.min_unbonding_rate !== undefined && object.min_unbonding_rate !== null) {
      message.minUnbondingRate = object.min_unbonding_rate;
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.covenantPks) {
      obj.covenant_pks = message.covenantPks.map((e) => base64FromBytes(e));
    } else {
      obj.covenant_pks = message.covenantPks;
    }
    obj.covenant_quorum = message.covenantQuorum === 0 ? undefined : message.covenantQuorum;
    obj.slashing_address = message.slashingAddress === '' ? undefined : message.slashingAddress;
    obj.min_slashing_tx_fee_sat =
      message.minSlashingTxFeeSat !== BigInt(0) ? message.minSlashingTxFeeSat?.toString() : undefined;
    obj.min_commission_rate = message.minCommissionRate === '' ? undefined : message.minCommissionRate;
    obj.slashing_rate = message.slashingRate === '' ? undefined : message.slashingRate;
    obj.max_active_finality_providers =
      message.maxActiveFinalityProviders === 0 ? undefined : message.maxActiveFinalityProviders;
    obj.min_unbonding_time = message.minUnbondingTime === 0 ? undefined : message.minUnbondingTime;
    obj.min_unbonding_rate = message.minUnbondingRate === '' ? undefined : message.minUnbondingRate;
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
      typeUrl: '/babylon.btcstaking.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseStoredParams(): StoredParams {
  return {
    version: 0,
    params: Params.fromPartial({}),
  };
}
export const StoredParams = {
  typeUrl: '/babylon.btcstaking.v1.StoredParams',
  encode(message: StoredParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.version !== 0) {
      writer.uint32(8).uint32(message.version);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): StoredParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStoredParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.version = reader.uint32();
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<StoredParams>): StoredParams {
    const message = createBaseStoredParams();
    message.version = object.version ?? 0;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    message.params =
      object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined;
    return message;
  },
  fromAmino(object: StoredParamsAmino): StoredParams {
    const message = createBaseStoredParams();
    if (object.version !== undefined && object.version !== null) {
      message.version = object.version;
    }
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    return message;
  },
  toAmino(message: StoredParams): StoredParamsAmino {
    const obj: any = {};
    obj.version = message.version === 0 ? undefined : message.version;
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: StoredParamsAminoMsg): StoredParams {
    return StoredParams.fromAmino(object.value);
  },
  fromProtoMsg(message: StoredParamsProtoMsg): StoredParams {
    return StoredParams.decode(message.value);
  },
  toProto(message: StoredParams): Uint8Array {
    return StoredParams.encode(message).finish();
  },
  toProtoMsg(message: StoredParams): StoredParamsProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.StoredParams',
      value: StoredParams.encode(message).finish(),
    };
  },
};
