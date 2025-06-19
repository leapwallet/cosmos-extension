import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CopyAddressCard } from 'components/card'
import BottomModal from 'components/new-bottom-modal'
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

  const sortedWalletAddresses = useMemo(() => {
    return walletAddresses.sort((a, b) => {
      const isEVM = a?.startsWith('0x')
      const isEVM2 = b?.startsWith('0x')
      if (isEVM && !isEVM2) return 1
      if (!isEVM && isEVM2) return -1
      return 0
    })
  }, [walletAddresses])

  const Title = useMemo(() => {
    return (
      <h3 className='flex items-center justify-center gap-2 h-10 bg-secondary-200 rounded-full px-5 py-2'>
        <img className='w-[20px] h-[20px]' src={walletAvatar} alt='wallet avatar' />

        <span
          className='text-foreground truncate text-md !leading-[22px] font-bold max-w-[196px]'
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
      headerClassName='h-[72px]'
      title={Title}
      contentClassName='[&>div:first-child>div:last-child]:-mt-[2px]'
      className='p-6'
    >
      <div
        className='flex flex-col items-center justify-start gap-4 max-h-[400px] w-full'
        style={{ overflowY: 'scroll' }}
      >
        {sortedWalletAddresses.map((address, index) => {
          return (
            <React.Fragment key={`${address}-${index}`}>
              <CopyAddressCard
                address={address}
                key={`${address}-${index}`}
                forceChain={forceChain}
              />
            </React.Fragment>
          )
        })}
      </div>
    </BottomModal>
  )
}
