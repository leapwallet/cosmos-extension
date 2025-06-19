import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Button } from 'components/ui/button'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { LedgerDriveIcon } from 'icons/ledger-drive-icon'
import React, { useState } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import CreateImportActions from '../SelectWallet/CreateImportActions'

export const LedgerNotSupported = () => {
  const chainInfo = useChainInfo()
  const [showCreateImportActions, setShowCreateImportActions] = useState(false)

  return (
    <>
      <section className='m-6 flex h-[427px] flex-col items-center justify-center bg-secondary-100 rounded-2xl'>
        <div className='rounded-full size-16 bg-secondary-200 flex items-center justify-center'>
          <LedgerDriveIcon className='size-6' />
        </div>

        <header className='text-center mt-4 mb-8 space-y-3'>
          <h1 className='text-mdl font-bold'>Ledger not supported on {chainInfo?.chainName}</h1>
          <p className='text-xs text-secondary-800'>
            In the meanwhile, you can import your wallet using a <br /> recovery phrase or private
            key to access {chainInfo?.chainName}.
          </p>
        </header>

        <div className='px-12 w-full'>
          <Button className='w-full h-[44px]' onClick={() => setShowCreateImportActions(true)}>
            Import wallet
          </Button>
        </div>
      </section>

      <CreateImportActions
        title='Create / Import Wallet'
        isVisible={showCreateImportActions}
        onClose={() => {
          setShowCreateImportActions(false)
        }}
      />
    </>
  )
}
