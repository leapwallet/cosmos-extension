import { useEffect } from 'react';

import { useCompassSeiEvmConfigStore } from '../store';
import { cachedRemoteDataWithLastModified, storage, useGetStorageLayer } from '../utils';

const COMPASS_SEI_EVM_CONFIG_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/compass-sei-evm-config.json';

export type CompassSeiEvmConfig = {
  'arctic-1': {
    cosmos_chain_id: string;
    eth_chain_id: number;
    chain_key: string;
    evm_rpc_url: string;
    no_funds_dapp_link: string;
    gas_limit: number;
    gas_price_steps: {
      low: number;
      medium: number;
      high: number;
    };
  };
  'atlantic-2': {
    cosmos_chain_id: string;
    eth_chain_id: number;
    chain_key: string;
    evm_rpc_url: string;
    no_funds_dapp_link: string;
  };
  'pacific-1': {
    cosmos_chain_id: string;
    eth_chain_id: number;
    evm_rpc_url: string;
    no_funds_dapp_link: string;
  };
};

export function getCompassSeiEvmConfig(storage: storage): Promise<CompassSeiEvmConfig> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: COMPASS_SEI_EVM_CONFIG_URL,
    storageKey: 'compass-sei-evm-config',
    storage,
  });
}

export function useInitCompassSeiEvmConfig() {
  const storage = useGetStorageLayer();
  const { setCompassSeiEvmConfig } = useCompassSeiEvmConfigStore();

  useEffect(() => {
    (async function initCompassSeiEvmConfig() {
      const seiEvmConfig = await getCompassSeiEvmConfig(storage);

      const compassSeiEvmConfig = {
        ARCTIC_COSMOS_CHAIN_ID: seiEvmConfig['arctic-1'].cosmos_chain_id,
        ARCTIC_ETH_CHAIN_ID: seiEvmConfig['arctic-1'].eth_chain_id,
        ARCTIC_CHAIN_KEY: seiEvmConfig['arctic-1'].chain_key,
        ARCTIC_EVM_RPC_URL: seiEvmConfig['arctic-1'].evm_rpc_url,
        ARCTIC_NO_FUNDS_DAPP_LINK: seiEvmConfig['arctic-1'].no_funds_dapp_link,

        ARCTIC_EVM_GAS_LIMIT: seiEvmConfig['arctic-1'].gas_limit,
        ARCTIC_EVM_GAS_PRICE_STEPS: seiEvmConfig['arctic-1'].gas_price_steps,

        ATLANTIC_COSMOS_CHAIN_ID: seiEvmConfig['atlantic-2'].cosmos_chain_id,
        ATLANTIC_ETH_CHAIN_ID: seiEvmConfig['atlantic-2'].eth_chain_id,
        ATLANTIC_CHAIN_KEY: seiEvmConfig['atlantic-2'].chain_key,
        ATLANTIC_EVM_RPC_URL: seiEvmConfig['atlantic-2'].evm_rpc_url,
        ATLANTIC_NO_FUNDS_DAPP_LINK: seiEvmConfig['atlantic-2'].no_funds_dapp_link,

        PACIFIC_COSMOS_CHAIN_ID: seiEvmConfig['pacific-1'].cosmos_chain_id,
        PACIFIC_ETH_CHAIN_ID: seiEvmConfig['pacific-1'].eth_chain_id,
        PACIFIC_EVM_RPC_URL: seiEvmConfig['pacific-1'].evm_rpc_url,
        PACIFIC_NO_FUNDS_DAPP_LINK: seiEvmConfig['pacific-1'].no_funds_dapp_link,

        COMPASS_EVM_CHAIN_IDS: [
          seiEvmConfig['arctic-1'].eth_chain_id,
          seiEvmConfig['atlantic-2'].eth_chain_id,
          seiEvmConfig['pacific-1'].eth_chain_id,
        ],
      };

      setCompassSeiEvmConfig(compassSeiEvmConfig);
    })();
  }, []);
}
