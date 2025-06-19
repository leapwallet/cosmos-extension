// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
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
export const AminoConverter = {
  '/noble.swap.v1.MsgSwap': {
    aminoType: 'swap/Swap',
    toAmino: MsgSwap.toAmino,
    fromAmino: MsgSwap.fromAmino,
  },
  '/noble.swap.v1.MsgWithdrawProtocolFees': {
    aminoType: 'swap/WithdrawProtocolFees',
    toAmino: MsgWithdrawProtocolFees.toAmino,
    fromAmino: MsgWithdrawProtocolFees.fromAmino,
  },
  '/noble.swap.v1.MsgWithdrawRewards': {
    aminoType: 'swap/WithdrawRewards',
    toAmino: MsgWithdrawRewards.toAmino,
    fromAmino: MsgWithdrawRewards.fromAmino,
  },
  '/noble.swap.v1.MsgPauseByAlgorithm': {
    aminoType: 'swap/PauseByAlgorithm',
    toAmino: MsgPauseByAlgorithm.toAmino,
    fromAmino: MsgPauseByAlgorithm.fromAmino,
  },
  '/noble.swap.v1.MsgPauseByPoolIds': {
    aminoType: 'swap/PauseByPoolIds',
    toAmino: MsgPauseByPoolIds.toAmino,
    fromAmino: MsgPauseByPoolIds.fromAmino,
  },
  '/noble.swap.v1.MsgUnpauseByAlgorithm': {
    aminoType: 'swap/UnpauseByAlgorithm',
    toAmino: MsgUnpauseByAlgorithm.toAmino,
    fromAmino: MsgUnpauseByAlgorithm.fromAmino,
  },
  '/noble.swap.v1.MsgUnpauseByPoolIds': {
    aminoType: 'swap/UnpauseByPoolIds',
    toAmino: MsgUnpauseByPoolIds.toAmino,
    fromAmino: MsgUnpauseByPoolIds.fromAmino,
  },
  '/noble.dollar.v1.MsgClaimYield': {
    aminoType: 'dollar/ClaimYield',
    toAmino: MsgClaimYield.toAmino,
    fromAmino: MsgClaimYield.fromAmino,
  },
  '/noble.dollar.v1.MsgSetPausedState': {
    aminoType: 'dollar/SetPausedState',
    toAmino: MsgSetPausedState.toAmino,
    fromAmino: MsgSetPausedState.fromAmino,
  },
};
