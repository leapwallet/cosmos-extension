import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { usePreferredCurrency } from '~/hooks/settings/use-currency'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import { convertFromUsdToRegional } from '~/util/currency-conversion'
import { tokenAndUsdPrice, tokensByChain } from '~/util/tokens'

export const useRewardsBalance = () => {
  const activeChain = useActiveChain()
  const activeWallet = useActiveWallet()
  const preferredCurrency = usePreferredCurrency()

  return useMemo(() => {
    const price = new BigNumber(tokenAndUsdPrice[tokensByChain[activeChain].symbol])
    return convertFromUsdToRegional(
      new BigNumber(activeWallet.rewards[activeChain]).multipliedBy(price),
      preferredCurrency,
    )
  }, [activeChain, activeWallet.rewards, preferredCurrency])
}
