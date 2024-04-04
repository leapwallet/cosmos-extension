import {
  currencyDetail,
  useChainApis,
  useChainId,
  useDenoms,
  usePreferredCurrencyStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { getDelegations, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { captureException } from '@sentry/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import { useChainInfos } from 'hooks/useChainInfos'

import { fetchCurrency } from '../../utils/findUSDValue'
import { useActiveChain } from '../settings/useActiveChain'
import { useAddress } from './useAddress'

const responseFullfilledStats = ['success', 'error']

export function useGetStakedTokensBalance() {
  const address = useAddress()
  const activeChain = useActiveChain()
  const { lcdUrl } = useChainApis()
  const queryClient = useQueryClient()
  const { preferredCurrency } = usePreferredCurrencyStore()
  const chainInfos = useChainInfos()
  const denoms = useDenoms()
  const chainId = useChainId()

  const { data, status, error } = useQuery(
    ['delegations', activeChain, address, lcdUrl, denoms],
    async () => {
      if (lcdUrl) {
        const delegationsObj = await getDelegations(address, lcdUrl, denoms)
        const delegationKeys = Object.keys(delegationsObj)
        const denom =
          delegationKeys?.length >= 1
            ? denoms[delegationsObj[delegationKeys[0]]?.balance?.denom]
            : Object.values(chainInfos[activeChain].nativeDenoms)[0]

        const returnObj = { delegations: delegationsObj, denom }
        queryClient.setQueryData(['delegations', activeChain, address, lcdUrl], returnObj)
        return returnObj
      }
    },
  )

  status === 'error' && error && captureException(error)
  const { delegations = {}, denom } = data || {}

  const { data: usdValue, status: usdValueStatus } = useQuery(
    ['currency', preferredCurrency, denom?.coinGeckoId, denom?.chain, denoms],
    async () => {
      if (Object.keys(delegations).length > 0) {
        return await fetchCurrency(
          '1',
          (denom?.coinGeckoId ?? '') as string,
          (denom?.chain ?? '') as unknown as SupportedChain,
          currencyDetail[preferredCurrency].currencyPointer,
          `${chainId}-${denom?.coinMinimalDenom}`,
        )
      } else {
        return '0'
      }
    },
    {
      enabled: ['success', 'error'].includes(status),
    },
  )

  if (!['error', 'success'].includes(status)) {
    return {
      rewardBalance: new BigNumber(0),
      stakeBalance: new BigNumber(0),
      isLoading: true,
    }
  }

  const tda = delegations
    ? Object.values(delegations).reduce((acc, delegation) => acc + +delegation.balance.amount, 0)
    : 0
  const stakeBalance = new BigNumber(tda).multipliedBy(usdValue ?? '0').toString()

  return {
    stakeBalance: new BigNumber(stakeBalance),
    isLoading:
      !responseFullfilledStats.includes(status) ||
      !responseFullfilledStats.includes(usdValueStatus),
  }
}
