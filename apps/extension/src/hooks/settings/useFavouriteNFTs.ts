import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'
import { FavNftStore } from 'stores/manage-nft-store'

export function useInitFavouriteNFTs(favNftStore: FavNftStore) {
  const activeWallet = useActiveWallet()

  useEffect(() => {
    if (!activeWallet?.id) return

    favNftStore.initFavNfts(activeWallet?.id)
  }, [activeWallet, favNftStore])
}
