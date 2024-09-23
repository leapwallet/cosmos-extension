// eslint-disable-next-line simple-import-sort/imports
import { sliceWord, useActiveStakingDenom, useDualStaking } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { ValidatorItemSkeleton } from 'components/Skeletons/StakeSkeleton'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

import { StakeInputPageState } from '../StakeInputPage'
import { ProviderDelegation, Provider } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { observer } from 'mobx-react-lite'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { isSidePanel } from 'utils/isSidePanel'

interface StakedProviderDetailsProps {
  isOpen: boolean
  onClose: () => void
  onSwitchValidator: () => void
  provider?: Provider
  delegation: ProviderDelegation
  rootDenomsStore: RootDenomsStore
}

const StakedProviderDetails = observer(
  ({
    isOpen,
    onClose,
    onSwitchValidator,
    provider,
    delegation,
    rootDenomsStore,
  }: StakedProviderDetailsProps) => {
    const denoms = rootDenomsStore.allDenoms
    const [activeStakingDenom] = useActiveStakingDenom(denoms)
    const [formatCurrency] = useFormatCurrency()
    const { theme } = useTheme()
    const { formatHideBalance } = useHideAssets()

    const amountTitleText = useMemo(() => {
      if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
        return formatHideBalance(
          formatCurrency(new BigNumber(delegation.amount.currencyAmount ?? '')),
        )
      } else {
        return formatHideBalance(delegation.amount.formatted_amount ?? delegation.amount.amount)
      }
    }, [
      delegation.amount.amount,
      delegation.amount.currencyAmount,
      delegation.amount.formatted_amount,
      formatCurrency,
      formatHideBalance,
    ])

    const amountSubtitleText = useMemo(() => {
      if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
        return formatHideBalance(delegation.amount.formatted_amount ?? delegation.amount.amount)
      }
      return ''
    }, [
      delegation.amount.amount,
      delegation.amount.currencyAmount,
      delegation.amount.formatted_amount,
      formatHideBalance,
    ])

    return (
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        title='Provider Details'
        closeOnBackdropClick={true}
        className='p-6'
      >
        <div className='flex flex-col w-full gap-y-4'>
          <div className='flex w-full gap-x-2 items-center'>
            <img
              width={24}
              height={24}
              className='rounded-full'
              src={Images.Misc.Validator}
              onError={imgOnError(Images.Misc.Validator)}
            />
            <Text size='lg' color='text-black-100 dark:text-white-100' className='font-bold'>
              {sliceWord(
                provider?.moniker,
                isSidePanel()
                  ? 8 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 15,
                3,
              )}
            </Text>
          </div>
          <div className='flex w-full rounded-lg p-3 bg-white-100 dark:bg-gray-950 border  border-gray-100 dark:border-gray-850'>
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                Total Staked
              </Text>
              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                N/A
              </Text>
            </div>
            <div className='w-px h-10 bg-gray-100 dark:bg-gray-850' />
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                Commission
              </Text>
              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                N/A
              </Text>
            </div>
            <div className='w-px h-10 bg-gray-100 dark:bg-gray-850' />
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                APY
              </Text>
              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                N/A
              </Text>
            </div>
          </div>
          <div className='w-full p-4 bg-white-100 dark:bg-gray-950 rounded-lg'>
            <Text size='xs' color='text-gray-800 dark:text-gray-200' className='font-medium'>
              Your deposited amount
            </Text>
            <div className='flex gap-x-4 mt-4'>
              <img className='w-9 h-9' src={activeStakingDenom.icon} />
              <div className='flex flex-col justify-center'>
                <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                  {amountTitleText}
                </Text>
                <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                  {amountSubtitleText}
                </Text>
              </div>
            </div>
          </div>
          <Buttons.Generic
            onClick={onSwitchValidator}
            color={theme === ThemeName.DARK ? Colors.white100 : Colors.black100}
            className='w-full'
            size='normal'
          >
            <Text color='text-white-100 dark:text-black-100'>Switch provider</Text>
          </Buttons.Generic>
        </div>
      </BottomModal>
    )
  },
)

interface ProviderCardProps {
  provider: Provider
  delegation: ProviderDelegation
  onClick?: () => void
}

