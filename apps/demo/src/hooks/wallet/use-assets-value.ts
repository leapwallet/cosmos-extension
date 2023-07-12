import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { usePreferredCurrency } from '~/hooks/settings/use-currency'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import { Token } from '~/types/bank'
import { convertFromUsdToRegional } from '~/util/currency-conversion'

const zeroValue = new BigNumber(0)

export const getAssetsValue = (assets?: Token[]) => {
  return (
    assets?.reduce((acc, cur) => {
      const amountNumber: BigNumber = new BigNumber(cur.amount)
      if (amountNumber.isNaN()) return acc
      const priceNumber: BigNumber = new BigNumber(cur.usdPrice)
      if (priceNumber.isNaN()) return acc
      return acc.plus(amountNumber.multipliedBy(priceNumber))
    }, zeroValue) ?? zeroValue
  )
}

export const useGetValueInPreferredCurrency = (value: string | number | BigNumber): BigNumber => {
  const preferredCurrency = usePreferredCurrency()

  return convertFromUsdToRegional(new BigNumber(value), preferredCurrency)
}

const useAssetsValue = (): BigNumber => {
  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain()
  const preferredCurrency = usePreferredCurrency()

  return useMemo(
    () =>
      convertFromUsdToRegional(getAssetsValue(activeWallet.assets[activeChain]), preferredCurrency),
    [activeWallet.assets, activeChain, preferredCurrency],
  )
}

export default useAssetsValue
