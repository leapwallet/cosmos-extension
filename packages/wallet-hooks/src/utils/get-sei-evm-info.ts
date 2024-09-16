import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { getCompassSeiEvmConfigStoreSnapshot } from '../store';
export type SelectedNetworkType = 'mainnet' | 'testnet';

export enum SeiEvmInfoEnum {
  NO_FUNDS_DAPP_LINK = 'NO_FUNDS_DAPP_LINK',
}

export type GetSeiEvmInfoParams = {
  activeChain?: SupportedChain;
  activeNetwork?: SelectedNetworkType;
  infoType: SeiEvmInfoEnum;
};

export async function getSeiEvmInfo({ activeChain, activeNetwork, infoType }: GetSeiEvmInfoParams) {
  const seiEvmConfig = await getCompassSeiEvmConfigStoreSnapshot();
  const { ARCTIC_NO_FUNDS_DAPP_LINK, ATLANTIC_NO_FUNDS_DAPP_LINK, PACIFIC_NO_FUNDS_DAPP_LINK } = seiEvmConfig;

  if (activeChain === 'seiTestnet2') {
    if (activeNetwork === 'mainnet') {
      switch (infoType) {
        case SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK:
          return PACIFIC_NO_FUNDS_DAPP_LINK;
      }
    }

    if (activeNetwork === 'testnet') {
      switch (infoType) {
        case SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK:
          return ATLANTIC_NO_FUNDS_DAPP_LINK;
      }
    }
  }

  switch (infoType) {
    case SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK:
      return ARCTIC_NO_FUNDS_DAPP_LINK;
  }
}
