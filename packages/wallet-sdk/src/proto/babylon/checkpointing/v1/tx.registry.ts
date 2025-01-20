import { GeneratedType, Registry } from '@cosmjs/proto-signing';

import { MsgWrappedCreateValidator } from './tx';
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.checkpointing.v1.MsgWrappedCreateValidator', MsgWrappedCreateValidator],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    wrappedCreateValidator(value: MsgWrappedCreateValidator) {
      return {
        typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidator',
        value: MsgWrappedCreateValidator.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    wrappedCreateValidator(value: MsgWrappedCreateValidator) {
      return {
        typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidator',
        value,
      };
    },
  },
  fromPartial: {
    wrappedCreateValidator(value: MsgWrappedCreateValidator) {
      return {
        typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidator',
        value: MsgWrappedCreateValidator.fromPartial(value),
      };
    },
  },
};
