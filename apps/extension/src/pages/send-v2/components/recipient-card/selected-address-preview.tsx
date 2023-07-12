import { SelectedAddress } from '@leapwallet/cosmos-wallet-hooks'
import { Avatar } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useState } from 'react'
import { imgOnError } from 'utils/imgOnError'

import WalletDetailsSheet from '../wallet-details-sheet'

type SelectedAddressPreviewProps = {
  selectedAddress: SelectedAddress
  showEditMenu: boolean
  onDelete: () => void
}

export const SelectedAddressPreview: React.FC<SelectedAddressPreviewProps> = ({
  selectedAddress,
  showEditMenu,
  onDelete,
}) => {
  const defaultTokenLogo = useDefaultTokenLogo()
  const [showContactDetailsSheet, setShowContactDetailsSheet] = useState(false)

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setShowContactDetailsSheet(true)
  }

  return (
    <>
      <div
        className='flex items-center'
        title={`${selectedAddress.chainName}: ${selectedAddress.address}`}
      >
        <Avatar
          size='sm'
          avatarImage={selectedAddress.avatarIcon ?? defaultTokenLogo}
          avatarOnError={imgOnError(defaultTokenLogo)}
          emoji={selectedAddress.emoji}
          chainIcon={
            selectedAddress.avatarIcon === selectedAddress.chainIcon
              ? undefined
              : selectedAddress.chainIcon
          }
          className='bg-gray-200 dark:bg-gray-800 !h-8 !w-8'
        />
        <Text size='md' className='text-gray-800 dark:text-gray-200 ml-2'>
          {selectedAddress.name}
        </Text>
        {showEditMenu ? (
          <button onClick={handleClick} className='ml-auto'>
            <img src={Images.Misc.Menu} alt='Menu' className='ml-auto' />
          </button>
        ) : null}
      </div>
      <WalletDetailsSheet
        isOpen={showEditMenu && showContactDetailsSheet}
        selectedAddress={selectedAddress}
        onDelete={onDelete}
        onCloseHandler={() => setShowContactDetailsSheet(false)}
      />
    </>
  )
}
