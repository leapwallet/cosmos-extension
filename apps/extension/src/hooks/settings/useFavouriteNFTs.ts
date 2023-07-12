import { useEffect } from 'react'
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

const favouriteNFTsStorage = atom<string[] | undefined>({
  key: 'fav-nft',
  default: [],
})

export function useInitFavouriteNFTs() {
  const getFavNFTs = useSetRecoilState(favouriteNFTsStorage)
  useEffect(() => {
    Browser.storage.local.get(['fav-nft']).then((storage) => {
      const temp = storage['fav-nft'] ?? []
      getFavNFTs(temp)
    })
  }, [getFavNFTs])
}

export function useFavNFTs(): string[] {
  return useRecoilValue(favouriteNFTsStorage) as string[]
}

export function useModifyFavNFTs() {
  const [favNFTs, setFavNFTs] = useRecoilState(favouriteNFTsStorage)
  const addFavNFT = async (nft: string) => {
    const temp = [...(favNFTs as string[]), nft]
    setFavNFTs(temp)
    await Browser.storage.local.set({ 'fav-nft': temp })
  }
  const removeFavNFT = async (nft: string) => {
    const temp = favNFTs?.filter((f) => f !== nft)
    setFavNFTs(temp)
    await Browser.storage.local.set({ 'fav-nft': temp })
  }
  return { favNFTs, addFavNFT, removeFavNFT }
}
