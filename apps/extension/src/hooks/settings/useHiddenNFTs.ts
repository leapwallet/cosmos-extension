import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'
import { HiddenNftStore } from 'stores/manage-nft-store'

export function useInitHiddenNFTs(hiddenNFTsStore: HiddenNftStore) {
  const activeWallet = useActiveWallet()

  useEffect(() => {
    if (!activeWallet?.id) return

    hiddenNFTsStore.initHiddenNfts(activeWallet.id)
  }, [activeWallet, hiddenNFTsStore])
}
