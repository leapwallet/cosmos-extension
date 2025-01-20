import { LifiSupportedAsset } from '@leapwallet/elements-core'
import { isCompassWallet } from 'utils/isCompassWallet'
import create from 'zustand'

type CustomAddedERC20TokensStore = {
  customAddedERC20Tokens: LifiSupportedAsset[]
  setCustomAddedERC20Tokens: (customAddedERC20Tokens: LifiSupportedAsset[]) => void
}

export const useCustomAddedERC20TokensStore = create<CustomAddedERC20TokensStore>((set) => ({
  customAddedERC20Tokens: [],
  setCustomAddedERC20Tokens: (customAddedERC20Tokens: LifiSupportedAsset[]) =>
    set(() => ({ customAddedERC20Tokens })),
}))

export function useSetCustomAddedERC20Tokens() {
  const setCustomAddedERC20Tokens = useCustomAddedERC20TokensStore(
    (state) => state.setCustomAddedERC20Tokens,
  )
  return setCustomAddedERC20Tokens
}

export default function useCustomAddedERC20Tokens() {
  const { customAddedERC20Tokens } = useCustomAddedERC20TokensStore()
  if (!isCompassWallet()) {
    return []
  }
  return customAddedERC20Tokens
}
