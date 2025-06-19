import { KeyChain } from '@leapwallet/leap-keychain'
import { CaretRight } from '@phosphor-icons/react'
import { WalletInfoCardSkeletons } from 'components/Skeletons'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import WalletInfoCard from 'components/wallet-info-card'
import { WalletAccount } from 'hooks/onboarding/types'
import React, { useEffect, useState } from 'react'
import { cn } from 'utils/cn'

import { OnboardingWrapper } from '../wrapper'
import { useImportWalletContext } from './import-wallet-context'
import LedgerAdvancedMode from './LedgerAdvancedMode'

type SelectWalletViewProps = {
  readonly onProceed: () => void
  readonly accountsData: readonly WalletAccount[] | undefined
  readonly customAccountsData: readonly WalletAccount[] | undefined
  readonly setSelectedIds: (val: { [id: number]: boolean }) => void
  readonly selectedIds: { [id: string]: boolean }
  getLedgerAccountDetailsForIdxs: (idxs: number[]) => Promise<void>
  getCustomLedgerAccountDetails: (
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => Promise<void>
}

export default function SelectLedgerWalletView({
  onProceed,
  accountsData,
  customAccountsData,
  selectedIds,
  setSelectedIds,
  getLedgerAccountDetailsForIdxs,
  getCustomLedgerAccountDetails,
}: SelectWalletViewProps) {
  const { prevStep, currentStep, selectedApp } = useImportWalletContext()
  const [isLoading, setIsLoading] = useState(false)
  const [existingAddresses, setExistingAddresses] = useState<string[]>([])
  const [isAdvanceModeEnabled, setIsAdvanceModeEnabled] = useState<boolean>(false)
  const hasCustomAccounts = !!customAccountsData && customAccountsData.length > 0

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        addresses.push(wallet.addresses.seiTestnet2)
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  useEffect(() => {
    const fetchMoreWallets = document.getElementById('fetch-more-wallets')
    if (!fetchMoreWallets) return

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        const idxs = [0, 1, 2, 3, 4].map((_, index) => {
          return (accountsData ?? []).length + index
        })

        getLedgerAccountDetailsForIdxs(idxs)
      }
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    })

    observer.observe(fetchMoreWallets)
    return () => observer.disconnect()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsData?.length])

  const validate = () => {
    if (!Object.values(selectedIds).some((val) => val)) {
      return false
    }

    return true
  }

  const handleProceedClick = () => {
    setIsLoading(true)
    if (validate()) onProceed()
  }

  const handleAdvancedSettingsClick = () => {
    setIsAdvanceModeEnabled(true)
  }

  return (
    <OnboardingWrapper
      heading='Your wallets'
      subHeading='Select the wallets you want to import'
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <div className='flex flex-col bg-secondary-200 w-full max-h-[280px] py-1 overflow-y-auto rounded-xl'>
        {hasCustomAccounts ? (
          <div className='pt-5 pl-5'>
            <Text size='sm' className='font-medium' color='text-muted-foreground'>
              Custom derivation path
            </Text>
          </div>
        ) : null}

        {customAccountsData?.map(({ address, index: id, evmAddress, path, name }, index) => {
          const isExistingAddress = existingAddresses.indexOf(address) > -1
          const isChosen = selectedIds[path ?? id]

          return (
            <WalletInfoCard
              key={`custom-${path}-${id}`}
              id={id}
              path={path}
              data-testing-id={id === 0 ? 'custom-wallet-1' : ''}
              address={address}
              isChosen={isChosen}
              evmAddress={evmAddress}
              className={cn('bg-transparent border-b border-dashed border-secondary-600/75', {
                'border-b-0': index === customAccountsData.length - 1,
              })}
              isExistingAddress={isExistingAddress}
              showDerivationPath={hasCustomAccounts}
              name={name}
              onClick={() => {
                if (!isExistingAddress) {
                  const copy = selectedIds
                  if (!isChosen) {
                    setSelectedIds({ ...copy, [path ?? id]: true })
                  } else {
                    setSelectedIds({ ...copy, [path ?? id]: false })
                  }
                }
              }}
            />
          )
        })}

        {hasCustomAccounts ? (
          <div className='pt-6 pl-5 border-t-[0.5px] border-secondary-600/75'>
            <Text size='sm' className='font-medium' color='text-muted-foreground'>
              Default wallets
            </Text>
          </div>
        ) : null}

        {accountsData?.map(({ address, index: id, evmAddress, path, name }) => {
          const isExistingAddress = existingAddresses.indexOf(address) > -1
          const isChosen = selectedIds[path ?? id]
          return (
            <WalletInfoCard
              key={`${path}-${id}`}
              id={id}
              path={path}
              data-testing-id={id === 0 ? 'wallet-1' : ''}
              address={address}
              isChosen={isChosen}
              evmAddress={evmAddress}
              className='bg-transparent border-b border-dashed border-secondary-600/75 last:border-b-0'
              isExistingAddress={isExistingAddress}
              showDerivationPath={hasCustomAccounts}
              name={name}
              onClick={() => {
                if (!isExistingAddress) {
                  const copy = selectedIds
                  if (!isChosen) {
                    setSelectedIds({ ...copy, [path ?? id]: true })
                  } else {
                    setSelectedIds({ ...copy, [path ?? id]: false })
                  }
                }
              }}
            />
          )
        })}

        <WalletInfoCardSkeletons
          count={2}
          id='fetch-more-wallets'
          cardClassName='bg-transparent border-b border-dashed border-secondary-600/75 last:border-b-0'
        />
      </div>

      <Button
        className='w-full mt-auto'
        data-testing-id='btn-select-wallet-proceed'
        disabled={isLoading || Object.values(selectedIds).filter((val) => val).length === 0}
        onClick={handleProceedClick}
      >
        Add selected wallets
      </Button>

      <button
        className='flex w-fill items-center justify-center gap-1 text-sm font-medium hover:text-accent-blue-200 text-accent-foreground transition-colors'
        onClick={handleAdvancedSettingsClick}
      >
        Advanced settings
        <CaretRight className='h-[16px]' />
      </button>
      <LedgerAdvancedMode
        isAdvanceModeEnabled={isAdvanceModeEnabled}
        setIsAdvanceModeEnabled={setIsAdvanceModeEnabled}
        existingAddresses={existingAddresses}
        getCustomLedgerAccountDetails={getCustomLedgerAccountDetails}
        setSelectedIds={setSelectedIds}
        selectedIds={selectedIds}
        selectedApp={selectedApp}
      />
    </OnboardingWrapper>
  )
}
