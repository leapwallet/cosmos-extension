import { MsgExecuteContract, MsgInstantiateContract, MsgMigrateContract } from '../protobuf/secret/compute/v1beta1/msg';

export * from './compute';
export * from './types';

export type MsgDecoder = {
  decode(input: Uint8Array): any;
};

export const MsgRegistry = new Map<string, MsgDecoder>([
  ['/secret.compute.v1beta1.MsgInstantiateContract', MsgInstantiateContract],
  ['/secret.compute.v1beta1.MsgExecuteContract', MsgExecuteContract],
  ['/secret.compute.v1beta1.MsgMigrateContract', MsgMigrateContract],
]);
