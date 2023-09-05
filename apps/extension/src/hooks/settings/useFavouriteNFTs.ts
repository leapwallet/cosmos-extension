import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { FAVOURITE_NFTS } from 'config/storage-keys'
import { useEffect } from 'react'
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

const favouriteNFTsStorage = atom<string[] | undefined>({
  key: FAVOURITE_NFTS,
  default: [],
})

export function useInitFavouriteNFTs() {
  const setFavNFTs = useSetRecoilState(favouriteNFTsStorage)
  const activeWallet = useActiveWallet()

  useEffect(() => {
    Browser.storage.local.get([FAVOURITE_NFTS]).then((storage) => {
      if (storage[FAVOURITE_NFTS]) {
        const favNFTS = JSON.parse(storage[FAVOURITE_NFTS])
        setFavNFTs(favNFTS[activeWallet?.id ?? ''] ?? [])
      } else {
        setFavNFTs([])
      }
    })
  }, [activeWallet, setFavNFTs])
}

export function useFavNFTs(): string[] {
  return useRecoilValue(favouriteNFTsStorage) as string[]
}

export function useModifyFavNFTs() {
  const [favNFTs, setFavNFTs] = useRecoilState(favouriteNFTsStorage)
  const activeWallet = useActiveWallet()

  const addFavNFT = async (nft: string) => {
    const _favNFTs = [...(favNFTs as string[]), nft]
    setFavNFTs(_favNFTs)

    const storage = await Browser.storage.local.get([FAVOURITE_NFTS])
    await Browser.storage.local.set({
      [FAVOURITE_NFTS]: JSON.stringify({
        ...JSON.parse(storage[FAVOURITE_NFTS] ?? '{}'),
        [activeWallet?.id ?? '']: _favNFTs,
      }),
    })
  }

  const removeFavNFT = async (nft: string) => {
    const _favNFTs = favNFTs?.filter((f) => f !== nft)
    setFavNFTs(_favNFTs)

    const storage = await Browser.storage.local.get([FAVOURITE_NFTS])
    await Browser.storage.local.set({
      [FAVOURITE_NFTS]: JSON.stringify({
        ...JSON.parse(storage[FAVOURITE_NFTS] ?? '{}'),
        [activeWallet?.id ?? '']: _favNFTs,
      }),
    })
  }

  return { favNFTs, addFavNFT, removeFavNFT }
}
