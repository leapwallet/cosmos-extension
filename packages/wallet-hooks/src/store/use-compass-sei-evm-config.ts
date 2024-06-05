import create from 'zustand';

type CompassSeiEvmConfig = {
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

type CompassSeiEvmConfigStore = {
  compassSeiEvmConfig: CompassSeiEvmConfig;
  setCompassSeiEvmConfig: (compassSeiEvmConfig: CompassSeiEvmConfig) => void;
};

export const getCompassSeiEvmConfigStoreSnapshot = (): Promise<CompassSeiEvmConfig> => {
  const currentState = useCompassSeiEvmConfigStore.getState().compassSeiEvmConfig;

  if (currentState === null) {
    return new Promise((resolve) => {
      const unsubscribe = useCompassSeiEvmConfigStore.subscribe((state) => {
        if (state.compassSeiEvmConfig !== null) {
          unsubscribe();
          resolve(state.compassSeiEvmConfig);
        }
      });
    });
  }

  return Promise.resolve(currentState);
};

export const useCompassSeiEvmConfigStore = create<CompassSeiEvmConfigStore>((set) => ({
  compassSeiEvmConfig: {
    ARCTIC_COSMOS_CHAIN_ID: 'arctic-1',
    ARCTIC_ETH_CHAIN_ID: 713715,
    ARCTIC_CHAIN_KEY: 'seiDevnet',
    ARCTIC_EVM_RPC_URL: 'https://evm-rpc-arctic-1.sei-apis.com',
    ARCTIC_NO_FUNDS_DAPP_LINK: 'https://arctic-1.app.sei.io/',

    ARCTIC_EVM_GAS_LIMIT: 21_000,
    ARCTIC_EVM_GAS_PRICE_STEPS: {
      low: 0.000000001,
      medium: 0.0000000012,
      high: 0.0000000015,
    },

    ATLANTIC_EVM_RPC_URL: 'https://evm-rpc-testnet.sei-apis.com',
    ATLANTIC_ETH_CHAIN_ID: 1328,
    ATLANTIC_COSMOS_CHAIN_ID: 'atlantic-2',
    ATLANTIC_CHAIN_KEY: 'seiTestnet2',
    ATLANTIC_NO_FUNDS_DAPP_LINK: 'https://atlantic-2.app.sei.io/',

    PACIFIC_EVM_RPC_URL: 'https://evm-rpc.sei-apis.com',
    PACIFIC_ETH_CHAIN_ID: 1329,
    PACIFIC_COSMOS_CHAIN_ID: 'pacific-1',
    PACIFIC_NO_FUNDS_DAPP_LINK: 'https://app.sei.io/',

    COMPASS_EVM_CHAIN_IDS: [713715, 1328, 1329],
  },
  setCompassSeiEvmConfig: (compassSeiEvmConfig: any) => set(() => ({ compassSeiEvmConfig })),
}));
