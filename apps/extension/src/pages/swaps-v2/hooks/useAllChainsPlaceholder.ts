import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { Images } from 'images'
import { useMemo } from 'react'

import { TokenAssociatedChain } from '../components/ChainsList'

const ALL_CHAINS_PLACEHOLDER: TokenAssociatedChain = {
  chain: {
    chainName: 'All chains',
    chainId: 'all',
    icon: '',
    pfmEnabled: false,
    logoUri: '',
    bech32Prefix: '',
    chainType: 'cosmos',
    baseDenom: '',
    isTestnet: false,
    restUrl: '',
    rpcUrl: '',
    addressPrefix: '',
    coinType: '',
    chainRegistryPath: '',
    txExplorer: {
      mainnet: {
        name: '',
        txUrl: '',
      },
    },
    key: 'all' as SupportedChain,
  },
}

export const useAllChainsPlaceholder = () => {
  const { theme } = useTheme()

  return useMemo(() => {
    return {
      chain: {
        ...ALL_CHAINS_PLACEHOLDER.chain,
        icon:
          theme === ThemeName.DARK
            ? Images.Misc.AggregatedViewDarkSvg
            : Images.Misc.AggregatedViewSvg,
        logoUri:
          theme === ThemeName.DARK
            ? Images.Misc.AggregatedViewDarkSvg
            : Images.Misc.AggregatedViewSvg,
      },
    }
  }, [theme])
}
