import { STARRED_CHAINS } from 'config/storage-keys'
import { useEffect } from 'react'
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

const starredChainsStorage = atom<string[] | undefined>({
  key: STARRED_CHAINS,
  default: [],
})

export function useInitStarredChains() {
  const setStarredChains = useSetRecoilState(starredChainsStorage)

  useEffect(() => {
    Browser.storage.local.get([STARRED_CHAINS]).then((storage) => {
      if (storage[STARRED_CHAINS]) {
        const starredChains = JSON.parse(storage[STARRED_CHAINS])
        setStarredChains(starredChains ?? [])
      } else {
        setStarredChains([])
      }
    })
  }, [setStarredChains])
}

export function useStarredChains(): string[] {
  return useRecoilValue(starredChainsStorage) as string[]
}

export function useModifyStarredChains() {
  const [starredChains, setStarredChains] = useRecoilState(starredChainsStorage)

  const addStarredChain = async (chain: string) => {
    const _starredChains = [...(starredChains as string[]), chain]
    setStarredChains(_starredChains)

    await Browser.storage.local.set({
      [STARRED_CHAINS]: JSON.stringify(_starredChains),
    })
  }

  const removeStarredChain = async (chain: string) => {
    const _starredChains = starredChains?.filter((f) => f !== chain)
    setStarredChains(_starredChains)

    await Browser.storage.local.set({
      [STARRED_CHAINS]: JSON.stringify(_starredChains),
    })
  }

  return { starredChains, addStarredChain, removeStarredChain }
}
