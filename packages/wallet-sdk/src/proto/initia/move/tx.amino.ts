// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import {
  MsgDelist,
  MsgExecute,
  MsgExecuteJSON,
  MsgGovExecute,
  MsgGovExecuteJSON,
  MsgGovPublish,
  MsgGovScript,
  MsgGovScriptJSON,
  MsgPublish,
  MsgScript,
  MsgScriptJSON,
  MsgUpdateParams,
  MsgWhitelist,
} from './tx';
export const AminoConverter = {
  '/initia.move.v1.MsgPublish': {
    aminoType: 'move/MsgPublish',
    toAmino: MsgPublish.toAmino,
    fromAmino: MsgPublish.fromAmino,
  },
  '/initia.move.v1.MsgExecute': {
    aminoType: 'move/MsgExecute',
    toAmino: MsgExecute.toAmino,
    fromAmino: MsgExecute.fromAmino,
  },
  '/initia.move.v1.MsgExecuteJSON': {
    aminoType: 'move/MsgExecuteJSON',
    toAmino: MsgExecuteJSON.toAmino,
    fromAmino: MsgExecuteJSON.fromAmino,
  },
  '/initia.move.v1.MsgScript': {
    aminoType: 'move/MsgScript',
    toAmino: MsgScript.toAmino,
    fromAmino: MsgScript.fromAmino,
  },
  '/initia.move.v1.MsgScriptJSON': {
    aminoType: 'move/MsgScriptJSON',
    toAmino: MsgScriptJSON.toAmino,
    fromAmino: MsgScriptJSON.fromAmino,
  },
  '/initia.move.v1.MsgGovPublish': {
    aminoType: 'move/MsgGovPublish',
    toAmino: MsgGovPublish.toAmino,
    fromAmino: MsgGovPublish.fromAmino,
  },
  '/initia.move.v1.MsgGovExecute': {
    aminoType: 'move/MsgGovExecute',
    toAmino: MsgGovExecute.toAmino,
    fromAmino: MsgGovExecute.fromAmino,
  },
  '/initia.move.v1.MsgGovExecuteJSON': {
    aminoType: 'move/MsgGovExecuteJSON',
    toAmino: MsgGovExecuteJSON.toAmino,
    fromAmino: MsgGovExecuteJSON.fromAmino,
  },
  '/initia.move.v1.MsgGovScript': {
    aminoType: 'move/MsgGovScript',
    toAmino: MsgGovScript.toAmino,
    fromAmino: MsgGovScript.fromAmino,
  },
  '/initia.move.v1.MsgGovScriptJSON': {
    aminoType: 'move/MsgGovScriptJSON',
    toAmino: MsgGovScriptJSON.toAmino,
    fromAmino: MsgGovScriptJSON.fromAmino,
  },
  '/initia.move.v1.MsgWhitelist': {
    aminoType: 'move/MsgWhitelist',
    toAmino: MsgWhitelist.toAmino,
    fromAmino: MsgWhitelist.fromAmino,
  },
  '/initia.move.v1.MsgDelist': {
    aminoType: 'move/MsgWhitelist',
    toAmino: MsgDelist.toAmino,
    fromAmino: MsgDelist.fromAmino,
  },
  '/initia.move.v1.MsgUpdateParams': {
    aminoType: 'move/MsgUpdateParams',
    toAmino: MsgUpdateParams.toAmino,
    fromAmino: MsgUpdateParams.fromAmino,
  },
};
