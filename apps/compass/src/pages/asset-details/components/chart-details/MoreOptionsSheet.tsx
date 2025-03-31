import { SelectedNetwork, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { GenericCard } from '@leapwallet/leap-ui'
import { ArrowDown, CurrencyCircleDollar, ShoppingBag } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import React from 'react'

type MoreOptionsSheetProps = {
  isVisible: boolean
  title: string
  onClose: () => void
  onBuy: () => void
  onStake: () => void
  onDeposit: () => void
  isStakeDisabled: boolean
  isBuyDisabled: boolean
  forceChain: SupportedChain
  forceNetwork: SelectedNetwork
}

export function MoreOptionsSheet({
  isVisible,
  onClose,
  title,
  onBuy,
  onStake,
  onDeposit,
  isStakeDisabled,
  isBuyDisabled,
  forceChain,
  forceNetwork,
}: MoreOptionsSheetProps) {
  const isStakeComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'stake',
    platform: 'Extension',
    forceChain,
    forceNetwork,
  })

  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: 'Extension',
    forceChain,
    forceNetwork,
  })

  return (
    <BottomModal isOpen={isVisible} title={title} onClose={onClose} className='p-6'>
      <div className='flex flex-col gap-y-3'>
        {!isStakeDisabled && !isStakeComingSoon && !isStakeNotSupported && (
          <GenericCard
            isRounded
            className='p-4 bg-white-100 dark:bg-gray-950'
            title='Stake'
            img={
              <CurrencyCircleDollar size={20} className='text-black-100 dark:text-white-100 mr-4' />
            }
            onClick={onStake}
          />
        )}
        <GenericCard
          isRounded
          className='p-4 bg-white-100 dark:bg-gray-950'
          title='Deposit'
          img={<ArrowDown size={20} className='text-black-100 dark:text-white-100 mr-4' />}
          onClick={onDeposit}
        />
        {!isBuyDisabled && (
          <GenericCard
            isRounded
            className='p-4 bg-white-100 dark:bg-gray-950'
            title='Buy'
            img={<ShoppingBag size={20} className='text-black-100 dark:text-white-100 mr-4' />}
            onClick={onBuy}
          />
        )}
      </div>
    </BottomModal>
  )
}
