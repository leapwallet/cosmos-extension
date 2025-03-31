import { useSnipGetSnip20TokenBalances } from '@leapwallet/cosmos-wallet-hooks'

export function useGetSNIP20Balances() {
  const snip20Tokens = useSnipGetSnip20TokenBalances()

  return { snip20Tokens }
}
