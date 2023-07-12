import {
  BETA_NFTS_COLLECTIONS,
  useActiveChain,
  useBetaNFTsCollectionsStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'

import { fillBetaValuesFromStorage } from './fillBetaValuesFromStorage'

export function useFillBetaNFTsCollections() {
  const activeChain = useActiveChain()
  const { setBetaNFTsCollections } = useBetaNFTsCollectionsStore()

  useEffect(
    () =>
      fillBetaValuesFromStorage(
        activeChain,
        BETA_NFTS_COLLECTIONS,
        (value) => setBetaNFTsCollections(value),
        [],
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain],
  )
}
