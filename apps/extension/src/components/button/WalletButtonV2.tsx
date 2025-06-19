import { CaretDown } from '@phosphor-icons/react'
import React from 'react'
import { cn } from 'utils/cn'
import { sliceWord } from 'utils/strings'

type WalletButtonProps = {
  showWalletAvatar?: boolean
  walletName: string
  showDropdown?: boolean
  handleDropdownClick?: () => void
  walletAvatar?: string
  className?: string
}

export const WalletButtonV2 = React.memo(
  ({
    showWalletAvatar,
    walletName,
    showDropdown,
    handleDropdownClick,
    walletAvatar,
    className,
  }: WalletButtonProps) => {
    return (
      <button
        onClick={handleDropdownClick}
        className={cn(
          'flex items-center justify-center relative bg-secondary-200 hover:bg-secondary-300 border-solid rounded-full px-3.5 py-1.5 transition-colors',
          handleDropdownClick && 'cursor-pointer',
          className,
        )}
      >
        {showWalletAvatar ? (
          <img className='size-6 mr-1 rounded-full' src={walletAvatar} alt='wallet avatar' />
        ) : null}

        <span className='truncate text-sm font-bold max-w-[96px]' title={walletName}>
          {sliceWord(walletName, 8, 0)}
        </span>

        {showDropdown ? (
          <CaretDown weight='fill' className='size-2.5 ml-1 fill-muted-foreground' />
        ) : null}
      </button>
    )
  },
)

WalletButtonV2.displayName = 'WalletButtonV2'
