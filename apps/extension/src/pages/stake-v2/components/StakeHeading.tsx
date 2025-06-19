import {
  SelectedNetwork,
  useChainInfo,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import currency from 'currency.js'
import { AnimatePresence, motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { imgOnError } from 'utils/imgOnError'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

type StakeHeadingProps = {
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const StakeHeading = observer(({ forceChain, forceNetwork }: StakeHeadingProps) => {
  const _activeChain = useActiveChain()
  const _activeNetwork = useSelectedNetwork()

  const activeChain = forceChain ?? _activeChain
  const activeNetwork = forceNetwork ?? _activeNetwork

  const defaultTokenLogo = useDefaultTokenLogo()
  const activeChainInfo = useChainInfo(activeChain)

  const denoms = rootDenomsStore.allDenoms
  const chainDelegations = delegationsStore.delegationsForChain(activeChain)
  const chainValidators = validatorsStore.validatorsForChain(activeChain)
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

  const { network, loadingNetwork } = useStaking(
    denoms,
    chainDelegations,
    chainValidators,
    chainUnDelegations,
    chainClaimRewards,
    activeChain,
    activeNetwork,
  )

  const aprValue = useMemo(() => {
    if (network?.chainApr) {
      return currency((network?.chainApr * 100).toString(), {
        precision: 2,
        symbol: '',
      }).format()
    }
  }, [network?.chainApr])

  return (
    <div className='flex justify-between w-full items-center'>
      <div className='flex gap-x-2 items-center'>
        <img
          width={24}
          height={24}
          src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
          className='size-6 bg-secondary-300 rounded-full'
        />
        <span className='font-medium text-lg'>{activeChainInfo.chainName}</span>
      </div>

      <AnimatePresence mode='wait'>
        {network?.chainApr === undefined ? (
          <motion.div
            key='skeleton'
            transition={transition150}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            <Skeleton className='w-20 h-5' />
          </motion.div>
        ) : (
          <motion.span
            key='span'
            transition={transition150}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='font-medium text-muted-foreground'
          >
            {aprValue && `APR ${aprValue}%`}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
})

export default StakeHeading
