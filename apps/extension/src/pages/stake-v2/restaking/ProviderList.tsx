// eslint-disable-next-line simple-import-sort/imports
import {
  sliceWord,
  useActiveChain,
  useActiveStakingDenom,
  useDualStaking,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import { ValidatorItemSkeleton } from 'components/Skeletons/StakeSkeleton'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { imgOnError } from 'utils/imgOnError'

import { Provider, ProviderDelegation, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Button } from 'components/ui/button'
import { observer } from 'mobx-react-lite'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { isSidePanel } from 'utils/isSidePanel'
import { ValidatorCardView } from '../components/ValidatorCardView'
import { StakeInputPageState } from '../StakeInputPage'

interface StakedProviderDetailsProps {
  isOpen: boolean
  onClose: () => void
  onSwitchValidator: () => void
  provider?: Provider
  delegation: ProviderDelegation
  rootDenomsStore: RootDenomsStore
  forceChain?: SupportedChain
  forceNetwork?: 'mainnet' | 'testnet'
}

const StakedProviderDetails = observer(
  ({
    isOpen,
    onClose,
    onSwitchValidator,
    provider,
    delegation,
    rootDenomsStore,
    forceChain,
    forceNetwork,
  }: StakedProviderDetailsProps) => {
    const denoms = rootDenomsStore.allDenoms
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const [formatCurrency] = useFormatCurrency()
    const { theme } = useTheme()

    const amountTitleText = useMemo(() => {
      if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
        return hideAssetsStore.formatHideBalance(
          formatCurrency(new BigNumber(delegation.amount.currencyAmount ?? '')),
        )
      } else {
        return hideAssetsStore.formatHideBalance(
          delegation.amount.formatted_amount ?? delegation.amount.amount,
        )
      }
    }, [
      delegation.amount.amount,
      delegation.amount.currencyAmount,
      delegation.amount.formatted_amount,
      formatCurrency,
    ])

    const amountSubtitleText = useMemo(() => {
      if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
        return hideAssetsStore.formatHideBalance(
          delegation.amount.formatted_amount ?? delegation.amount.amount,
        )
      }
      return ''
    }, [
      delegation.amount.amount,
      delegation.amount.currencyAmount,
      delegation.amount.formatted_amount,
    ])

    return (
      <BottomModal
        fullScreen
        isOpen={isOpen}
        onClose={onClose}
        title='Provider Details'
        className='!p-0 relative h-full'
        headerClassName='border-secondary-200 border-b'
      >
        <div className='p-6 pt-8 px-6 flex flex-col gap-4 h-[calc(100%-84px)] overflow-y-scroll'>
          <div className='flex w-full gap-4 items-center'>
            <img
              width={40}
              height={40}
              className='rounded-full'
              src={provider?.image || Images.Misc.Validator}
              onError={imgOnError(Images.Misc.Validator)}
            />

            <span className='font-bold text-lg'>
              {sliceWord(
                provider?.moniker ?? '',
                isSidePanel()
                  ? 18 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                3,
              )}
            </span>
          </div>

          <div className='flex flex-col gap-4 p-6 bg-secondary-100 rounded-xl'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Total Staked</span>
              <span className='font-bold text-sm'>N/A</span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Commission</span>
              <span className='font-bold text-sm'>N/A</span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>APR</span>
              <span className='font-bold text-sm text-accent-success'>N/A</span>
            </div>
          </div>

          <span className='text-sm text-muted-foreground mt-4'>Your deposited amount</span>
          <div className='p-6 bg-secondary-100 rounded-xl'>
            <span className='font-bold text-lg'>{amountTitleText} </span>
            {amountSubtitleText && (
              <span className='text-muted-foreground'>({amountSubtitleText})</span>
            )}
          </div>
        </div>

        <div className='flex gap-x-3 bg-secondary-200 w-full [&>*]:flex-1 mt-auto absolute bottom-0 py-4 px-5'>
          <Button onClick={onSwitchValidator}>Switch provider</Button>
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

const ProviderCard = observer(({ provider, delegation, onClick }: ProviderCardProps) => {
  const [formatCurrency] = useFormatCurrency()

  const amountTitleText = useMemo(() => {
    if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(
        formatCurrency(new BigNumber(delegation.amount.currencyAmount ?? '')),
      )
    } else {
      return hideAssetsStore.formatHideBalance(
        delegation.amount.formatted_amount ?? delegation.amount.amount,
      )
    }
  }, [
    delegation.amount.amount,
    delegation.amount.currencyAmount,
    delegation.amount.formatted_amount,
    formatCurrency,
  ])

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(delegation.amount.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(
        delegation.amount.formatted_amount ?? delegation.amount.amount,
      )
    }
    return ''
  }, [
    delegation.amount.amount,
    delegation.amount.currencyAmount,
    delegation.amount.formatted_amount,
  ])

  return (
    <ValidatorCardView
      onClick={onClick}
      imgSrc={Images.Misc.Validator}
      moniker={provider.moniker ?? ''}
      titleAmount={amountTitleText}
      subAmount={amountSubtitleText}
      jailed={false}
    />
  )
})

export default function ProviderList({
  forceChain,
  forceNetwork,
}: {
  forceChain?: SupportedChain
  forceNetwork?: 'mainnet' | 'testnet'
}) {
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
      specs: [],
    }
  }, [emptyProviderDelegation?.provider])

  return (
    <>
      {loadingDelegations && <ValidatorItemSkeleton />}
      <div className='flex flex-col w-full gap-y-2'>
        {!loadingDelegations && providers && sortedDelegations.length > 0 && (
          <>
            {emptyProviderDelegation && (
              <>
                <div className='flex justify-between'>
                  <span className='text-xs text-muted-foreground'>Empty Provider</span>
                  <span className='text-xs text-muted-foreground'>Amount Staked</span>
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
                <span className='text-xs text-muted-foreground'>Provider</span>
                <span className='text-xs text-muted-foreground'>Amount Staked</span>
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
            const state: StakeInputPageState = {
              mode: 'REDELEGATE',
              fromProvider:
                selectedDelegation.provider === emptyProviderDelegation?.provider
                  ? emptyProvider
                  : providers.find((p) => p.address === selectedDelegation.provider),
              providerDelegation: selectedDelegation,
              forceChain: 'lava',
            }
            sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state))
            navigate('/stake/input', {
              state,
            })
          }}
          forceChain={forceChain}
          forceNetwork={forceNetwork}
        />
      )}
    </>
  )
}
