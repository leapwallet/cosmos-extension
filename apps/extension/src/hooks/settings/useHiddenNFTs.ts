import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { HIDDEN_NFTS } from 'config/storage-keys'
import { useEffect } from 'react'
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

export const hiddenNFTsStorage = atom<string[] | undefined>({
  key: HIDDEN_NFTS,
  default: [],
})

export function useInitHiddenNFTs() {
  const setHiddenNFTs = useSetRecoilState(hiddenNFTsStorage)
  const activeWallet = useActiveWallet()

  useEffect(() => {
    Browser.storage.local.get([HIDDEN_NFTS]).then((storage) => {
      if (storage[HIDDEN_NFTS]) {
        const hiddenNFTs = JSON.parse(storage[HIDDEN_NFTS])
        setHiddenNFTs(hiddenNFTs[activeWallet?.id ?? ''] ?? [])
      } else {
        setHiddenNFTs([])
      }
    })
  }, [activeWallet, setHiddenNFTs])
}

export function useHiddenNFTs(): string[] {
  return useRecoilValue(hiddenNFTsStorage) as string[]
}

export function useModifyHiddenNFTs() {
  const [hiddenNFTs, setHiddenNFTs] = useRecoilState(hiddenNFTsStorage)
  const activeWallet = useActiveWallet()

  const addHiddenNFT = async (nft: string) => {
    const _hiddenNFTs = [...(hiddenNFTs as string[]), nft]
    setHiddenNFTs(_hiddenNFTs)

    const storage = await Browser.storage.local.get([HIDDEN_NFTS])
    await Browser.storage.local.set({
      [HIDDEN_NFTS]: JSON.stringify({
        ...JSON.parse(storage[HIDDEN_NFTS] ?? '{}'),
        [activeWallet?.id ?? '']: _hiddenNFTs,
      }),
    })
  }

  const removeHiddenNFT = async (nft: string) => {
    const _hiddenNFTs = hiddenNFTs?.filter((_nft) => _nft !== nft)
    setHiddenNFTs(_hiddenNFTs)

    const storage = await Browser.storage.local.get([HIDDEN_NFTS])
    await Browser.storage.local.set({
      [HIDDEN_NFTS]: JSON.stringify({
        ...JSON.parse(storage[HIDDEN_NFTS] ?? '{}'),
        [activeWallet?.id ?? '']: _hiddenNFTs,
      }),
    })
  }

  return { hiddenNFTs, addHiddenNFT, removeHiddenNFT }
}
