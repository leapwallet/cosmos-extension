export enum WALLETTYPE {
  SEED_PHRASE,
  PRIVATE_KEY,
  SEED_PHRASE_IMPORTED,
  LEDGER,
  KEYSTONE,
  WATCH_WALLET,
}

export type CompassSeiEvmConfig = {
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
