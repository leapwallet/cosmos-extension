import { MsgInsertHeaders, MsgUpdateParams } from './tx';
export const AminoConverter = {
  '/babylon.btclightclient.v1.MsgInsertHeaders': {
    aminoType: '/babylon.btclightclient.v1.MsgInsertHeaders',
    toAmino: MsgInsertHeaders.toAmino,
    fromAmino: MsgInsertHeaders.fromAmino,
  },
  '/babylon.btclightclient.v1.MsgUpdateParams': {
    aminoType: '/babylon.btclightclient.v1.MsgUpdateParams',
    toAmino: MsgUpdateParams.toAmino,
    fromAmino: MsgUpdateParams.fromAmino,
  },
};
