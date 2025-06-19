import { LSProvider, SelectedNetwork, useActiveStakingDenom } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { GenericCard } from '@leapwallet/leap-ui'
import { ArrowSquareOut } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { ValidatorItemSkeleton } from 'components/Skeletons/StakeSkeleton'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import currency from 'currency.js'
import { GenericLight } from 'images/logos'
import mixpanel from 'mixpanel-browser'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

interface SelectLSProviderProps {
  isVisible: boolean
  onClose: () => void
  providers: LSProvider[]
  rootDenomsStore: RootDenomsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

interface ProviderCardProps {
  provider: LSProvider
  backgroundColor: string
  rootDenomsStore: RootDenomsStore
  activeChain?: SupportedChain
  activeNetwork?: SelectedNetwork
}

export function ProviderCard({
  provider,
  backgroundColor,
  rootDenomsStore,
  activeChain,
  activeNetwork,
}: ProviderCardProps) {
  const [activeStakingDenom] = useActiveStakingDenom(
    rootDenomsStore.allDenoms,
    activeChain,
    activeNetwork,
  )

  return (
    <GenericCard
      onClick={() => {
        window.open(provider.url, '_blank')
      }}
      className={`${backgroundColor} w-full`}
      img={
        <img
          src={provider.image ?? GenericLight}
          onError={imgOnError(GenericLight)}
          width={30}
          height={30}
          className='rounded-full mr-4'
        />
      }
      isRounded
      size='md'
      title={
        <Text
          size='sm'
          color='text-black-100 dark:text-white-100'
          className='font-bold overflow-hidden'
        >
          {provider.name}
        </Text>
      }
      subtitle={
        <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
          {provider.apy
            ? `APY ${currency((provider.apy * 100).toString(), {
                precision: 2,
                symbol: '',
              }).format()}%`
            : 'N/A'}
        </Text>
      }
      icon={
        <ArrowSquareOut size={16} weight='bold' className='dark:text-white-100 text-black-100' />
      }
    />
  )
}

export default function SelectLSProvider({
  isVisible,
  onClose,
  providers,
  rootDenomsStore,
  forceChain,
  forceNetwork,
}: SelectLSProviderProps) {
  return (
    <BottomModal isOpen={isVisible} onClose={onClose} title='Select Provider' className='p-6'>
      <div className='flex flex-col gap-y-4'>
        {providers.length === 0 && <ValidatorItemSkeleton />}
        {providers.length > 0 &&
          providers.map((provider) => (
            <div className='relative' key={provider.name}>
              {provider.priority && (
                <div className='text-white-100 dark:text-white-100 absolute top-0 right-4 px-1.5 py-0.5 bg-green-600 rounded-b-[4px] text-[10px] font-bold'>
                  Promoted
                </div>
              )}
              <ProviderCard
                provider={provider}
                backgroundColor={`${
                  provider.priority ? '!bg-[#29A87426]' : 'bg-white-100 dark:bg-gray-950'
                }`}
                rootDenomsStore={rootDenomsStore}
                activeChain={forceChain}
                activeNetwork={forceNetwork}
              />
            </div>
          ))}
      </div>
    </BottomModal>
  )
}
