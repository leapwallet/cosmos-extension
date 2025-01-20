import {
  MsgUpdateParams,
  MsgWrappedBeginRedelegate,
  MsgWrappedCancelUnbondingDelegation,
  MsgWrappedDelegate,
  MsgWrappedUndelegate,
} from './tx';
export const AminoConverter = {
  '/babylon.epoching.v1.MsgWrappedDelegate': {
    aminoType: '/babylon.epoching.v1.MsgWrappedDelegate',
    toAmino: MsgWrappedDelegate.toAmino,
    fromAmino: MsgWrappedDelegate.fromAmino,
  },
  '/babylon.epoching.v1.MsgWrappedUndelegate': {
    aminoType: '/babylon.epoching.v1.MsgWrappedUndelegate',
    toAmino: MsgWrappedUndelegate.toAmino,
    fromAmino: MsgWrappedUndelegate.fromAmino,
  },
  '/babylon.epoching.v1.MsgWrappedBeginRedelegate': {
    aminoType: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
    toAmino: MsgWrappedBeginRedelegate.toAmino,
    fromAmino: MsgWrappedBeginRedelegate.fromAmino,
  },
  '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation': {
    aminoType: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation',
    toAmino: MsgWrappedCancelUnbondingDelegation.toAmino,
    fromAmino: MsgWrappedCancelUnbondingDelegation.fromAmino,
  },
  '/babylon.epoching.v1.MsgUpdateParams': {
    aminoType: '/babylon.epoching.v1.MsgUpdateParams',
    toAmino: MsgUpdateParams.toAmino,
    fromAmino: MsgUpdateParams.fromAmino,
  },
};
