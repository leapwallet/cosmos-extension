import { KeyChain } from '@leapwallet/leap-keychain'
import { Button } from 'components/ui/button'
import WalletInfoCard, { SelectWalletsLabel } from 'components/wallet-info-card'
import { OnboardingWrapper } from 'pages/onboarding/wrapper'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useImportWalletContext } from '../import-wallet-context'

export const SelectWallet = () => {
  const {
    selectedIds,
    setSelectedIds,
    moveToNextStep,
    walletAccounts = [],
    prevStep,
    currentStep,
  } = useImportWalletContext()
  const [isLoading, setIsLoading] = useState(false)
  const [existingAddresses, setExistingAddresses] = useState<string[]>([])

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        const address = wallet.addresses.cosmos
        if ((wallet as any)?.watchWallet) continue
        addresses.push(address)
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  const handleProceedClick = () => {
    setIsLoading(true)
    moveToNextStep()
  }

  const selectedCount = useMemo(() => {
    return Object.values(selectedIds).filter((val) => val).length
  }, [selectedIds])

  const handleSelectChange = useCallback(
    (id: number, flag: boolean) => {
      setSelectedIds({ ...selectedIds, [id]: flag })
    },
    [selectedIds, setSelectedIds],
  )

  const filteredWalletAccounts = useMemo(() => {
    return walletAccounts.filter(({ address }) => {
      const isExistingAddress = !!address && existingAddresses.indexOf(address) > -1
      if (isExistingAddress) {
        return false
      }
      return true
    })
  }, [walletAccounts, existingAddresses])

  return (
    <OnboardingWrapper
      heading={'Your wallets'}
      subHeading={'Select the ones you want to import'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
      className='gap-0'
    >
      <div className='gradient-overlay mt-7 flex-1'>
        <div className='flex flex-col gap-3 h-[21rem] pb-28 overflow-auto'>
          <SelectWalletsLabel
            count={selectedCount}
            total={filteredWalletAccounts.length}
            onSelectAllToggle={(flag) => {
              setSelectedIds(
                flag
                  ? Object.fromEntries(filteredWalletAccounts.map(({ index: id }) => [id, true]))
                  : Object.fromEntries(filteredWalletAccounts.map(({ index: id }) => [id, false])),
              )
            }}
          />

          {walletAccounts.map(
            ({
              address,
              index: id,
              evmAddress,
              bitcoinAddress,
              moveAddress,
              solanaAddress,
              suiAddress,
            }) => {
              const isExistingAddress = !!address && existingAddresses.indexOf(address) > -1
              const isChosen = selectedIds[id]

              return (
                <WalletInfoCard
                  key={id}
                  index={id}
                  walletName={`Wallet ${id + 1}`}
                  data-testing-id={`wallet-${id + 1}`}
                  cosmosAddress={address}
                  evmAddress={evmAddress}
                  bitcoinAddress={bitcoinAddress}
                  moveAddress={moveAddress}
                  solanaAddress={solanaAddress}
                  suiAddress={suiAddress}
                  isChosen={isChosen}
                  isExistingAddress={isExistingAddress}
                  onSelectChange={handleSelectChange}
                />
              )
            },
          )}
        </div>
      </div>

      <Button
        data-testing-id='btn-select-wallet-proceed'
        className='w-full'
        disabled={isLoading || Object.values(selectedIds).filter((val) => val).length === 0}
        onClick={handleProceedClick}
      >
        Proceed
      </Button>
    </OnboardingWrapper>
  )
}
