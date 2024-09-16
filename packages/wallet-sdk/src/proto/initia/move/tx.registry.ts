// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { GeneratedType, Registry } from '@cosmjs/proto-signing';

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
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ['/initia.move.v1.MsgPublish', MsgPublish],
  ['/initia.move.v1.MsgExecute', MsgExecute],
  ['/initia.move.v1.MsgExecuteJSON', MsgExecuteJSON],
  ['/initia.move.v1.MsgScript', MsgScript],
  ['/initia.move.v1.MsgScriptJSON', MsgScriptJSON],
  ['/initia.move.v1.MsgGovPublish', MsgGovPublish],
  ['/initia.move.v1.MsgGovExecute', MsgGovExecute],
  ['/initia.move.v1.MsgGovExecuteJSON', MsgGovExecuteJSON],
  ['/initia.move.v1.MsgGovScript', MsgGovScript],
  ['/initia.move.v1.MsgGovScriptJSON', MsgGovScriptJSON],
  ['/initia.move.v1.MsgWhitelist', MsgWhitelist],
  ['/initia.move.v1.MsgDelist', MsgDelist],
  ['/initia.move.v1.MsgUpdateParams', MsgUpdateParams],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    publish(value: MsgPublish) {
      return {
        typeUrl: '/initia.move.v1.MsgPublish',
        value: MsgPublish.encode(value).finish(),
      };
    },
    execute(value: MsgExecute) {
      return {
        typeUrl: '/initia.move.v1.MsgExecute',
        value: MsgExecute.encode(value).finish(),
      };
    },
    executeJSON(value: MsgExecuteJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgExecuteJSON',
        value: MsgExecuteJSON.encode(value).finish(),
      };
    },
    script(value: MsgScript) {
      return {
        typeUrl: '/initia.move.v1.MsgScript',
        value: MsgScript.encode(value).finish(),
      };
    },
    scriptJSON(value: MsgScriptJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgScriptJSON',
        value: MsgScriptJSON.encode(value).finish(),
      };
    },
    govPublish(value: MsgGovPublish) {
      return {
        typeUrl: '/initia.move.v1.MsgGovPublish',
        value: MsgGovPublish.encode(value).finish(),
      };
    },
    govExecute(value: MsgGovExecute) {
      return {
        typeUrl: '/initia.move.v1.MsgGovExecute',
        value: MsgGovExecute.encode(value).finish(),
      };
    },
    govExecuteJSON(value: MsgGovExecuteJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgGovExecuteJSON',
        value: MsgGovExecuteJSON.encode(value).finish(),
      };
    },
    govScript(value: MsgGovScript) {
      return {
        typeUrl: '/initia.move.v1.MsgGovScript',
        value: MsgGovScript.encode(value).finish(),
      };
    },
    govScriptJSON(value: MsgGovScriptJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgGovScriptJSON',
        value: MsgGovScriptJSON.encode(value).finish(),
      };
    },
    whitelist(value: MsgWhitelist) {
      return {
        typeUrl: '/initia.move.v1.MsgWhitelist',
        value: MsgWhitelist.encode(value).finish(),
      };
    },
    delist(value: MsgDelist) {
      return {
        typeUrl: '/initia.move.v1.MsgDelist',
        value: MsgDelist.encode(value).finish(),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/initia.move.v1.MsgUpdateParams',
        value: MsgUpdateParams.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    publish(value: MsgPublish) {
      return {
        typeUrl: '/initia.move.v1.MsgPublish',
        value,
      };
    },
    execute(value: MsgExecute) {
      return {
        typeUrl: '/initia.move.v1.MsgExecute',
        value,
      };
    },
    executeJSON(value: MsgExecuteJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgExecuteJSON',
        value,
      };
    },
    script(value: MsgScript) {
      return {
        typeUrl: '/initia.move.v1.MsgScript',
        value,
      };
    },
    scriptJSON(value: MsgScriptJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgScriptJSON',
        value,
      };
    },
    govPublish(value: MsgGovPublish) {
      return {
        typeUrl: '/initia.move.v1.MsgGovPublish',
        value,
      };
    },
    govExecute(value: MsgGovExecute) {
      return {
        typeUrl: '/initia.move.v1.MsgGovExecute',
        value,
      };
    },
    govExecuteJSON(value: MsgGovExecuteJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgGovExecuteJSON',
        value,
      };
    },
    govScript(value: MsgGovScript) {
      return {
        typeUrl: '/initia.move.v1.MsgGovScript',
        value,
      };
    },
    govScriptJSON(value: MsgGovScriptJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgGovScriptJSON',
        value,
      };
    },
    whitelist(value: MsgWhitelist) {
      return {
        typeUrl: '/initia.move.v1.MsgWhitelist',
        value,
      };
    },
    delist(value: MsgDelist) {
      return {
        typeUrl: '/initia.move.v1.MsgDelist',
        value,
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/initia.move.v1.MsgUpdateParams',
        value,
      };
    },
  },
  fromPartial: {
    publish(value: MsgPublish) {
      return {
        typeUrl: '/initia.move.v1.MsgPublish',
        value: MsgPublish.fromPartial(value),
      };
    },
    execute(value: MsgExecute) {
      return {
        typeUrl: '/initia.move.v1.MsgExecute',
        value: MsgExecute.fromPartial(value),
      };
    },
    executeJSON(value: MsgExecuteJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgExecuteJSON',
        value: MsgExecuteJSON.fromPartial(value),
      };
    },
    script(value: MsgScript) {
      return {
        typeUrl: '/initia.move.v1.MsgScript',
        value: MsgScript.fromPartial(value),
      };
    },
    scriptJSON(value: MsgScriptJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgScriptJSON',
        value: MsgScriptJSON.fromPartial(value),
      };
    },
    govPublish(value: MsgGovPublish) {
      return {
        typeUrl: '/initia.move.v1.MsgGovPublish',
        value: MsgGovPublish.fromPartial(value),
      };
    },
    govExecute(value: MsgGovExecute) {
      return {
        typeUrl: '/initia.move.v1.MsgGovExecute',
        value: MsgGovExecute.fromPartial(value),
      };
    },
    govExecuteJSON(value: MsgGovExecuteJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgGovExecuteJSON',
        value: MsgGovExecuteJSON.fromPartial(value),
      };
    },
    govScript(value: MsgGovScript) {
      return {
        typeUrl: '/initia.move.v1.MsgGovScript',
        value: MsgGovScript.fromPartial(value),
      };
    },
    govScriptJSON(value: MsgGovScriptJSON) {
      return {
        typeUrl: '/initia.move.v1.MsgGovScriptJSON',
        value: MsgGovScriptJSON.fromPartial(value),
      };
    },
    whitelist(value: MsgWhitelist) {
      return {
        typeUrl: '/initia.move.v1.MsgWhitelist',
        value: MsgWhitelist.fromPartial(value),
      };
    },
    delist(value: MsgDelist) {
      return {
        typeUrl: '/initia.move.v1.MsgDelist',
        value: MsgDelist.fromPartial(value),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/initia.move.v1.MsgUpdateParams',
        value: MsgUpdateParams.fromPartial(value),
      };
    },
  },
};
