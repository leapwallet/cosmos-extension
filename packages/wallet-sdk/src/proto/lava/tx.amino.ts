import { MsgClaimRewards, MsgDelegate, MsgRedelegate, MsgUnbond } from './tx';

export declare const AminoConverter: {
  '/lavanet.lava.dualstaking.MsgDelegate': {
    aminoType: string;
    toAmino: (message: MsgDelegate) => import('./tx').MsgDelegateAmino;
    fromAmino: (object: import('./tx').MsgDelegateAmino) => MsgDelegate;
  };
  '/lavanet.lava.dualstaking.MsgRedelegate': {
    aminoType: string;
    toAmino: (message: MsgRedelegate) => import('./tx').MsgRedelegateAmino;
    fromAmino: (object: import('./tx').MsgRedelegateAmino) => MsgRedelegate;
  };
  '/lavanet.lava.dualstaking.MsgUnbond': {
    aminoType: string;
    toAmino: (message: MsgUnbond) => import('./tx').MsgUnbondAmino;
    fromAmino: (object: import('./tx').MsgUnbondAmino) => MsgUnbond;
  };
  '/lavanet.lava.dualstaking.MsgClaimRewards': {
    aminoType: string;
    toAmino: (message: MsgClaimRewards) => import('./tx').MsgClaimRewardsAmino;
    fromAmino: (object: import('./tx').MsgClaimRewardsAmino) => MsgClaimRewards;
  };
};
