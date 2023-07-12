import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { atom, selector, useRecoilValue } from 'recoil'

import { usePreferredCurrency } from '~/hooks/settings/use-currency'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import { Delegations } from '~/types/bank'
import { convertFromUsdToRegional } from '~/util/currency-conversion'
import { tokenAndUsdPrice } from '~/util/tokens'

import { wallet1, wallet2 } from '../wallet/data'
import { tokensByChain } from './../../util/tokens'
import { useActiveChain } from './../settings/use-active-chain'
import { activeWalletIdAtom } from './../wallet/use-wallet'
import { delegations } from './data'

// activity is per wallet
// for all the chains, show a common activity tab
export const delegationsAtom = atom<Record<string, Delegations>>({
  key: 'staking-delegations',
  default: {
    [wallet1.id]: delegations,
    [wallet2.id]: delegations,
  },
})

export const delegationsSelector = selector<Delegations>({
  key: 'current-wallet-delegations',
  get: ({ get }) => {
    const activeWalletId = get(activeWalletIdAtom)
    const delegationsRecord = get(delegationsAtom)
    return delegationsRecord[activeWalletId]
  },
  set: ({ get, set }, newValue: Delegations) => {
    const activeWalletId = get(activeWalletIdAtom)

    set(delegationsAtom, (value: Record<string, Delegations>) => ({
      ...value,
      [activeWalletId]: newValue,
    }))
  },
})

const chainApy = 0.208

const chainApr = 0.208

const totalRewards = '0.000702166076649515'

const zero = new BigNumber(0)

export const useDelegations = () => {
  const activeChain = useActiveChain()
  const delegations = useRecoilValue(delegationsSelector)
  const activeWallet = useActiveWallet()
  const preferredCurrency = usePreferredCurrency()

  const minMaxApy = useMemo(() => [0.10490622877437161, 0.20981245754874323], [])

  const token = useMemo(
    () =>
      activeWallet.assets[activeChain].find((t) => t.symbol === tokensByChain[activeChain].symbol),
    [activeChain, activeWallet.assets],
  )

  const totalDelegationAmount = useMemo(() => {
    return Object.entries(delegations).reduce((acc, [, { balance }]) => {
      return new BigNumber(balance.amount).plus(acc)
    }, zero)
  }, [delegations])

  const currencyAmountDelegation = useMemo(() => {
    return convertFromUsdToRegional(
      totalDelegationAmount.multipliedBy(tokenAndUsdPrice[token.symbol]),
      preferredCurrency,
    ).toFixed(2)
  }, [preferredCurrency, token.symbol, totalDelegationAmount])

  return useMemo(
    () => ({
      delegations,
      totalDelegationAmount: totalDelegationAmount.toFixed(4),
      currencyAmountDelegation,
      totalRewards,
      chainApr,
      chainApy,
      minMaxApy,
      token,
    }),
    [currencyAmountDelegation, delegations, minMaxApy, token, totalDelegationAmount],
  )
}
