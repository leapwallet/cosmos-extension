import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export type ChainInfoFromS3 = {
  [chainId: string]: {
    cosmosSDK: string;
    dynamic_fee_market: boolean;
  };
};

// --------------- chain-infos-config-store ------------------

export type ChainInfosConfigPossibleFeatureType = 'stake' | 'governance' | 'activity' | 'cosmosConsensusUpdate';

export type ChainInfosConfigPossibleFeatureValueType = {
  platforms: string[];
  chains: {
    [key: string]: boolean;
  };
};

export type ChainInfosConfigType = {
  coming_soon_features: Record<ChainInfosConfigPossibleFeatureType, ChainInfosConfigPossibleFeatureValueType>;
  not_supported_features: Record<'stake' | 'governance', ChainInfosConfigPossibleFeatureValueType>;
};

// --------------- nft-chains-store ------------------

export type NftChain = {
  forceChain: SupportedChain;
  forceContractsListChain: SupportedChain;
  forceNetwork: 'testnet' | 'mainnet';
};

// --------------- beta-nfts-collections-store ------------------

export type StoredBetaNftCollection = {
  name: string;
  address: string;
  image: string;
};

export type BetaNftsCollectionsType = {
  [chain: string]: {
    [network: string]: StoredBetaNftCollection[];
  };
};

// --------------- beta-evm-nft-token-ids-store ------------------

export type BetaEvmNftTokenIds = {
  [contractAddress: string]: {
    [walletAddress: string]: string[];
  };
};

// --------------- compass-sei-evm-config-store ------------------

export type CompassSeiEvmConfigType = {
  ARCTIC_COSMOS_CHAIN_ID: string;
  ARCTIC_ETH_CHAIN_ID: number;
  ARCTIC_CHAIN_KEY: string;
  ARCTIC_EVM_RPC_URL: string;
  ARCTIC_NO_FUNDS_DAPP_LINK: string;

  ARCTIC_EVM_GAS_LIMIT: number;
  ARCTIC_EVM_GAS_PRICE_STEPS: {
    low: number;
    medium: number;
    high: number;
  };

  ATLANTIC_EVM_RPC_URL: string;
  ATLANTIC_ETH_CHAIN_ID: number;
  ATLANTIC_COSMOS_CHAIN_ID: string;
  ATLANTIC_CHAIN_KEY: string;
  ATLANTIC_NO_FUNDS_DAPP_LINK: string;

  PACIFIC_EVM_RPC_URL: string;
  PACIFIC_ETH_CHAIN_ID: number;
  PACIFIC_COSMOS_CHAIN_ID: string;
  PACIFIC_NO_FUNDS_DAPP_LINK: string;

  COMPASS_EVM_CHAIN_IDS: number[];
};

export type BalanceErrorStatus = 'no-error' | 'partial-failure' | 'complete-failure';
