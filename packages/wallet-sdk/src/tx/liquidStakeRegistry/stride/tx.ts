/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
import Long from 'long';
import * as _m0 from 'protobufjs/minimal';

import { DeepPartial } from '../../../proto/helpers';
import { ICAAccountType, ICAAccountTypeSDKType } from './ica_account';
import { Validator, ValidatorSDKType } from './validator';
export interface MsgLiquidStake {
  creator: string;
  amount: string;
  hostDenom: string;
}
export interface MsgLiquidStakeSDKType {
  creator: string;
  amount: string;
  host_denom: string;
}
export interface MsgLiquidStakeResponse {}
export interface MsgLiquidStakeResponseSDKType {}
export interface MsgLSMLiquidStake {
  creator: string;
  amount: string;
  lsmTokenIbcDenom: string;
}
export interface MsgLSMLiquidStakeSDKType {
  creator: string;
  amount: string;
  lsm_token_ibc_denom: string;
}
export interface MsgLSMLiquidStakeResponse {
  transactionComplete: boolean;
}
export interface MsgLSMLiquidStakeResponseSDKType {
  transaction_complete: boolean;
}
export interface MsgClearBalance {
  creator: string;
  chainId: string;
  amount: string;
  channel: string;
}
export interface MsgClearBalanceSDKType {
  creator: string;
  chain_id: string;
  amount: string;
  channel: string;
}
export interface MsgClearBalanceResponse {}
export interface MsgClearBalanceResponseSDKType {}
export interface MsgRedeemStake {
  creator: string;
  amount: string;
  hostZone: string;
  receiver: string;
}
export interface MsgRedeemStakeSDKType {
  creator: string;
  amount: string;
  host_zone: string;
  receiver: string;
}
export interface MsgRedeemStakeResponse {}
export interface MsgRedeemStakeResponseSDKType {}
/** next: 15 */

export interface MsgRegisterHostZone {
  connectionId: string;
  bech32prefix: string;
  hostDenom: string;
  ibcDenom: string;
  creator: string;
  transferChannelId: string;
  unbondingPeriod: Long;
  minRedemptionRate: string;
  maxRedemptionRate: string;
  lsmLiquidStakeEnabled: boolean;
}
/** next: 15 */

export interface MsgRegisterHostZoneSDKType {
  connection_id: string;
  bech32prefix: string;
  host_denom: string;
  ibc_denom: string;
  creator: string;
  transfer_channel_id: string;
  unbonding_period: Long;
  min_redemption_rate: string;
  max_redemption_rate: string;
  lsm_liquid_stake_enabled: boolean;
}
export interface MsgRegisterHostZoneResponse {}
export interface MsgRegisterHostZoneResponseSDKType {}
export interface MsgClaimUndelegatedTokens {
  creator: string;
  /** UserUnbondingRecords are keyed on {chain_id}.{epoch}.{sender} */

  hostZoneId: string;
  epoch: Long;
  sender: string;
}
export interface MsgClaimUndelegatedTokensSDKType {
  creator: string;
  /** UserUnbondingRecords are keyed on {chain_id}.{epoch}.{sender} */

