import { GeneratedType, Registry } from '@cosmjs/proto-signing';

import { MsgInsertHeaders, MsgUpdateParams } from './tx';
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btclightclient.v1.MsgInsertHeaders', MsgInsertHeaders],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btclightclient.v1.MsgUpdateParams', MsgUpdateParams],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    insertHeaders(value: MsgInsertHeaders) {
      return {
        typeUrl: '/babylon.btclightclient.v1.MsgInsertHeaders',
        value: MsgInsertHeaders.encode(value).finish(),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btclightclient.v1.MsgUpdateParams',
        value: MsgUpdateParams.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    insertHeaders(value: MsgInsertHeaders) {
      return {
        typeUrl: '/babylon.btclightclient.v1.MsgInsertHeaders',
        value,
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btclightclient.v1.MsgUpdateParams',
        value,
      };
    },
  },
  fromPartial: {
    insertHeaders(value: MsgInsertHeaders) {
      return {
        typeUrl: '/babylon.btclightclient.v1.MsgInsertHeaders',
        value: MsgInsertHeaders.fromPartial(value),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btclightclient.v1.MsgUpdateParams',
        value: MsgUpdateParams.fromPartial(value),
      };
    },
  },
};
