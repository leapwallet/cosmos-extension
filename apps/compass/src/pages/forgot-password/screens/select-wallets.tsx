import { Button } from 'components/ui/button'
import WalletInfoCard from 'components/wallet-info-card'
import { WalletAccount } from 'hooks/onboarding/types'
import React from 'react'

import { ForgotPasswordWrapper } from './wrapper'

type SelectWalletProps = {
  readonly onProceed: () => void
  readonly accountsData: readonly WalletAccount[]
  readonly setSelectedIds: React.Dispatch<
    React.SetStateAction<{
      [k: number]: boolean
    }>
  >
  readonly selectedIds: { [id: string]: boolean }
}

function SelectWallets({
  onProceed,
  accountsData,
  selectedIds,
  setSelectedIds,
}: SelectWalletProps) {
  const canProceed = Object.values(selectedIds).some((v) => v)

  return (
    <ForgotPasswordWrapper>
      <header className='flex flex-col gap-1'>
        <span className='font-bold text-xl text-center'>Select wallets</span>

        <span className='text-secondary-foreground text-sm text-center'>
          Import your wallets to recover your account
        </span>
      </header>

      <div className='flex flex-col w-full max-h-[375px] overflow-y-auto rounded-xl gap-1.5 flex-1'>
        {accountsData.map(({ address, index: id, evmAddress, name, path }) => {
          const isChosen = selectedIds[id]

          return (
            <WalletInfoCard
              key={id}
              id={id}
              className='border-secondary-600/75 last:border-b-0 bg-secondary-100 hover:bg-secondary-200 rounded-xl transition-colors'
              address={address}
              isChosen={isChosen}
              evmAddress={evmAddress}
              isExistingAddress={false}
              showDerivationPath={false}
              name={name}
              path={path}
              onClick={() => {
                setSelectedIds((prev) => ({ ...prev, [id]: !isChosen }))
              }}
            />
          )
        })}
      </div>

      <Button
        className='w-full mt-auto'
        disabled={!canProceed}
        onClick={() => {
          if (canProceed) onProceed()
        }}
      >
        Proceed
      </Button>
    </ForgotPasswordWrapper>
  )
}

export default SelectWallets
