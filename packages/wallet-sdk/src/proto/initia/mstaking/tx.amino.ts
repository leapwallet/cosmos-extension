// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import {
  MsgBeginRedelegate,
  MsgCancelUnbondingDelegation,
  MsgCreateValidator,
  MsgDelegate,
  MsgEditValidator,
  MsgUndelegate,
  MsgUpdateParams,
} from './tx';
export const AminoConverter = {
  '/initia.mstaking.v1.MsgCreateValidator': {
    aminoType: 'mstaking/MsgCreateValidator',
    toAmino: MsgCreateValidator.toAmino,
    fromAmino: MsgCreateValidator.fromAmino,
  },
  '/initia.mstaking.v1.MsgEditValidator': {
    aminoType: 'mstaking/MsgEditValidator',
    toAmino: MsgEditValidator.toAmino,
    fromAmino: MsgEditValidator.fromAmino,
  },
  '/initia.mstaking.v1.MsgDelegate': {
    aminoType: 'mstaking/MsgDelegate',
    toAmino: MsgDelegate.toAmino,
    fromAmino: MsgDelegate.fromAmino,
  },
  '/initia.mstaking.v1.MsgBeginRedelegate': {
    aminoType: 'mstaking/MsgBeginRedelegate',
    toAmino: MsgBeginRedelegate.toAmino,
    fromAmino: MsgBeginRedelegate.fromAmino,
  },
  '/initia.mstaking.v1.MsgUndelegate': {
    aminoType: 'mstaking/MsgUndelegate',
    toAmino: MsgUndelegate.toAmino,
    fromAmino: MsgUndelegate.fromAmino,
  },
  '/initia.mstaking.v1.MsgCancelUnbondingDelegation': {
    aminoType: 'mstaking/MsgCancelUnbondingDelegation',
    toAmino: MsgCancelUnbondingDelegation.toAmino,
    fromAmino: MsgCancelUnbondingDelegation.fromAmino,
  },
  '/initia.mstaking.v1.MsgUpdateParams': {
    aminoType: 'mstaking/MsgUpdateParams',
    toAmino: MsgUpdateParams.toAmino,
    fromAmino: MsgUpdateParams.fromAmino,
  },
};
