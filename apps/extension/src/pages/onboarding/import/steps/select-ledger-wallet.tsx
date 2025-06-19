import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { Button } from 'components/ui/button'
import WalletInfoCard from 'components/wallet-info-card'
import { OnboardingWrapper } from 'pages/onboarding/wrapper'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from 'utils/cn'

import { LEDGER_NETWORK, useImportWalletContext } from '../import-wallet-context'

export const SelectLedgerWallet = () => {
  const {
    prevStep,
    currentStep,
    selectedIds,
    setSelectedIds,
    moveToNextStep,
    addresses,
    ledgerNetworks,
  } = useImportWalletContext()

  const [existingAddresses, setExistingAddresses] = useState<string[]>([])

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        const address = wallet?.addresses?.cosmos
        if (address) {
          addresses.push(address)
        }
        const evmPubKey = wallet?.pubKeys?.ethereum
        const evmAddress = evmPubKey
          ? pubKeyToEvmAddressToShow(evmPubKey, true) || undefined
          : undefined
        if (evmAddress) {
          addresses.push(evmAddress)
        }
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  const handleSelectChange = useCallback(
    (id: number, flag: boolean) => {
      setSelectedIds((prevSelectedIds) => ({ ...(prevSelectedIds ?? {}), [id]: flag }))
    },
    [setSelectedIds],
  )

  const proceedButtonEnabled = useMemo(() => {
    const isCosmosAppSelected = ledgerNetworks.has(LEDGER_NETWORK.COSMOS)
    const isEvmAppSelected = ledgerNetworks.has(LEDGER_NETWORK.ETH)
    // check if atleast one of the selected wallets is not already in the existing addresses
    return Object.entries(selectedIds ?? {}).some(([key, val]) => {
      if (!val) return false
      const cosmosAddress = addresses?.[key]?.cosmos?.address
      const evmPubKey = addresses?.[key]?.ethereum?.pubKey
      const evmAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : undefined
      const cosmosAddressExists = cosmosAddress ? existingAddresses.includes(cosmosAddress) : false
      const evmAddressExists = evmAddress ? existingAddresses.includes(evmAddress) : false
      if (isCosmosAppSelected && isEvmAppSelected) {
        return !cosmosAddressExists && !evmAddressExists
      }
      if (isCosmosAppSelected && !cosmosAddressExists) {
        return true
      }
      if (isEvmAppSelected && !evmAddressExists) {
        return true
      }
      return false
    })
  }, [ledgerNetworks, selectedIds, addresses, existingAddresses])

  const multiEcosystemImportNote = useMemo(() => {
    const bothNetworksSelected = ledgerNetworks.size === 2
    if (!bothNetworksSelected) return false

    return Object.entries(selectedIds ?? {}).some(([key, val]) => {
      if (!val) return false
      const cosmosAddress = addresses?.[key]?.cosmos?.address
      const evmPubKey = addresses?.[key]?.ethereum?.pubKey
      const evmAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : undefined
      const cosmosAddressExists = cosmosAddress ? existingAddresses.includes(cosmosAddress) : false
      const evmAddressExists = evmAddress ? existingAddresses.includes(evmAddress) : false
      if (!cosmosAddressExists && evmAddressExists) {
        return true
      }
      if (cosmosAddressExists && !evmAddressExists) {
        return true
      }
      return false
    })
  }, [ledgerNetworks.size, selectedIds, addresses, existingAddresses])

  return (
    <OnboardingWrapper
      heading={'Your wallets'}
      subHeading={'Select the ones you want to import'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <div className={'gradient-overlay'}>
        <div
          className={cn(
            'flex flex-col w-full py-1 overflow-y-auto',
            !multiEcosystemImportNote ? 'max-h-[330px]' : 'max-h-[299px]',
          )}
        >
          <div className='flex flex-col gap-4 pb-28'>
            {Object.entries(addresses ?? {}).map(([path, value], index) => {
              let address
              let isExistingCosmosAddress = false
              if (ledgerNetworks.has(LEDGER_NETWORK.COSMOS)) {
                address = value?.cosmos?.address
                if (address) {
                  isExistingCosmosAddress = existingAddresses.indexOf(address) > -1
                }
              }
              let evmAddress
              let isExistingEvmAddress = false
              if (ledgerNetworks.has(LEDGER_NETWORK.ETH)) {
                const evmPubKey = value?.ethereum?.pubKey
                evmAddress = pubKeyToEvmAddressToShow(evmPubKey, true) || undefined
                if (evmAddress) {
                  isExistingEvmAddress = existingAddresses.indexOf(evmAddress) > -1
                }
              }
              const isChosen = selectedIds[path]
              return (
                <WalletInfoCard
                  key={path}
                  index={index}
                  path={path}
                  data-testing-id={`wallet-${index + 1}`}
                  walletName={`Wallet ${index + 1}`}
                  cosmosAddress={address}
                  evmAddress={evmAddress}
                  isChosen={isChosen || isExistingCosmosAddress || isExistingEvmAddress}
                  isExistingAddress={isExistingCosmosAddress || isExistingEvmAddress}
                  onSelectChange={handleSelectChange}
                  isLedger
                  showDerivationPath
                />
              )
            })}
          </div>
        </div>
      </div>

      <div className='flex flex-col items-center mt-auto w-full'>
        <Button
          className='w-full'
          disabled={!proceedButtonEnabled}
          data-testing-id='btn-select-wallet-proceed'
          onClick={moveToNextStep}
        >
          Add selected wallets
        </Button>
        {multiEcosystemImportNote && (
          <div className='mt-3 text-muted-foreground text-xs !leading-[19px] text-center'>
            All addresses for the EVM & Cosmos network will be imported.
          </div>
        )}
      </div>
    </OnboardingWrapper>
  )
}