  host_zone_id: string;
  epoch: Long;
  sender: string;
}
export interface MsgClaimUndelegatedTokensResponse {}
export interface MsgClaimUndelegatedTokensResponseSDKType {}
export interface MsgRebalanceValidators {
  creator: string;
  hostZone: string;
  numRebalance: Long;
}
export interface MsgRebalanceValidatorsSDKType {
  creator: string;
  host_zone: string;
  num_rebalance: Long;
}
export interface MsgRebalanceValidatorsResponse {}
export interface MsgRebalanceValidatorsResponseSDKType {}
export interface MsgAddValidators {
  creator: string;
  hostZone: string;
  validators: Validator[];
}
export interface MsgAddValidatorsSDKType {
  creator: string;
  host_zone: string;
  validators: ValidatorSDKType[];
}
export interface MsgAddValidatorsResponse {}
export interface MsgAddValidatorsResponseSDKType {}
export interface MsgChangeValidatorWeight {
  creator: string;
  hostZone: string;
  valAddr: string;
  weight: Long;
}
export interface MsgChangeValidatorWeightSDKType {
  creator: string;
  host_zone: string;
  val_addr: string;
  weight: Long;
}
export interface MsgChangeValidatorWeightResponse {}
export interface MsgChangeValidatorWeightResponseSDKType {}
export interface MsgDeleteValidator {
  creator: string;
  hostZone: string;
  valAddr: string;
}
export interface MsgDeleteValidatorSDKType {
  creator: string;
  host_zone: string;
  val_addr: string;
}
export interface MsgDeleteValidatorResponse {}
export interface MsgDeleteValidatorResponseSDKType {}
export interface MsgRestoreInterchainAccount {
  creator: string;
  chainId: string;
  accountType: ICAAccountType;
}
export interface MsgRestoreInterchainAccountSDKType {
  creator: string;
  chain_id: string;
  account_type: ICAAccountTypeSDKType;
}
export interface MsgRestoreInterchainAccountResponse {}
export interface MsgRestoreInterchainAccountResponseSDKType {}
export interface MsgUpdateValidatorSharesExchRate {
  creator: string;
  chainId: string;
  valoper: string;
}
export interface MsgUpdateValidatorSharesExchRateSDKType {
  creator: string;
  chain_id: string;
  valoper: string;
}
export interface MsgUpdateValidatorSharesExchRateResponse {}
export interface MsgUpdateValidatorSharesExchRateResponseSDKType {}

function createBaseMsgLiquidStake(): MsgLiquidStake {
  return {
    creator: '',
    amount: '',
    hostDenom: '',
  };
}

