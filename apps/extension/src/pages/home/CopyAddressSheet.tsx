import {
  sliceAddress,
  useActiveChain,
  useChainInfo,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, CardDivider, GenericCard } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import { LoaderAnimation } from 'components/loader/Loader'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

type CopyAddressCardProps = {
  address: string
}

function CopyAddressCard({ address }: CopyAddressCardProps) {
  const activeChainInfo = useChainInfo()
  const defaultTokenLogo = useDefaultTokenLogo()
  const copyAddressRef = useRef<HTMLButtonElement>(null)

  const name = useMemo(() => {
    if (address.toLowerCase().startsWith('0x')) {
      return '0x address'
    }

    return (
      activeChainInfo.addressPrefix.slice(0, 1).toUpperCase() +
      activeChainInfo.addressPrefix.slice(1).toLowerCase() +
      ' ' +
      'address'
    )
  }, [activeChainInfo.addressPrefix, address])

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
  onClose: (refetch?: boolean) => void
  walletAddresses: string[]
}

function AssociateAddressBtn({ onClose }: { onClose: (refetch: boolean) => void }) {
  const getWallet = Wallet.useGetWallet()
  const activeChain = useActiveChain()
  const activeChainInfo = useChainInfo()
  const [error, setError] = useState<string>()
  const { addressLinkState, updateAddressLinkState } = useSeiLinkedAddressState(getWallet)

  const handleLinkAddressClick = async () => {
    await updateAddressLinkState(setError, onClose)
  }

  if (['done', 'unknown'].includes(addressLinkState)) return null
  const btnText =
    addressLinkState === 'success' ? 'Addresses linked successfully' : 'Link Addresses'

  return (
    <>
      {addressLinkState === 'error' ? <ErrorCard text={error} className='mb-4' /> : null}
      <Buttons.Generic
        color={Colors.getChainColor(activeChain, activeChainInfo)}
        size='normal'
        className='w-[344px]'
        title={btnText}
        disabled={addressLinkState === 'loading' || addressLinkState === 'success'}
        onClick={handleLinkAddressClick}
      >
        {addressLinkState === 'loading' ? <LoaderAnimation color={Colors.white100} /> : btnText}
      </Buttons.Generic>
    </>
  )
}

export function CopyAddressSheet({ isVisible, onClose, walletAddresses }: CopyAddressSheetProps) {
  const isSeiAddress = walletAddresses?.[1]?.startsWith('sei')
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
      {isSeiAddress ? <AssociateAddressBtn onClose={onClose} /> : null}
    </BottomModal>
  )
}