function ProviderCard({ provider, delegation, onClick }: ProviderCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()

  const amountTitleText = useMemo(() => {
    if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
      return formatHideBalance(
        formatCurrency(new BigNumber(delegation.amount.currencyAmount ?? '')),
      )
    } else {
      return formatHideBalance(delegation.amount.formatted_amount ?? delegation.amount.amount)
    }
  }, [
    delegation.amount.amount,
    delegation.amount.currencyAmount,
    delegation.amount.formatted_amount,
    formatCurrency,
    formatHideBalance,
  ])

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
      return formatHideBalance(delegation.amount.formatted_amount ?? delegation.amount.amount)
    }
    return ''
  }, [
    delegation.amount.amount,
    delegation.amount.currencyAmount,
    delegation.amount.formatted_amount,
    formatHideBalance,
  ])

  return (
    <div
      onClick={onClick}
      className='flex justify-between items-center px-4 py-3 bg-white-100 dark:bg-gray-950 cursor-pointer rounded-xl'
    >
      <div className='flex items-center w-full'>
        <img
          src={Images.Misc.Validator}
          onError={imgOnError(Images.Misc.Validator)}
          width={28}
          height={28}
          className='mr-4 rounded-full'
        />
        <div className='flex justify-between items-center w-full'>
          <div className='flex flex-col justify-center items-start'>
            <Text
              size='sm'
              color='text-black-100 dark:text-white-100'
              className='font-bold  overflow-hidden'
            >
              {sliceWord(
                provider?.moniker,
                isSidePanel()
                  ? 5 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                3,
              )}
            </Text>
            {provider.spec && (
              <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                {sliceWord(
                  provider.spec.charAt(0).toUpperCase() + provider.spec.slice(1).toLowerCase(),
                  isSidePanel()
                    ? 22 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 30,
                  0,
                )}
              </Text>
            )}
          </div>
          <div className='flex flex-col items-end gap-y-0.5'>
            <Text size='sm' color='text-black-100 dark:text-white-100' className='font-bold'>
              {amountTitleText}
            </Text>
            <Text size='xs' color='dark:text-gray-400 text-gray-700' className='font-medium'>
              {amountSubtitleText}
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProviderList() {
  const navigate = useNavigate()
  const [showStakedProviderDetails, setShowStakedProviderDetails] = useState(false)
  const [selectedDelegation, setSelectedDelegation] = useState<ProviderDelegation | undefined>()
  const { delegations: providerDelegations, loadingDelegations, providers } = useDualStaking()

  const emptyProviderDelegation = useMemo(() => {
    return Object.values(providerDelegations ?? {}).find((d) => d.provider === 'empty_provider')
  }, [providerDelegations])

  const sortedDelegations = useMemo(() => {
    const _sortedDelegations = Object.values(providerDelegations ?? {}).sort(
      (a, b) => parseFloat(b.amount.amount) - parseFloat(a.amount.amount),
    )
    return _sortedDelegations
  }, [providerDelegations])

  const emptyProvider = useMemo(() => {
    return {
      provider: emptyProviderDelegation?.provider ?? '',
      moniker: 'Empty Provider',
      address: emptyProviderDelegation?.provider ?? '',
      chain: emptyProviderDelegation?.chainID ?? '',
      spec: emptyProviderDelegation?.chainID ?? '',
    }
  }, [emptyProviderDelegation?.chainID, emptyProviderDelegation?.provider])

  return (
    <>
      {loadingDelegations && <ValidatorItemSkeleton />}
      <div className='flex flex-col w-full gap-y-2'>
        {!loadingDelegations && providers && sortedDelegations.length > 0 && (
          <>
            {emptyProviderDelegation && (
              <>
                <div className='flex justify-between'>
                  <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                    Empty Provider
                  </Text>
                  <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                    Amount Staked
                  </Text>
                </div>
                <ProviderCard
                  delegation={emptyProviderDelegation}
                  provider={emptyProvider}
                  onClick={() => {
                    setSelectedDelegation(emptyProviderDelegation)
                    setShowStakedProviderDetails(true)
                  }}
                />
              </>
            )}
            {sortedDelegations.length > 1 && (
              <div className='flex justify-between'>
                <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                  Provider
                </Text>
                <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                  Amount Staked
                </Text>
              </div>
            )}
            {sortedDelegations.map((d) => {
              const provider = providers?.find((el) => el.address === d.provider)
              return (
                provider && (
                  <ProviderCard
                    key={provider?.address}
                    delegation={d}
                    provider={provider}
                    onClick={() => {
                      setSelectedDelegation(d)
                      setShowStakedProviderDetails(true)
                    }}
                  />
                )
              )
            })}
          </>
        )}
      </div>
      {selectedDelegation && (
        <StakedProviderDetails
          rootDenomsStore={rootDenomsStore}
          isOpen={showStakedProviderDetails}
          onClose={() => setShowStakedProviderDetails(false)}
          provider={
            selectedDelegation.provider === emptyProviderDelegation?.provider
              ? emptyProvider
              : providers.find((p) => p.address === selectedDelegation.provider)
          }
          delegation={selectedDelegation}
          onSwitchValidator={() => {
            navigate('/stake/input', {
              state: {
                mode: 'REDELEGATE',
                fromProvider:
                  selectedDelegation.provider === emptyProviderDelegation?.provider
                    ? emptyProvider
                    : providers.find((p) => p.address === selectedDelegation.provider),
                providerDelegation: selectedDelegation,
              } as StakeInputPageState,
            })
          }}
        />
      )}
    </>
  )
}