export const MsgLiquidStake = {
  encode(message: MsgLiquidStake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }

    if (message.hostDenom !== '') {
      writer.uint32(26).string(message.hostDenom);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLiquidStake {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLiquidStake();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.amount = reader.string();
          break;

        case 3:
          message.hostDenom = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgLiquidStake>): MsgLiquidStake {
    const message = createBaseMsgLiquidStake();
    message.creator = object.creator ?? '';
    message.amount = object.amount ?? '';
    message.hostDenom = object.hostDenom ?? '';
    return message;
  },
};

function createBaseMsgLiquidStakeResponse(): MsgLiquidStakeResponse {
  return {};
}

export const MsgLiquidStakeResponse = {
  encode(_: MsgLiquidStakeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLiquidStakeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLiquidStakeResponse();

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

  fromPartial(_: DeepPartial<MsgLiquidStakeResponse>): MsgLiquidStakeResponse {
    const message = createBaseMsgLiquidStakeResponse();
    return message;
  },
};

function createBaseMsgLSMLiquidStake(): MsgLSMLiquidStake {
  return {
    creator: '',
    amount: '',
    lsmTokenIbcDenom: '',
  };
}

export const MsgLSMLiquidStake = {
  encode(message: MsgLSMLiquidStake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }

    if (message.lsmTokenIbcDenom !== '') {
      writer.uint32(26).string(message.lsmTokenIbcDenom);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLSMLiquidStake {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLSMLiquidStake();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.amount = reader.string();
          break;

        case 3:
          message.lsmTokenIbcDenom = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgLSMLiquidStake>): MsgLSMLiquidStake {
    const message = createBaseMsgLSMLiquidStake();
    message.creator = object.creator ?? '';
    message.amount = object.amount ?? '';
    message.lsmTokenIbcDenom = object.lsmTokenIbcDenom ?? '';
    return message;
  },
};

function createBaseMsgLSMLiquidStakeResponse(): MsgLSMLiquidStakeResponse {
  return {
    transactionComplete: false,
  };
}

export const MsgLSMLiquidStakeResponse = {
  encode(message: MsgLSMLiquidStakeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transactionComplete === true) {
      writer.uint32(8).bool(message.transactionComplete);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLSMLiquidStakeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLSMLiquidStakeResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.transactionComplete = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgLSMLiquidStakeResponse>): MsgLSMLiquidStakeResponse {
    const message = createBaseMsgLSMLiquidStakeResponse();
    message.transactionComplete = object.transactionComplete ?? false;
    return message;
  },
};

function createBaseMsgClearBalance(): MsgClearBalance {
  return {
    creator: '',
    chainId: '',
    amount: '',
    channel: '',
  };
}

export const MsgClearBalance = {
  encode(message: MsgClearBalance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }

    if (message.amount !== '') {
      writer.uint32(26).string(message.amount);
    }

    if (message.channel !== '') {
      writer.uint32(34).string(message.channel);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgClearBalance {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClearBalance();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.chainId = reader.string();
          break;

        case 3:
          message.amount = reader.string();
          break;

        case 4:
          message.channel = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgClearBalance>): MsgClearBalance {
    const message = createBaseMsgClearBalance();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.amount = object.amount ?? '';
    message.channel = object.channel ?? '';
    return message;
  },
};

function createBaseMsgClearBalanceResponse(): MsgClearBalanceResponse {
  return {};
}

export const MsgClearBalanceResponse = {
  encode(_: MsgClearBalanceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgClearBalanceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClearBalanceResponse();

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

  fromPartial(_: DeepPartial<MsgClearBalanceResponse>): MsgClearBalanceResponse {
    const message = createBaseMsgClearBalanceResponse();
    return message;
  },
};

function createBaseMsgRedeemStake(): MsgRedeemStake {
  return {
    creator: '',
    amount: '',
    hostZone: '',
    receiver: '',
  };
}

export const MsgRedeemStake = {
  encode(message: MsgRedeemStake, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }

    if (message.hostZone !== '') {
      writer.uint32(26).string(message.hostZone);
    }

    if (message.receiver !== '') {
      writer.uint32(34).string(message.receiver);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRedeemStake {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRedeemStake();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.amount = reader.string();
          break;

        case 3:
          message.hostZone = reader.string();
          break;

        case 4:
          message.receiver = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgRedeemStake>): MsgRedeemStake {
    const message = createBaseMsgRedeemStake();
    message.creator = object.creator ?? '';
    message.amount = object.amount ?? '';
    message.hostZone = object.hostZone ?? '';
    message.receiver = object.receiver ?? '';
    return message;
  },
};

function createBaseMsgRedeemStakeResponse(): MsgRedeemStakeResponse {
  return {};
}

export const MsgRedeemStakeResponse = {
  encode(_: MsgRedeemStakeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRedeemStakeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRedeemStakeResponse();

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

  fromPartial(_: DeepPartial<MsgRedeemStakeResponse>): MsgRedeemStakeResponse {
    const message = createBaseMsgRedeemStakeResponse();
    return message;
  },
};

function createBaseMsgRegisterHostZone(): MsgRegisterHostZone {
  return {
    connectionId: '',
    bech32prefix: '',
    hostDenom: '',
    ibcDenom: '',
    creator: '',
    transferChannelId: '',
    unbondingPeriod: Long.UZERO,
    minRedemptionRate: '',
    maxRedemptionRate: '',
    lsmLiquidStakeEnabled: false,
  };
}

export const MsgRegisterHostZone = {
  encode(message: MsgRegisterHostZone, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.connectionId !== '') {
      writer.uint32(18).string(message.connectionId);
    }

    if (message.bech32prefix !== '') {
      writer.uint32(98).string(message.bech32prefix);
    }

    if (message.hostDenom !== '') {
      writer.uint32(34).string(message.hostDenom);
    }

    if (message.ibcDenom !== '') {
      writer.uint32(42).string(message.ibcDenom);
    }

    if (message.creator !== '') {
      writer.uint32(50).string(message.creator);
    }

    if (message.transferChannelId !== '') {
      writer.uint32(82).string(message.transferChannelId);
    }

    if (!message.unbondingPeriod.isZero()) {
      writer.uint32(88).uint64(message.unbondingPeriod);
    }

    if (message.minRedemptionRate !== '') {
      writer.uint32(106).string(message.minRedemptionRate);
    }

    if (message.maxRedemptionRate !== '') {
      writer.uint32(114).string(message.maxRedemptionRate);
    }

    if (message.lsmLiquidStakeEnabled === true) {
      writer.uint32(120).bool(message.lsmLiquidStakeEnabled);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRegisterHostZone {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegisterHostZone();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.connectionId = reader.string();
          break;

        case 12:
          message.bech32prefix = reader.string();
          break;

        case 4:
          message.hostDenom = reader.string();
          break;

        case 5:
          message.ibcDenom = reader.string();
          break;

        case 6:
          message.creator = reader.string();
          break;

        case 10:
          message.transferChannelId = reader.string();
          break;

        case 11:
          message.unbondingPeriod = reader.uint64() as Long;
          break;

        case 13:
          message.minRedemptionRate = reader.string();
          break;

        case 14:
          message.maxRedemptionRate = reader.string();
          break;

        case 15:
          message.lsmLiquidStakeEnabled = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgRegisterHostZone>): MsgRegisterHostZone {
    const message = createBaseMsgRegisterHostZone();
    message.connectionId = object.connectionId ?? '';
    message.bech32prefix = object.bech32prefix ?? '';
    message.hostDenom = object.hostDenom ?? '';
    message.ibcDenom = object.ibcDenom ?? '';
    message.creator = object.creator ?? '';
    message.transferChannelId = object.transferChannelId ?? '';
    message.unbondingPeriod =
      object.unbondingPeriod !== undefined && object.unbondingPeriod !== null
        ? Long.fromValue(object.unbondingPeriod as Long)
        : Long.UZERO;
    message.minRedemptionRate = object.minRedemptionRate ?? '';
    message.maxRedemptionRate = object.maxRedemptionRate ?? '';
    message.lsmLiquidStakeEnabled = object.lsmLiquidStakeEnabled ?? false;
    return message;
  },
};

function createBaseMsgRegisterHostZoneResponse(): MsgRegisterHostZoneResponse {
  return {};
}

export const MsgRegisterHostZoneResponse = {
  encode(_: MsgRegisterHostZoneResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRegisterHostZoneResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegisterHostZoneResponse();

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

  fromPartial(_: DeepPartial<MsgRegisterHostZoneResponse>): MsgRegisterHostZoneResponse {
    const message = createBaseMsgRegisterHostZoneResponse();
    return message;
  },
};

function createBaseMsgClaimUndelegatedTokens(): MsgClaimUndelegatedTokens {
  return {
    creator: '',
    hostZoneId: '',
    epoch: Long.UZERO,
    sender: '',
  };
}

export const MsgClaimUndelegatedTokens = {
  encode(message: MsgClaimUndelegatedTokens, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.hostZoneId !== '') {
      writer.uint32(18).string(message.hostZoneId);
    }

    if (!message.epoch.isZero()) {
      writer.uint32(24).uint64(message.epoch);
    }

    if (message.sender !== '') {
      writer.uint32(34).string(message.sender);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgClaimUndelegatedTokens {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimUndelegatedTokens();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.hostZoneId = reader.string();
          break;

        case 3:
          message.epoch = reader.uint64() as Long;
          break;

        case 4:
          message.sender = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgClaimUndelegatedTokens>): MsgClaimUndelegatedTokens {
    const message = createBaseMsgClaimUndelegatedTokens();
    message.creator = object.creator ?? '';
    message.hostZoneId = object.hostZoneId ?? '';
    message.epoch =
      object.epoch !== undefined && object.epoch !== null ? Long.fromValue(object.epoch as Long) : Long.UZERO;
    message.sender = object.sender ?? '';
    return message;
  },
};

function createBaseMsgClaimUndelegatedTokensResponse(): MsgClaimUndelegatedTokensResponse {
  return {};
}

export const MsgClaimUndelegatedTokensResponse = {
  encode(_: MsgClaimUndelegatedTokensResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgClaimUndelegatedTokensResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimUndelegatedTokensResponse();

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

  fromPartial(_: DeepPartial<MsgClaimUndelegatedTokensResponse>): MsgClaimUndelegatedTokensResponse {
    const message = createBaseMsgClaimUndelegatedTokensResponse();
    return message;
  },
};

function createBaseMsgRebalanceValidators(): MsgRebalanceValidators {
  return {
    creator: '',
    hostZone: '',
    numRebalance: Long.UZERO,
  };
}

export const MsgRebalanceValidators = {
  encode(message: MsgRebalanceValidators, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }

    if (!message.numRebalance.isZero()) {
      writer.uint32(24).uint64(message.numRebalance);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRebalanceValidators {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRebalanceValidators();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.hostZone = reader.string();
          break;

        case 3:
          message.numRebalance = reader.uint64() as Long;
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgRebalanceValidators>): MsgRebalanceValidators {
    const message = createBaseMsgRebalanceValidators();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.numRebalance =
      object.numRebalance !== undefined && object.numRebalance !== null
        ? Long.fromValue(object.numRebalance as Long)
        : Long.UZERO;
    return message;
  },
};

function createBaseMsgRebalanceValidatorsResponse(): MsgRebalanceValidatorsResponse {
  return {};
}

export const MsgRebalanceValidatorsResponse = {
  encode(_: MsgRebalanceValidatorsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRebalanceValidatorsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRebalanceValidatorsResponse();

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

  fromPartial(_: DeepPartial<MsgRebalanceValidatorsResponse>): MsgRebalanceValidatorsResponse {
    const message = createBaseMsgRebalanceValidatorsResponse();
    return message;
  },
};

function createBaseMsgAddValidators(): MsgAddValidators {
  return {
    creator: '',
    hostZone: '',
    validators: [],
  };
}

export const MsgAddValidators = {
  encode(message: MsgAddValidators, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }

    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddValidators {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddValidators();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.hostZone = reader.string();
          break;

        case 3:
          message.validators.push(Validator.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgAddValidators>): MsgAddValidators {
    const message = createBaseMsgAddValidators();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.validators = object.validators?.map((e) => Validator.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMsgAddValidatorsResponse(): MsgAddValidatorsResponse {
  return {};
}

export const MsgAddValidatorsResponse = {
  encode(_: MsgAddValidatorsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddValidatorsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddValidatorsResponse();

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

  fromPartial(_: DeepPartial<MsgAddValidatorsResponse>): MsgAddValidatorsResponse {
    const message = createBaseMsgAddValidatorsResponse();
    return message;
  },
};

function createBaseMsgChangeValidatorWeight(): MsgChangeValidatorWeight {
  return {
    creator: '',
    hostZone: '',
    valAddr: '',
    weight: Long.UZERO,
  };
}

export const MsgChangeValidatorWeight = {
  encode(message: MsgChangeValidatorWeight, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }

    if (message.valAddr !== '') {
      writer.uint32(26).string(message.valAddr);
    }

    if (!message.weight.isZero()) {
      writer.uint32(32).uint64(message.weight);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgChangeValidatorWeight {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgChangeValidatorWeight();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.hostZone = reader.string();
          break;

        case 3:
          message.valAddr = reader.string();
          break;

        case 4:
          message.weight = reader.uint64() as Long;
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgChangeValidatorWeight>): MsgChangeValidatorWeight {
    const message = createBaseMsgChangeValidatorWeight();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.valAddr = object.valAddr ?? '';
    message.weight =
      object.weight !== undefined && object.weight !== null ? Long.fromValue(object.weight as Long) : Long.UZERO;
    return message;
  },
};

function createBaseMsgChangeValidatorWeightResponse(): MsgChangeValidatorWeightResponse {
  return {};
}

export const MsgChangeValidatorWeightResponse = {
  encode(_: MsgChangeValidatorWeightResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgChangeValidatorWeightResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgChangeValidatorWeightResponse();

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

  fromPartial(_: DeepPartial<MsgChangeValidatorWeightResponse>): MsgChangeValidatorWeightResponse {
    const message = createBaseMsgChangeValidatorWeightResponse();
    return message;
  },
};

function createBaseMsgDeleteValidator(): MsgDeleteValidator {
  return {
    creator: '',
    hostZone: '',
    valAddr: '',
  };
}

export const MsgDeleteValidator = {
  encode(message: MsgDeleteValidator, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }

    if (message.valAddr !== '') {
      writer.uint32(26).string(message.valAddr);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDeleteValidator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteValidator();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.hostZone = reader.string();
          break;

        case 3:
          message.valAddr = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgDeleteValidator>): MsgDeleteValidator {
    const message = createBaseMsgDeleteValidator();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.valAddr = object.valAddr ?? '';
    return message;
  },
};

function createBaseMsgDeleteValidatorResponse(): MsgDeleteValidatorResponse {
  return {};
}

export const MsgDeleteValidatorResponse = {
  encode(_: MsgDeleteValidatorResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDeleteValidatorResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteValidatorResponse();

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

  fromPartial(_: DeepPartial<MsgDeleteValidatorResponse>): MsgDeleteValidatorResponse {
    const message = createBaseMsgDeleteValidatorResponse();
    return message;
  },
};

function createBaseMsgRestoreInterchainAccount(): MsgRestoreInterchainAccount {
  return {
    creator: '',
    chainId: '',
    accountType: 0,
  };
}

export const MsgRestoreInterchainAccount = {
  encode(message: MsgRestoreInterchainAccount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }

    if (message.accountType !== 0) {
      writer.uint32(24).int32(message.accountType);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRestoreInterchainAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRestoreInterchainAccount();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.chainId = reader.string();
          break;

        case 3:
          message.accountType = reader.int32() as any;
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgRestoreInterchainAccount>): MsgRestoreInterchainAccount {
    const message = createBaseMsgRestoreInterchainAccount();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.accountType = object.accountType ?? 0;
    return message;
  },
};

function createBaseMsgRestoreInterchainAccountResponse(): MsgRestoreInterchainAccountResponse {
  return {};
}

export const MsgRestoreInterchainAccountResponse = {
  encode(_: MsgRestoreInterchainAccountResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRestoreInterchainAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRestoreInterchainAccountResponse();

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

  fromPartial(_: DeepPartial<MsgRestoreInterchainAccountResponse>): MsgRestoreInterchainAccountResponse {
    const message = createBaseMsgRestoreInterchainAccountResponse();
    return message;
  },
};

function createBaseMsgUpdateValidatorSharesExchRate(): MsgUpdateValidatorSharesExchRate {
  return {
    creator: '',
    chainId: '',
    valoper: '',
  };
}

export const MsgUpdateValidatorSharesExchRate = {
  encode(message: MsgUpdateValidatorSharesExchRate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }

    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }

    if (message.valoper !== '') {
      writer.uint32(26).string(message.valoper);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateValidatorSharesExchRate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateValidatorSharesExchRate();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.chainId = reader.string();
          break;

        case 3:
          message.valoper = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgUpdateValidatorSharesExchRate>): MsgUpdateValidatorSharesExchRate {
    const message = createBaseMsgUpdateValidatorSharesExchRate();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.valoper = object.valoper ?? '';
    return message;
  },
};

function createBaseMsgUpdateValidatorSharesExchRateResponse(): MsgUpdateValidatorSharesExchRateResponse {
  return {};
}

export const MsgUpdateValidatorSharesExchRateResponse = {
  encode(_: MsgUpdateValidatorSharesExchRateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateValidatorSharesExchRateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateValidatorSharesExchRateResponse();

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

  fromPartial(_: DeepPartial<MsgUpdateValidatorSharesExchRateResponse>): MsgUpdateValidatorSharesExchRateResponse {
    const message = createBaseMsgUpdateValidatorSharesExchRateResponse();
    return message;
  },
};
