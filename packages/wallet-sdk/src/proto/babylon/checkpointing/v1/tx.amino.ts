import { MsgWrappedCreateValidator } from './tx';
export const AminoConverter = {
  '/babylon.checkpointing.v1.MsgWrappedCreateValidator': {
    aminoType: '/babylon.checkpointing.v1.MsgWrappedCreateValidator',
    toAmino: MsgWrappedCreateValidator.toAmino,
    fromAmino: MsgWrappedCreateValidator.fromAmino,
  },
};
