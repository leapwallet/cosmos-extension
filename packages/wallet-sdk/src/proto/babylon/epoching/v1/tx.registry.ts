import { GeneratedType, Registry } from '@cosmjs/proto-signing';

import {
  MsgUpdateParams,
  MsgWrappedBeginRedelegate,
  MsgWrappedCancelUnbondingDelegation,
  MsgWrappedDelegate,
  MsgWrappedUndelegate,
} from './tx';
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.epoching.v1.MsgWrappedDelegate', MsgWrappedDelegate],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.epoching.v1.MsgWrappedUndelegate', MsgWrappedUndelegate],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.epoching.v1.MsgWrappedBeginRedelegate', MsgWrappedBeginRedelegate],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation', MsgWrappedCancelUnbondingDelegation],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.epoching.v1.MsgUpdateParams', MsgUpdateParams],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    wrappedDelegate(value: MsgWrappedDelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedDelegate',
        value: MsgWrappedDelegate.encode(value).finish(),
      };
    },
    wrappedUndelegate(value: MsgWrappedUndelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegate',
        value: MsgWrappedUndelegate.encode(value).finish(),
      };
    },
    wrappedBeginRedelegate(value: MsgWrappedBeginRedelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
        value: MsgWrappedBeginRedelegate.encode(value).finish(),
      };
    },
    wrappedCancelUnbondingDelegation(value: MsgWrappedCancelUnbondingDelegation) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation',
        value: MsgWrappedCancelUnbondingDelegation.encode(value).finish(),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgUpdateParams',
        value: MsgUpdateParams.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    wrappedDelegate(value: MsgWrappedDelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedDelegate',
        value,
      };
    },
    wrappedUndelegate(value: MsgWrappedUndelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegate',
        value,
      };
    },
    wrappedBeginRedelegate(value: MsgWrappedBeginRedelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
        value,
      };
    },
    wrappedCancelUnbondingDelegation(value: MsgWrappedCancelUnbondingDelegation) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation',
        value,
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgUpdateParams',
        value,
      };
    },
  },
  fromPartial: {
    wrappedDelegate(value: MsgWrappedDelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedDelegate',
        value: MsgWrappedDelegate.fromPartial(value),
      };
    },
    wrappedUndelegate(value: MsgWrappedUndelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegate',
        value: MsgWrappedUndelegate.fromPartial(value),
      };
    },
    wrappedBeginRedelegate(value: MsgWrappedBeginRedelegate) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
        value: MsgWrappedBeginRedelegate.fromPartial(value),
      };
    },
    wrappedCancelUnbondingDelegation(value: MsgWrappedCancelUnbondingDelegation) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation',
        value: MsgWrappedCancelUnbondingDelegation.fromPartial(value),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.epoching.v1.MsgUpdateParams',
        value: MsgUpdateParams.fromPartial(value),
      };
    },
  },
};
