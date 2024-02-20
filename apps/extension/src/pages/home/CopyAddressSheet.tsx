import { sliceAddress, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, CardDivider, GenericCard } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useRef } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

type CopyAddressCardProps = {
  address: string
}

function CopyAddressCard({ address }: CopyAddressCardProps) {
  const activeChainInfo = useChainInfo()
  const name =
    activeChainInfo.key.slice(0, 1).toUpperCase() + activeChainInfo.key.slice(1).toLowerCase()
  const defaultTokenLogo = useDefaultTokenLogo()
  const copyAddressRef = useRef<HTMLButtonElement>(null)

  return (
    <GenericCard
      title={name}
      img={
        <img
          className='mr-3 w-[30px] h-[30px]'
          src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
        />
      }
      subtitle={sliceAddress(address, 8)}
      onClick={() => {
        copyAddressRef.current?.click()
        UserClipboard.copyText(address)
      }}
      size='md'
      className='px-4 py-2'
      icon={
        <Buttons.CopyWalletAddress
          copyIcon={Images.Activity.Copy}
          ref={copyAddressRef}
          color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
        />
      }
    />
  )
}

type CopyAddressSheetProps = {
  isVisible: boolean
  onClose: () => void
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
        className='bg-white-100 dark:bg-gray-900 rounded-2xl max-h-[400px] w-full'
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
