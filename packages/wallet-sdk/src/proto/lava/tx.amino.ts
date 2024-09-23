import { MsgClaimRewards, MsgDelegate, MsgRedelegate, MsgUnbond } from './tx';
export const AminoConverter = {
  '/lavanet.lava.dualstaking.MsgDelegate': {
    aminoType: 'dualstaking/Delegate',
    toAmino: MsgDelegate.toAmino,
    fromAmino: MsgDelegate.fromAmino,
  },
  '/lavanet.lava.dualstaking.MsgRedelegate': {
    aminoType: 'dualstaking/Redelegate',
    toAmino: MsgRedelegate.toAmino,
    fromAmino: MsgRedelegate.fromAmino,
  },
  '/lavanet.lava.dualstaking.MsgUnbond': {
    aminoType: 'dualstaking/Unbond',
    toAmino: MsgUnbond.toAmino,
    fromAmino: MsgUnbond.fromAmino,
  },
  '/lavanet.lava.dualstaking.MsgClaimRewards': {
    aminoType: 'dualstaking/MsgClaimRewards',
    toAmino: MsgClaimRewards.toAmino,
    fromAmino: MsgClaimRewards.fromAmino,
  },
};
