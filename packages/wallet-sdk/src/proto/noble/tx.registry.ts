// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { GeneratedType, Registry } from '@cosmjs/proto-signing';

import {
  MsgClaimYield,
  MsgPauseByAlgorithm,
  MsgPauseByPoolIds,
  MsgSetPausedState,
  MsgSwap,
  MsgUnpauseByAlgorithm,
  MsgUnpauseByPoolIds,
  MsgWithdrawProtocolFees,
  MsgWithdrawRewards,
} from './tx';
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ['/noble.swap.v1.MsgSwap', MsgSwap],
  ['/noble.swap.v1.MsgWithdrawProtocolFees', MsgWithdrawProtocolFees],
  ['/noble.swap.v1.MsgWithdrawRewards', MsgWithdrawRewards],
  ['/noble.swap.v1.MsgPauseByAlgorithm', MsgPauseByAlgorithm],
  ['/noble.swap.v1.MsgPauseByPoolIds', MsgPauseByPoolIds],
  ['/noble.swap.v1.MsgUnpauseByAlgorithm', MsgUnpauseByAlgorithm],
  ['/noble.swap.v1.MsgUnpauseByPoolIds', MsgUnpauseByPoolIds],
  ['/noble.dollar.v1.MsgClaimYield', MsgClaimYield],
  ['/noble.dollar.v1.MsgSetPausedState', MsgSetPausedState],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    swap(value: MsgSwap) {
      return {
        typeUrl: '/noble.swap.v1.MsgSwap',
        value: MsgSwap.encode(value).finish(),
      };
    },
    withdrawProtocolFees(value: MsgWithdrawProtocolFees) {
      return {
        typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFees',
        value: MsgWithdrawProtocolFees.encode(value).finish(),
      };
    },
    withdrawRewards(value: MsgWithdrawRewards) {
      return {
        typeUrl: '/noble.swap.v1.MsgWithdrawRewards',
        value: MsgWithdrawRewards.encode(value).finish(),
      };
    },
    pauseByAlgorithm(value: MsgPauseByAlgorithm) {
      return {
        typeUrl: '/noble.swap.v1.MsgPauseByAlgorithm',
        value: MsgPauseByAlgorithm.encode(value).finish(),
      };
    },
    pauseByPoolIds(value: MsgPauseByPoolIds) {
      return {
        typeUrl: '/noble.swap.v1.MsgPauseByPoolIds',
        value: MsgPauseByPoolIds.encode(value).finish(),
      };
    },
    unpauseByAlgorithm(value: MsgUnpauseByAlgorithm) {
      return {
        typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithm',
        value: MsgUnpauseByAlgorithm.encode(value).finish(),
      };
    },
    unpauseByPoolIds(value: MsgUnpauseByPoolIds) {
      return {
        typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIds',
        value: MsgUnpauseByPoolIds.encode(value).finish(),
      };
    },
    claimYield(value: MsgClaimYield) {
      return {
        typeUrl: '/noble.dollar.v1.MsgClaimYield',
        value: MsgClaimYield.encode(value).finish(),
      };
    },
    setPausedState(value: MsgSetPausedState) {
      return {
        typeUrl: '/noble.dollar.v1.MsgSetPausedState',
        value: MsgSetPausedState.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    swap(value: MsgSwap) {
      return {
        typeUrl: '/noble.swap.v1.MsgSwap',
        value,
      };
    },
    withdrawProtocolFees(value: MsgWithdrawProtocolFees) {
      return {
        typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFees',
        value,
      };
    },
    withdrawRewards(value: MsgWithdrawRewards) {
      return {
        typeUrl: '/noble.swap.v1.MsgWithdrawRewards',
        value,
      };
    },
    pauseByAlgorithm(value: MsgPauseByAlgorithm) {
      return {
        typeUrl: '/noble.swap.v1.MsgPauseByAlgorithm',
        value,
      };
    },
    pauseByPoolIds(value: MsgPauseByPoolIds) {
      return {
        typeUrl: '/noble.swap.v1.MsgPauseByPoolIds',
        value,
      };
    },
    unpauseByAlgorithm(value: MsgUnpauseByAlgorithm) {
      return {
        typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithm',
        value,
      };
    },
    unpauseByPoolIds(value: MsgUnpauseByPoolIds) {
      return {
        typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIds',
        value,
      };
    },
    claimYield(value: MsgClaimYield) {
      return {
        typeUrl: '/noble.dollar.v1.MsgClaimYield',
        value,
      };
    },
    setPausedState(value: MsgSetPausedState) {
      return {
        typeUrl: '/noble.dollar.v1.MsgSetPausedState',
        value,
      };
    },
  },
  fromPartial: {
    swap(value: MsgSwap) {
      return {
        typeUrl: '/noble.swap.v1.MsgSwap',
        value: MsgSwap.fromPartial(value),
      };
    },
    withdrawProtocolFees(value: MsgWithdrawProtocolFees) {
      return {
        typeUrl: '/noble.swap.v1.MsgWithdrawProtocolFees',
        value: MsgWithdrawProtocolFees.fromPartial(value),
      };
    },
    withdrawRewards(value: MsgWithdrawRewards) {
      return {
        typeUrl: '/noble.swap.v1.MsgWithdrawRewards',
        value: MsgWithdrawRewards.fromPartial(value),
      };
    },
    pauseByAlgorithm(value: MsgPauseByAlgorithm) {
      return {
        typeUrl: '/noble.swap.v1.MsgPauseByAlgorithm',
        value: MsgPauseByAlgorithm.fromPartial(value),
      };
    },
    pauseByPoolIds(value: MsgPauseByPoolIds) {
      return {
        typeUrl: '/noble.swap.v1.MsgPauseByPoolIds',
        value: MsgPauseByPoolIds.fromPartial(value),
      };
    },
    unpauseByAlgorithm(value: MsgUnpauseByAlgorithm) {
      return {
        typeUrl: '/noble.swap.v1.MsgUnpauseByAlgorithm',
        value: MsgUnpauseByAlgorithm.fromPartial(value),
      };
    },
    unpauseByPoolIds(value: MsgUnpauseByPoolIds) {
      return {
        typeUrl: '/noble.swap.v1.MsgUnpauseByPoolIds',
        value: MsgUnpauseByPoolIds.fromPartial(value),
      };
    },
    claimYield(value: MsgClaimYield) {
      return {
        typeUrl: '/noble.dollar.v1.MsgClaimYield',
        value: MsgClaimYield.fromPartial(value),
      };
    },
    setPausedState(value: MsgSetPausedState) {
      return {
        typeUrl: '/noble.dollar.v1.MsgSetPausedState',
        value: MsgSetPausedState.fromPartial(value),
      };
    },
  },
};
