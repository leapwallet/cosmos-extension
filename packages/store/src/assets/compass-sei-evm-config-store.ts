import { makeAutoObservable, runInAction } from 'mobx';

import { CompassSeiEvmConfigType } from '../types';

const COMPASS_SEI_EVM_CONFIG_S3_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/config/compass-sei-evm-config.json';

export class CompassSeiEvmConfigStore {
  compassSeiEvmConfig: CompassSeiEvmConfigType = {
    ARCTIC_COSMOS_CHAIN_ID: 'arctic-1',
    ARCTIC_ETH_CHAIN_ID: 713715,
    ARCTIC_CHAIN_KEY: 'seiDevnet',
    ARCTIC_EVM_RPC_URL: 'https://evm-rpc-arctic-1.sei-apis.com',
    ARCTIC_NO_FUNDS_DAPP_LINK: 'https://arctic-1.app.sei.io/',

    ARCTIC_EVM_GAS_LIMIT: 21_000,
    ARCTIC_EVM_GAS_PRICE_STEPS: {
      low: 0.0000001,
      medium: 0.00000012,
      high: 0.00000015,
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
  };
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.loadCompassSeiEvmConfig();
  }

  async loadCompassSeiEvmConfig() {
    const response = await fetch(COMPASS_SEI_EVM_CONFIG_S3_URL);
    const seiEvmConfig = await response.json();

    runInAction(() => {
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

      this.compassSeiEvmConfig = compassSeiEvmConfig;
    });
  }
}
