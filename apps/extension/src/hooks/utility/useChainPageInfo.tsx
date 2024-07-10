import { useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { Images } from 'images'
import { useMemo } from 'react'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'

import { useDefaultTokenLogo } from './index'

export function useChainPageInfo() {
  const chains = useGetChains()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const defaultTokenLogo = useDefaultTokenLogo()

  const headerChainImgSrc = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return Images.Misc.AggregatedViewSvg
    }

    return chains[activeChain]?.chainSymbolImageUrl ?? defaultTokenLogo
  }, [activeChain, chains, defaultTokenLogo])

  const gradientChainColor = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return Colors.aggregateGradient
    }

    if (isCompassWallet()) {
      return Colors.compassGradient
    }

    return chains[activeChain]?.theme?.gradient
  }, [activeChain, chains])

  const topChainColor = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY) {
      return Colors.aggregatePrimary
    }

    if (isCompassWallet()) {
      return Colors.compassPrimary
    }

    return Colors.getChainColor(activeChain, chains[activeChain])
  }, [activeChain, chains])

  return {
    headerChainImgSrc,
    gradientChainColor,
    topChainColor,
  }
}
