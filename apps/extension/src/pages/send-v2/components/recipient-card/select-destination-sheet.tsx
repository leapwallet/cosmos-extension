import { SelectedAddress, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { isAptosChain } from '@leapwallet/cosmos-wallet-sdk'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { useSendContext } from 'pages/send-v2/context'
import React, { useEffect, useState } from 'react'

import MyContacts from './MyContacts'
import { MyEvmWalletAddresses } from './MyEvmWalletAddresses'
import MyWallets from './MyWallets'

export type DestinationType = 'My Wallets' | 'My Contacts'

type SelectDestinationSheetProps = {
  isOpenType: DestinationType | null
  onClose: () => void
  setSelectedAddress: (address: SelectedAddress) => void
  handleContactSelect: (contact: SelectedAddress) => void
  skipSupportedDestinationChainsIDs: string[]
}

export const SelectDestinationSheet: React.FC<SelectDestinationSheetProps> = ({
  isOpenType,
  onClose,
  setSelectedAddress,
  handleContactSelect,
  skipSupportedDestinationChainsIDs,
}) => {
  const [destinationType, setDestinationType] = useState<DestinationType>(
    isOpenType as DestinationType,
  )

  const { chains } = useChainsStore()
  const { sendActiveChain } = useSendContext()

  const chainData = chains[sendActiveChain]

  useEffect(() => {
    setDestinationType(isOpenType as DestinationType)
  }, [isOpenType])

  return (
    <BottomModal
      title='Select Destination'
      onClose={onClose}
      isOpen={!!isOpenType}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
    >
      <div className='w-full flex bg-gray-50 dark:bg-black-100 border-[3px] border-gray-50 dark:border-black-100 rounded-[25px] mb-6'>
        {['My Contacts', 'My Wallets'].map((type) => (
          <div
            key={type}
            className={classNames(
              'rounded-[40px] flex-1 text-center py-2 cursor-pointer text-sm font-bold transition-all duration-200',
              {
                'bg-white-100 dark:bg-gray-950 text-black-100 dark:text-white-100':
                  destinationType === type,
              },
              { 'bg-[transparent] text-gray-600 dark:text-gray-400': destinationType !== type },
            )}
            onClick={() => setDestinationType(type as DestinationType)}
          >
            {type}
          </div>
        ))}
      </div>

      <div>
        {destinationType === 'My Contacts' ? (
          <MyContacts handleContactSelect={handleContactSelect} />
        ) : chainData.evmOnlyChain || isAptosChain(chainData.key) ? (
          <MyEvmWalletAddresses chainInfo={chainData} setSelectedAddress={setSelectedAddress} />
        ) : (
          <MyWallets
            skipSupportedDestinationChainsIDs={skipSupportedDestinationChainsIDs}
            setSelectedAddress={setSelectedAddress}
          />
        )}
      </div>
    </BottomModal>
  )
}
