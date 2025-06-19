import {
  hasToAddEvmDetails,
  useGetChains,
  useIsSeiEvmChain,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { AnimatePresence, motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { evmBalanceStore } from 'stores/balance-store'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { rootBalanceStore } from 'stores/root-store'
import { AggregatedSupportedChain } from 'types/utility'
import { opacityFadeInOut } from 'utils/motion-variants'
import { transition150 } from 'utils/motion-variants'

export const TotalBalance = observer(() => {
  const [formatCurrency] = useFormatCurrency()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const { addressLinkState } = useSeiLinkedAddressState(
    activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : undefined,
  )

  const chains = useGetChains()
  const evmBalance = evmBalanceStore.evmBalance
  const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain
  const isSeiEvmChain = useIsSeiEvmChain(
    activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : activeChain,
  )

  const countRef = useRef(0)
  const [timedBalancesFiatValue, setTimedBalancesFiatValue] = useState(
    rootBalanceStore.totalFiatValue,
  )

  const totalFiatValue = useMemo(() => {
    const addEvmDetails = hasToAddEvmDetails(
      isSeiEvmChain,
      addressLinkState,
      isEvmOnlyChain ?? false,
    )

    if (addEvmDetails) {
      return rootBalanceStore.totalFiatValue.plus(evmBalance.currencyInFiatValue)
    }

    return rootBalanceStore.totalFiatValue
  }, [addressLinkState, evmBalance.currencyInFiatValue, isEvmOnlyChain, isSeiEvmChain])

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
        className={'text-[3rem] font-black'}
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
