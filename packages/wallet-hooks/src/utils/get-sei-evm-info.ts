import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { getCompassSeiEvmConfigStoreSnapshot } from '../store';
export type SelectedNetworkType = 'mainnet' | 'testnet';

export enum SeiEvmInfoEnum {
  EVM_RPC_URL = 'EVM_RPC_URL',
  EVM_CHAIN_ID = 'EVM_CHAIN_ID',
  COSMOS_CHAIN_ID = 'COSMOS_CHAIN_ID',
  NO_FUNDS_DAPP_LINK = 'NO_FUNDS_DAPP_LINK',
  COSMOS_CHAIN_KEY_USING_EVM_CHAIN_ID = 'COSMOS_CHAIN_KEY_USING_EVM_CHAIN_ID',
}

export type GetSeiEvmInfoParams = {
  activeChain?: SupportedChain;
  activeNetwork?: SelectedNetworkType;
  infoType: SeiEvmInfoEnum;
  evmChainId?: number;
};

export async function getSeiEvmInfo({ activeChain, activeNetwork, infoType, evmChainId }: GetSeiEvmInfoParams) {
  const seiEvmConfig = await getCompassSeiEvmConfigStoreSnapshot();
  const {
    ARCTIC_COSMOS_CHAIN_ID,
    ARCTIC_ETH_CHAIN_ID,
    ARCTIC_CHAIN_KEY,
    ARCTIC_EVM_RPC_URL,
    ARCTIC_NO_FUNDS_DAPP_LINK,

    ATLANTIC_EVM_RPC_URL,
    ATLANTIC_ETH_CHAIN_ID,
    ATLANTIC_COSMOS_CHAIN_ID,
    ATLANTIC_CHAIN_KEY,
    ATLANTIC_NO_FUNDS_DAPP_LINK,

    PACIFIC_EVM_RPC_URL,
    PACIFIC_ETH_CHAIN_ID,
    PACIFIC_COSMOS_CHAIN_ID,
    PACIFIC_NO_FUNDS_DAPP_LINK,
  } = seiEvmConfig;

  if (infoType === SeiEvmInfoEnum.COSMOS_CHAIN_KEY_USING_EVM_CHAIN_ID) {
    if ([ATLANTIC_ETH_CHAIN_ID, PACIFIC_ETH_CHAIN_ID].includes(evmChainId ?? 0)) {
      return ATLANTIC_CHAIN_KEY;
    }

    return ARCTIC_CHAIN_KEY;
  }

  if (activeChain === ATLANTIC_CHAIN_KEY) {
    if (activeNetwork === 'mainnet') {
      switch (infoType) {
        case SeiEvmInfoEnum.EVM_RPC_URL:
          return PACIFIC_EVM_RPC_URL;

        case SeiEvmInfoEnum.EVM_CHAIN_ID:
          return PACIFIC_ETH_CHAIN_ID;

        case SeiEvmInfoEnum.COSMOS_CHAIN_ID:
          return PACIFIC_COSMOS_CHAIN_ID;

        case SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK:
          return PACIFIC_NO_FUNDS_DAPP_LINK;
      }
    }

    if (activeNetwork === 'testnet') {
      switch (infoType) {
        case SeiEvmInfoEnum.EVM_RPC_URL:
          return ATLANTIC_EVM_RPC_URL;

        case SeiEvmInfoEnum.EVM_CHAIN_ID:
          return ATLANTIC_ETH_CHAIN_ID;

        case SeiEvmInfoEnum.COSMOS_CHAIN_ID:
          return ATLANTIC_COSMOS_CHAIN_ID;

        case SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK:
          return ATLANTIC_NO_FUNDS_DAPP_LINK;
      }
    }
  }

  switch (infoType) {
    case SeiEvmInfoEnum.EVM_RPC_URL:
      return ARCTIC_EVM_RPC_URL;

    case SeiEvmInfoEnum.EVM_CHAIN_ID:
      return ARCTIC_ETH_CHAIN_ID;

    case SeiEvmInfoEnum.COSMOS_CHAIN_ID:
      return ARCTIC_COSMOS_CHAIN_ID;

    case SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK:
      return ARCTIC_NO_FUNDS_DAPP_LINK;
  }
}
