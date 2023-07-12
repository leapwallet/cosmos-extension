import { useRecoilValue, useSetRecoilState } from 'recoil'
import { atom } from 'recoil'

export const currentNetworkAtom = atom<'mainnet' | 'testnet'>({
  key: 'current-network',
  default: 'mainnet',
})

export const useCurrentNetwork = () => {
  return useRecoilValue(currentNetworkAtom)
}

export const useSetCurrentNetwork = () => {
  return useSetRecoilState(currentNetworkAtom)
}
