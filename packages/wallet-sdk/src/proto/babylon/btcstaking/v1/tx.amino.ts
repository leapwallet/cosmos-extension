import {
  MsgAddCovenantSigs,
  MsgBTCUndelegate,
  MsgCreateBTCDelegation,
  MsgCreateFinalityProvider,
  MsgEditFinalityProvider,
  MsgSelectiveSlashingEvidence,
  MsgUpdateParams,
} from './tx';
export const AminoConverter = {
  '/babylon.btcstaking.v1.MsgCreateFinalityProvider': {
    aminoType: '/babylon.btcstaking.v1.MsgCreateFinalityProvider',
    toAmino: MsgCreateFinalityProvider.toAmino,
    fromAmino: MsgCreateFinalityProvider.fromAmino,
  },
  '/babylon.btcstaking.v1.MsgEditFinalityProvider': {
    aminoType: '/babylon.btcstaking.v1.MsgEditFinalityProvider',
    toAmino: MsgEditFinalityProvider.toAmino,
    fromAmino: MsgEditFinalityProvider.fromAmino,
  },
  '/babylon.btcstaking.v1.MsgCreateBTCDelegation': {
    aminoType: '/babylon.btcstaking.v1.MsgCreateBTCDelegation',
    toAmino: MsgCreateBTCDelegation.toAmino,
    fromAmino: MsgCreateBTCDelegation.fromAmino,
  },
  '/babylon.btcstaking.v1.MsgAddCovenantSigs': {
    aminoType: '/babylon.btcstaking.v1.MsgAddCovenantSigs',
    toAmino: MsgAddCovenantSigs.toAmino,
    fromAmino: MsgAddCovenantSigs.fromAmino,
  },
  '/babylon.btcstaking.v1.MsgBTCUndelegate': {
    aminoType: '/babylon.btcstaking.v1.MsgBTCUndelegate',
    toAmino: MsgBTCUndelegate.toAmino,
    fromAmino: MsgBTCUndelegate.fromAmino,
  },
  '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence': {
    aminoType: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence',
    toAmino: MsgSelectiveSlashingEvidence.toAmino,
    fromAmino: MsgSelectiveSlashingEvidence.fromAmino,
  },
  '/babylon.btcstaking.v1.MsgUpdateParams': {
    aminoType: '/babylon.btcstaking.v1.MsgUpdateParams',
    toAmino: MsgUpdateParams.toAmino,
    fromAmino: MsgUpdateParams.fromAmino,
  },
};
