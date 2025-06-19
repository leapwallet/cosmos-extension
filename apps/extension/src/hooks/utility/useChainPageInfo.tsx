import { useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { Images } from 'images'
import { useMemo } from 'react'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'

import { useDefaultTokenLogo } from './useDefaultTokenLogo'

export function useChainPageInfo() {
  const chains = useGetChains()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const defaultTokenLogo = useDefaultTokenLogo()
  const { theme } = useTheme()

  const headerChainImgSrc = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return theme === ThemeName.DARK
        ? Images.Misc.AggregatedViewDarkSvg
        : Images.Misc.AggregatedViewSvg
    }

    return chains[activeChain]?.chainSymbolImageUrl || defaultTokenLogo
  }, [activeChain, chains, defaultTokenLogo, theme])

  const gradientChainColor = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return Colors.aggregateGradient
    }

    return chains[activeChain]?.theme?.gradient
  }, [activeChain, chains])

  const topChainColor = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return Colors.aggregatePrimary
    }
    return Colors.getChainColor(activeChain, chains[activeChain])
  }, [activeChain, chains])

  return {
    headerChainImgSrc,
    gradientChainColor,
    topChainColor,
  }
}
