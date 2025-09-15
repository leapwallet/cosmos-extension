import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AnimatePresence, motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { rootBalanceStore } from 'stores/root-store'
import { AggregatedSupportedChain } from 'types/utility'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

export const TotalBalance = observer(() => {
  const [formatCurrency] = useFormatCurrency()
  const activeChain = useActiveChain() as AggregatedSupportedChain

  const chains = useGetChains()

  const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain

  const totalFiatValue = (() => {
    const addEvmDetails = isEvmOnlyChain ?? false

    if (addEvmDetails) {
      return rootBalanceStore.totalFiatValue.plus(
        rootBalanceStore.erc20BalanceStore.evmBalanceStore.totalFiatValue,
      )
    }

    return rootBalanceStore.totalFiatValue
  })()

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
