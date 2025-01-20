import {
  LSProvider,
  SelectedNetwork,
  useActiveChain,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { GenericCard } from '@leapwallet/leap-ui'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import currency from 'currency.js'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'

import { ProviderCard } from './SelectLSProvider'

type StakeSelectSheetProps = {
  isVisible: boolean
  title: string
  onClose: () => void
  tokenLSProviders: LSProvider[]
  handleStakeClick: () => void
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const StakeSelectSheet = observer(
  ({
    isVisible,
    title,
    onClose,
    tokenLSProviders,
    handleStakeClick,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
  }: StakeSelectSheetProps) => {
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const denoms = rootDenomsStore.allDenoms
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const [showLSProviders, setShowLSProviders] = useState(false)
    const { minMaxApr } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
    )

    const avgAprValue = useMemo(() => {
      if (minMaxApr) {
        const avgApr = (minMaxApr[0] + minMaxApr[1]) / 2
        return currency((avgApr * 100).toString(), { precision: 2, symbol: '' }).format()
      }
      return null
    }, [minMaxApr])
    const maxLSAPY = useMemo(() => {
      if (tokenLSProviders?.length > 0) {
        const _maxAPY = Math.max(...tokenLSProviders.map((provider) => provider.apy))
        return `APY ${currency((_maxAPY * 100).toString(), { precision: 2, symbol: '' }).format()}%`
      } else {
        return 'N/A'
      }
    }, [tokenLSProviders])

    return (
      <BottomModal
        isOpen={isVisible}
        onClose={() => {
          setShowLSProviders(false)
          onClose()
        }}
        closeOnBackdropClick={true}
        title={title}
        className='p-6'
      >
        <div className='flex flex-col gap-y-4'>
          <GenericCard
            className='bg-white-100 dark:bg-gray-950'
            title={
              <Text size='sm' color='text-gray-800 dark:text-white-100'>
                Stake
              </Text>
            }
            subtitle={
              <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                APR {avgAprValue}%
              </Text>
            }
            size='md'
            isRounded
            title2={
              <button
                onClick={handleStakeClick}
                className='rounded-full text-xs font-bold text-white-100 dark:text-gray-900 dark:bg-white-100 bg-gray-900 px-4 py-2'
              >
                Stake
              </button>
            }
          />
          {tokenLSProviders?.length > 0 && (
            <div className='flex flex-col gap-y-3 p-4 bg-white-100 dark:bg-gray-950 rounded-2xl'>
              <div className='flex justify-between'>
                <div className='flex flex-col'>
                  <Text size='sm' color='text-gray-800 dark:text-white-100' className='font-bold'>
                    Liquid Stake
                  </Text>
                  <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                    {maxLSAPY}
                  </Text>
                </div>
                <span
                  onClick={() => setShowLSProviders(!showLSProviders)}
                  className='rounded-full text-xs font-bold bg-gray-50 dark:bg-gray-900 py-1 px-3 cursor-pointer flex items-center text-black-100 dark:text-white-100'
                >
                  {showLSProviders ? (
                    <CaretUp size={16} className='text-black-100 dark:text-white-100' />
                  ) : (
                    <CaretDown size={16} className='text-black-100 dark:text-white-100' />
                  )}
                </span>
              </div>
              {showLSProviders && (
                <>
                  <div className='flex flex-col gap-y-4'>
                    {tokenLSProviders &&
                      tokenLSProviders.map((provider) => (
                        <div className='relative' key={provider.name}>
                          {provider.priority && (
                            <div className='text-white-100 dark:text-white-100 absolute top-0 right-4 px-1.5 py-0.5 bg-green-600 rounded-b-[4px] text-[10px] font-bold'>
                              Promoted
                            </div>
                          )}
                          <ProviderCard
                            key={provider.name}
                            provider={provider}
                            backgroundColor={`${
                              provider.priority ? '!bg-[#29A87426]' : 'bg-gray-50 dark:bg-gray-900'
                            }`}
                            rootDenomsStore={rootDenomsStore}
                          />
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </BottomModal>
    )
  },
)

export default StakeSelectSheet
