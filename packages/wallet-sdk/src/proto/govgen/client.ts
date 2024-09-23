/* eslint-disable */
import { GeneratedType, Registry, OfflineSigner } from '@cosmjs/proto-signing';
import { defaultRegistryTypes, AminoTypes, SigningStargateClient } from '@cosmjs/stargate';
import { HttpEndpoint } from '@cosmjs/tendermint-rpc';
import * as govgenGovV1beta1TxRegistry from './gov/v1beta1/tx.registry';
import * as govgenGovV1beta1TxAmino from './gov/v1beta1/tx.amino';
export const govgenAminoConverters = {
  ...govgenGovV1beta1TxAmino.AminoConverter,
};
export const govgenProtoRegistry: ReadonlyArray<[string, GeneratedType]> = [...govgenGovV1beta1TxRegistry.registry];
export const getSigningGovgenClientOptions = ({
  defaultTypes = defaultRegistryTypes,
}: {
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
} = {}): {
  registry: Registry;
  aminoTypes: AminoTypes;
} => {
  const registry = new Registry([...defaultTypes, ...govgenProtoRegistry]);
  const aminoTypes = new AminoTypes({
    ...govgenAminoConverters,
  });
  return {
    registry,
    aminoTypes,
  };
};
export const getSigningGovgenClient = async ({
  rpcEndpoint,
  signer,
  defaultTypes = defaultRegistryTypes,
}: {
  rpcEndpoint: string | HttpEndpoint;
  signer: OfflineSigner;
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
}) => {
  const { registry, aminoTypes } = getSigningGovgenClientOptions({
    defaultTypes,
  });
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, signer, {
    registry: registry as any,
    aminoTypes,
  });
  return client;
};
