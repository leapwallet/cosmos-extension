import { MsgInsertBTCSpvProof, MsgUpdateParams } from './tx';
export const AminoConverter = {
  '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof': {
    aminoType: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof',
    toAmino: MsgInsertBTCSpvProof.toAmino,
    fromAmino: MsgInsertBTCSpvProof.fromAmino,
  },
  '/babylon.btccheckpoint.v1.MsgUpdateParams': {
    aminoType: '/babylon.btccheckpoint.v1.MsgUpdateParams',
    toAmino: MsgUpdateParams.toAmino,
    fromAmino: MsgUpdateParams.fromAmino,
  },
};
