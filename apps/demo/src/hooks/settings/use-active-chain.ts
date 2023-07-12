import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { atom } from 'recoil'

export const activeChainAtom = atom<SupportedChain>({
  key: 'active-chain-atom',
  default: 'cosmos',
})

export const useActiveChain = () => {
  return useRecoilValue(activeChainAtom)
}

export const useSetActiveChain = () => {
  return useSetRecoilState(activeChainAtom)
}
