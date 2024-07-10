import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import { CopyAddressCard } from 'components/card'
import { useWalletInfo } from 'hooks'
import React, { useMemo } from 'react'

type CopyAddressSheetProps = {
  isVisible: boolean
  onClose: (refetch?: boolean) => void
  walletAddresses: string[]
  forceChain?: SupportedChain
}

export function CopyAddressSheet({
  isVisible,
  onClose,
  walletAddresses,
  forceChain,
}: CopyAddressSheetProps) {
  const { walletAvatar, walletName } = useWalletInfo()

  const Title = useMemo(() => {
    return (
      <h3 className='flex items-center justify-center gap-2'>
        <img className='w-[20px] h-[20px]' src={walletAvatar} alt='wallet avatar' />

        <span
          className='dark:text-white-100 text-black-100 truncate text-[18px] font-bold max-w-[196px]'
          title={walletName}
        >
          {walletName}
        </span>
      </h3>
    )
  }, [walletAvatar, walletName])

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      closeOnBackdropClick={true}
      titleComponent={Title}
      title=''
      contentClassName='[&>div:first-child>div:last-child]:-mt-[2px]'
    >
      <div
        className='flex flex-col items-center justif-center gap-4 max-h-[400px] w-full'
        style={{ overflowY: 'scroll' }}
      >
        {walletAddresses.map((address, index) => (
          <CopyAddressCard address={address} key={`${address}-${index}`} forceChain={forceChain} />
        ))}
      </div>
    </BottomModal>
  )
}
