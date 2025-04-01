import { KeyChain } from '@leapwallet/leap-keychain'
import { Button } from 'components/ui/button'
import WalletInfoCard from 'components/wallet-info-card'
import { WalletAccount } from 'hooks/onboarding/types'
import React, { useEffect, useState } from 'react'

import { OnboardingWrapper } from '../wrapper'
import { useImportWalletContext } from './import-wallet-context'

type SelectWalletViewProps = {
  readonly onProceed: () => void
  readonly accountsData: readonly WalletAccount[]
  readonly setSelectedIds: (val: { [id: number]: boolean }) => void
  readonly selectedIds: { [id: string]: boolean }
}

export function SelectWalletView({
  onProceed,
  accountsData,
  selectedIds,
  setSelectedIds,
}: SelectWalletViewProps) {
  const [existingAddresses, setExistingAddresses] = useState<string[]>([])
  const { currentStep, prevStep } = useImportWalletContext()

  const handleProceedClick = () => {
    if (!Object.values(selectedIds).some((val) => val)) {
      return false
    }

    onProceed()
  }

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        if ((wallet as any)?.watchWallet) continue
        addresses.push(wallet.addresses.seiTestnet2)
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  return (
    <OnboardingWrapper
      heading={'Your wallets'}
      subHeading={'Select the ones you want to import'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <div className='flex flex-col bg-secondary-200 w-full max-h-[340px] py-1 overflow-y-auto rounded-xl'>
        {accountsData.map(({ address, index: id, evmAddress, name, path }) => {
          const isExistingAddress = existingAddresses.indexOf(address) > -1
          const isChosen = selectedIds[id]

          return (
            <WalletInfoCard
              key={id}
              id={id}
              data-testing-id={id === 0 ? 'wallet-1' : ''}
              className='bg-transparent border-b border-dashed border-secondary-600/75 last:border-b-0'
              address={address}
              evmAddress={evmAddress}
              isChosen={isChosen}
              isExistingAddress={isExistingAddress}
              showDerivationPath={false}
              name={name}
              path={path}
              onClick={() => {
                if (!isExistingAddress) {
                  const copy = selectedIds

                  if (!isChosen) {
                    setSelectedIds({ ...copy, [id]: true })
                  } else {
                    setSelectedIds({ ...copy, [id]: false })
                  }
                }
              }}
            />
          )
        })}
      </div>

      <Button
        data-testing-id='btn-select-wallet-proceed'
        className='w-full mt-auto'
        disabled={Object.values(selectedIds).filter((val) => val).length === 0}
        onClick={handleProceedClick}
      >
        Proceed
      </Button>
    </OnboardingWrapper>
  )
}
