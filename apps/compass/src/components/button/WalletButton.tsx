import { FilledDownArrowSvg } from 'images/misc'
import React from 'react'
import { cn } from 'utils/cn'

type WalletButtonProps = {
  showWalletAvatar?: boolean
  walletName: string
  showDropdown?: boolean
  handleDropdownClick?: () => void
  walletAvatar?: string | React.ReactNode
  className?: string
}

const WalletButton = ({
  showWalletAvatar,
  walletName,
  showDropdown,
  handleDropdownClick,
  walletAvatar,
  className,
}: WalletButtonProps) => {
  return (
    <button
      className={cn(
        'relative px-4 py-2 bg-secondary-100 hover:bg-secondary-200 transition-colors flex items-center justify-center gap-1.5 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
        className,
      )}
      onClick={handleDropdownClick}
    >
      {showWalletAvatar && walletAvatar ? (
        typeof walletAvatar === 'string' ? (
          <img className='size-5' src={walletAvatar} alt='wallet avatar' />
        ) : (
          walletAvatar
        )
      ) : null}

      <span className='truncate text-sm font-bold leading-6 flex-1 max-w-32' title={walletName}>
        {walletName}
      </span>

      {showDropdown ? (
        <FilledDownArrowSvg className='fill-muted-foreground size-2 shrink-0 ml-1' />
      ) : null}
    </button>
  )
}

WalletButton.displayName = 'WalletButton'
export { WalletButton }
