export type ChainInfosConfigPossibleFeatureType = 'stake' | 'governance' | 'activity' | 'cosmosConsensusUpdate';
export type ChainInfosConfigPossibleFeatureValueType = {
  platforms: string[];
  chains: { [key: string]: boolean };
};

export type ChainInfosConfigType = {
  coming_soon_features: Record<ChainInfosConfigPossibleFeatureType, ChainInfosConfigPossibleFeatureValueType>;
  not_supported_features: Record<'stake' | 'governance', ChainInfosConfigPossibleFeatureValueType>;
};

export const CHAIN_INFOS_CONFIG: ChainInfosConfigType = {
  coming_soon_features: {
    stake: {
      platforms: ['All', 'Extension'],
      chains: {
        'nomic-stakenet-3': true,
        'nomic-testnet-4d': true,
      },
    },
    governance: {
      platforms: ['All', 'Extension'],
      chains: {
        'nomic-stakenet-3': true,
        'nomic-testnet-4d': true,
      },
    },
    activity: {
      platforms: ['All', 'Extension'],
      chains: {
        'nomic-stakenet-3': true,
        'nomic-testnet-4d': true,
      },
    },
    cosmosConsensusUpdate: {
      platforms: ['All', 'Extension'],
      chains: {
        'theta-testnet-001': true,
      },
    },
  },
  not_supported_features: {
    stake: {
      platforms: ['All', 'Extension'],
      chains: {
        'mayachain-mainnet-v1': true,
        'neutron-1': true,
        'pion-1': true,
        'noble-1': true,
        'grand-1': true,
        'thorchain-1': true,
      },
    },
    governance: {
      platforms: ['All', 'Extension'],
      chains: {
        'mayachain-mainnet-v1': true,
        'thorchain-1': true,
      },
    },
  },
};
