import {
  hasToAddEvmDetails,
  useGetChains,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks'
import { isSolanaChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { AnimatePresence, motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { aptosCoinDataStore, solanaCoinDataStore, suiCoinDataStore } from 'stores/balance-store'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { rootBalanceStore } from 'stores/root-store'
import { AggregatedSupportedChain } from 'types/utility'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

export const TotalBalance = observer(() => {
  const [formatCurrency] = useFormatCurrency()
  const activeChain = useActiveChain() as AggregatedSupportedChain

  const chains = useGetChains()

  const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain
  const isAptosChain = chains?.[activeChain as SupportedChain]?.chainId?.startsWith('aptos')
  const _isSolanaChain = isSolanaChain(activeChain)
  const _isSuiChain = chains?.[activeChain as SupportedChain]?.chainId?.startsWith('sui')

  const countRef = useRef(0)
  const [timedBalancesFiatValue, setTimedBalancesFiatValue] = useState(
    rootBalanceStore.totalFiatValue,
  )

  const totalFiatValue = (() => {
    const addEvmDetails = isEvmOnlyChain ?? false

    if (addEvmDetails) {
      return rootBalanceStore.totalFiatValue.plus(
        rootBalanceStore.erc20BalanceStore.evmBalanceStore.evmBalance.currencyInFiatValue,
      )
    }
    if (isAptosChain) {
      return aptosCoinDataStore.totalFiatValue
    }
    if (_isSolanaChain) {
      return solanaCoinDataStore.totalFiatValue
    }
    if (_isSuiChain) {
      return suiCoinDataStore.totalFiatValue
    }
    return rootBalanceStore.totalFiatValue
  })()

  useEffect(() => {
    if (totalFiatValue.toString() !== timedBalancesFiatValue.toString()) {
      if (totalFiatValue.toNumber() === 0 || timedBalancesFiatValue.toNumber() === 0) {
        setTimedBalancesFiatValue(totalFiatValue)
      } else {
        const timeoutId = setTimeout(() => {
          setTimedBalancesFiatValue(totalFiatValue)
          clearTimeout(timeoutId)
        }, 1000 + countRef.current * 2000)
        countRef.current = Math.min(countRef.current + 1, 2)
      }
    }
  }, [totalFiatValue, timedBalancesFiatValue])

  return (
    <AnimatePresence mode='wait'>
      <motion.button
        key={hideAssetsStore.isHidden ? 'hidden' : 'visible'}
        onClick={() => hideAssetsStore.setHidden(!hideAssetsStore.isHidden)}
        className={'text-[36px] leading-[49px] font-black'}
        transition={transition150}
        variants={opacityFadeInOut}
        initial='hidden'
        animate='visible'
        exit='hidden'
      >
        <span className={hideAssetsStore.isHidden ? 'text-muted-foreground' : ''}>
          {hideAssetsStore.formatHideBalance(formatCurrency(totalFiatValue, true))}
        </span>
      </motion.button>
    </AnimatePresence>
  )
})
