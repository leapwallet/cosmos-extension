import { GeneratedType, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import { AminoTypes, defaultRegistryTypes, SigningStargateClient } from '@cosmjs/stargate';
import { HttpEndpoint } from '@cosmjs/tendermint-rpc';

import * as babylonBtccheckpointV1TxAmino from './btccheckpoint/v1/tx.amino';
import * as babylonBtccheckpointV1TxRegistry from './btccheckpoint/v1/tx.registry';
import * as babylonBtclightclientV1TxAmino from './btclightclient/v1/tx.amino';
import * as babylonBtclightclientV1TxRegistry from './btclightclient/v1/tx.registry';
import * as babylonBtcstakingV1TxAmino from './btcstaking/v1/tx.amino';
import * as babylonBtcstakingV1TxRegistry from './btcstaking/v1/tx.registry';
import * as babylonCheckpointingV1TxAmino from './checkpointing/v1/tx.amino';
import * as babylonCheckpointingV1TxRegistry from './checkpointing/v1/tx.registry';
import * as babylonEpochingV1TxAmino from './epoching/v1/tx.amino';
import * as babylonEpochingV1TxRegistry from './epoching/v1/tx.registry';
export const babylonAminoConverters = {
  ...babylonBtccheckpointV1TxAmino.AminoConverter,
  ...babylonBtclightclientV1TxAmino.AminoConverter,
  ...babylonBtcstakingV1TxAmino.AminoConverter,
  ...babylonCheckpointingV1TxAmino.AminoConverter,
  ...babylonEpochingV1TxAmino.AminoConverter,
};
export const babylonProtoRegistry: ReadonlyArray<[string, GeneratedType]> = [
  ...babylonBtccheckpointV1TxRegistry.registry,
  ...babylonBtclightclientV1TxRegistry.registry,
  ...babylonBtcstakingV1TxRegistry.registry,
  ...babylonCheckpointingV1TxRegistry.registry,
  ...babylonEpochingV1TxRegistry.registry,
];
export const getSigningBabylonClientOptions = ({
  defaultTypes = defaultRegistryTypes,
}: {
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
} = {}): {
  registry: Registry;
  aminoTypes: AminoTypes;
} => {
  const registry = new Registry([...defaultTypes, ...babylonProtoRegistry]);
  const aminoTypes = new AminoTypes({
    ...babylonAminoConverters,
  });
  return {
    registry,
    aminoTypes,
  };
};
export const getSigningBabylonClient = async ({
  rpcEndpoint,
  signer,
  defaultTypes = defaultRegistryTypes,
}: {
  rpcEndpoint: string | HttpEndpoint;
  signer: OfflineSigner;
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
}) => {
  const { registry, aminoTypes } = getSigningBabylonClientOptions({
    defaultTypes,
  });
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, signer, {
    registry: registry as any,
    aminoTypes,
  });
  return client;
};
