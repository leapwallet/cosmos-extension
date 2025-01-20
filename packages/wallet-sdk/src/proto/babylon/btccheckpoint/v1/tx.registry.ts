import { GeneratedType, Registry } from '@cosmjs/proto-signing';

import { MsgInsertBTCSpvProof, MsgUpdateParams } from './tx';
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof', MsgInsertBTCSpvProof],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btccheckpoint.v1.MsgUpdateParams', MsgUpdateParams],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    insertBTCSpvProof(value: MsgInsertBTCSpvProof) {
      return {
        typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof',
        value: MsgInsertBTCSpvProof.encode(value).finish(),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParams',
        value: MsgUpdateParams.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    insertBTCSpvProof(value: MsgInsertBTCSpvProof) {
      return {
        typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof',
        value,
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParams',
        value,
      };
    },
  },
  fromPartial: {
    insertBTCSpvProof(value: MsgInsertBTCSpvProof) {
      return {
        typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof',
        value: MsgInsertBTCSpvProof.fromPartial(value),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParams',
        value: MsgUpdateParams.fromPartial(value),
      };
    },
  },
};
