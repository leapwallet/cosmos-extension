import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import React from 'react'

import { CopyAddressCard } from '.'

type CopyAddressSheetProps = {
  isVisible: boolean
  onClose: (refetch?: boolean) => void
  walletAddresses: string[]
}

export function CopyAddressSheet({ isVisible, onClose, walletAddresses }: CopyAddressSheetProps) {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      closeOnBackdropClick={true}
      title='Copy Address'
    >
      <div
        className='bg-white-100 dark:bg-gray-900 rounded-2xl max-h-[400px] w-full mb-5'
        style={{ overflowY: 'scroll' }}
      >
        {walletAddresses.map((address, index, array) => {
          const isLast = index === array.length - 1

          return (
            <React.Fragment key={`${address}-${index}`}>
              <CopyAddressCard address={address} />
              {!isLast && <CardDivider />}
            </React.Fragment>
          )
        })}
      </div>
    </BottomModal>
  )
}
