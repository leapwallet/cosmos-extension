import { CheckCircle } from '@phosphor-icons/react'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { CopySvg, FilledDownArrowSvg } from 'images/misc'
import React from 'react'
import { sliceWord } from 'utils/strings'

type WalletButtonProps = {
  showWalletAvatar?: boolean
  giveCopyOption?: boolean
  handleCopyClick?: () => void
  walletName: string
  showDropdown?: boolean
  handleDropdownClick?: () => void
  walletAvatar?: string
  isAddressCopied?: boolean
}

const WalletButton = React.memo(
  ({
    showWalletAvatar,
    giveCopyOption,
    handleCopyClick,
    walletName,
    showDropdown,
    handleDropdownClick,
    walletAvatar,
    isAddressCopied,
  }: WalletButtonProps) => {
    return (
      <div
        className={classNames(
          'relative bg-white-100 dark:bg-gray-950 border-[1px] border-solid flex rounded-3xl h-[36px] border-gray-100 dark:border-gray-850',
        )}
      >
        <button
          className={classNames(
            'flex items-center justify-center gap-2 py-[6px] pl-[12px] pr-[2px]',
            {
              'cursor-pointer': handleDropdownClick,
              'border-r-[1px] border-solid border-gray-100 dark:border-gray-850': giveCopyOption,
            },
          )}
          onClick={handleDropdownClick}
        >
          {showWalletAvatar ? (
            <img className='w-[16px] h-[16px]' src={walletAvatar} alt='wallet avatar' />
          ) : null}

          <span
            className='dark:text-white-100 text-black-100 truncate text-[14px] font-bold max-w-[96px] !leading-[19.6px]'
            title={walletName}
          >
            {sliceWord(walletName, 8, 0)}
          </span>

          {showDropdown ? (
            <FilledDownArrowSvg className='fill-black-100 dark:fill-white-100 mr-[4px]' />
          ) : null}
        </button>

        {giveCopyOption ? (
          <button
            className={classNames('flex items-center justify-center px-[10px] py-[8px]', {
              'cursor-pointer': handleCopyClick && !isAddressCopied,
            })}
            onClick={isAddressCopied ? undefined : handleCopyClick}
          >
            <CopySvg className='fill-black-100 dark:fill-white-100 w-[16px] h-[16px]' />
          </button>
        ) : null}

        {isAddressCopied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeIn' }}
            className='absolute flex gap-1 items-center justify-center w-full h-full bg-green-600 rounded-3xl'
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: 'easeIn', delay: 0.2 }}
            >
              <CheckCircle weight='fill' size={24} className='text-white-100' />
            </motion.div>
            <span className='text-white-100 text-[14px] font-bold'>Copied!</span>
          </motion.div>
        )}
      </div>
    )
  },
)

WalletButton.displayName = 'WalletButton'
export { WalletButton }
