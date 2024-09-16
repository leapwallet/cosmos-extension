// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { GeneratedType, Registry } from '@cosmjs/proto-signing';

import {
  MsgBeginRedelegate,
  MsgCancelUnbondingDelegation,
  MsgCreateValidator,
  MsgDelegate,
  MsgEditValidator,
  MsgUndelegate,
  MsgUpdateParams,
} from './tx';
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ['/initia.mstaking.v1.MsgCreateValidator', MsgCreateValidator],
  ['/initia.mstaking.v1.MsgEditValidator', MsgEditValidator],
  ['/initia.mstaking.v1.MsgDelegate', MsgDelegate],
  ['/initia.mstaking.v1.MsgBeginRedelegate', MsgBeginRedelegate],
  ['/initia.mstaking.v1.MsgUndelegate', MsgUndelegate],
  ['/initia.mstaking.v1.MsgCancelUnbondingDelegation', MsgCancelUnbondingDelegation],
  ['/initia.mstaking.v1.MsgUpdateParams', MsgUpdateParams],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    createValidator(value: MsgCreateValidator) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgCreateValidator',
        value: MsgCreateValidator.encode(value).finish(),
      };
    },
    editValidator(value: MsgEditValidator) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgEditValidator',
        value: MsgEditValidator.encode(value).finish(),
      };
    },
    delegate(value: MsgDelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgDelegate',
        value: MsgDelegate.encode(value).finish(),
      };
    },
    beginRedelegate(value: MsgBeginRedelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgBeginRedelegate',
        value: MsgBeginRedelegate.encode(value).finish(),
      };
    },
    undelegate(value: MsgUndelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgUndelegate',
        value: MsgUndelegate.encode(value).finish(),
      };
    },
    cancelUnbondingDelegation(value: MsgCancelUnbondingDelegation) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgCancelUnbondingDelegation',
        value: MsgCancelUnbondingDelegation.encode(value).finish(),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgUpdateParams',
        value: MsgUpdateParams.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    createValidator(value: MsgCreateValidator) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgCreateValidator',
        value,
      };
    },
    editValidator(value: MsgEditValidator) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgEditValidator',
        value,
      };
    },
    delegate(value: MsgDelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgDelegate',
        value,
      };
    },
    beginRedelegate(value: MsgBeginRedelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgBeginRedelegate',
        value,
      };
    },
    undelegate(value: MsgUndelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgUndelegate',
        value,
      };
    },
    cancelUnbondingDelegation(value: MsgCancelUnbondingDelegation) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgCancelUnbondingDelegation',
        value,
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgUpdateParams',
        value,
      };
    },
  },
  fromPartial: {
    createValidator(value: MsgCreateValidator) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgCreateValidator',
        value: MsgCreateValidator.fromPartial(value),
      };
    },
    editValidator(value: MsgEditValidator) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgEditValidator',
        value: MsgEditValidator.fromPartial(value),
      };
    },
    delegate(value: MsgDelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgDelegate',
        value: MsgDelegate.fromPartial(value),
      };
    },
    beginRedelegate(value: MsgBeginRedelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgBeginRedelegate',
        value: MsgBeginRedelegate.fromPartial(value),
      };
    },
    undelegate(value: MsgUndelegate) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgUndelegate',
        value: MsgUndelegate.fromPartial(value),
      };
    },
    cancelUnbondingDelegation(value: MsgCancelUnbondingDelegation) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgCancelUnbondingDelegation',
        value: MsgCancelUnbondingDelegation.fromPartial(value),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/initia.mstaking.v1.MsgUpdateParams',
        value: MsgUpdateParams.fromPartial(value),
      };
    },
  },
};
