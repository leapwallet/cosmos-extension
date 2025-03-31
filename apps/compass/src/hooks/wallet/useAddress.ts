import { useAddress as useAddressWalletHooks } from '@leapwallet/cosmos-wallet-hooks'

export function useAddress() {
  return useAddressWalletHooks()
}
