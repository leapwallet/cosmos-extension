import { useActiveWallet, useAggregatedTokens } from '@leapwallet/cosmos-wallet-hooks'
import { lastAccessedWalletState } from 'atoms/last-accessed-wallet'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'

import { AggregatedHomeNullComponents, GeneralHome } from './index'

export function AggregatedHome() {
  const { allAssets, totalCurrencyInPreferredFiatValue, isLoading, isWalletHasFunds } =
    useAggregatedTokens()

  const countRef = useRef(0)
  const isAggregateLoadingRef = useRef<boolean>(isLoading || true)
  const allAggregateAssetsRef = useRef(allAssets)
  const totalAggregateCurrencyInPreferredFiatValueRef = useRef(totalCurrencyInPreferredFiatValue)

  const activeWallet = useActiveWallet()
  const [, setForceRerender] = useState(false)
  const hasWalletChangedRef = useRef(false)
  const [lastAccessedWallet, setLastAccessedWallet] = useRecoilState(lastAccessedWalletState)

  useMemo(() => {
    if (activeWallet?.id !== lastAccessedWallet) {
      isAggregateLoadingRef.current = true
      countRef.current = 0

      hasWalletChangedRef.current = true
      setForceRerender((prev) => !prev)
      setLastAccessedWallet(activeWallet?.id)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.id, lastAccessedWallet])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (hasWalletChangedRef.current) {
      const currDate = Date.now()
      const hasTwoSecondsPassed = currDate - countRef.current > 2000

      if (hasTwoSecondsPassed) {
        hasWalletChangedRef.current = false
      }
    } else if (allAssets.length > 0 && !hasWalletChangedRef.current && countRef.current === 0) {
      allAggregateAssetsRef.current = allAssets
      totalAggregateCurrencyInPreferredFiatValueRef.current = totalCurrencyInPreferredFiatValue
      isAggregateLoadingRef.current = false

      countRef.current = Date.now()
      setForceRerender((prev) => !prev)
    } else if (countRef.current !== 0) {
      const currDate = Date.now()
      const hasTwoSecondsPassed = currDate - countRef.current > 2000

      if (hasTwoSecondsPassed) {
        allAggregateAssetsRef.current = allAssets
        totalAggregateCurrencyInPreferredFiatValueRef.current = totalCurrencyInPreferredFiatValue

        if (allAssets.length > 0) {
          isAggregateLoadingRef.current = false
        } else {
          isAggregateLoadingRef.current = isLoading
        }

        countRef.current = currDate
        setForceRerender((prev) => !prev)
      }

      // the above hasTwoSecondsPassed does not update the final total value as expected
      // that's why we need to use setInterval to update the final total value
      intervalId = setInterval(() => {
        allAggregateAssetsRef.current = allAssets
        totalAggregateCurrencyInPreferredFiatValueRef.current = totalCurrencyInPreferredFiatValue

        if (allAssets.length > 0) {
          isAggregateLoadingRef.current = false
        } else {
          isAggregateLoadingRef.current = isLoading
        }

        countRef.current = Date.now()
        setForceRerender((prev) => !prev)
        clearInterval(intervalId)
      }, 2000)
    }

    return () => clearInterval(intervalId)
  }, [allAssets, isLoading, totalCurrencyInPreferredFiatValue])

  return (
    <>
      <GeneralHome
        _allAssets={allAggregateAssetsRef.current}
        _allAssetsCurrencyInFiat={totalAggregateCurrencyInPreferredFiatValueRef.current}
        isAggregateLoading={isAggregateLoadingRef.current}
        isWalletHasFunds={isWalletHasFunds}
      />
      <AggregatedHomeNullComponents />
    </>
  )
}
