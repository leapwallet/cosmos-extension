import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { Images } from 'images'
import React, { MouseEventHandler, useState } from 'react'

type EthCopyWalletAddressProps = {
  readonly type?: 'button' | 'submit' | 'reset'
  readonly walletAddresses?: string[]
  readonly onCopy?: () => void
  readonly color: string
  readonly textOnCopied?: string
  readonly className?: string
  readonly copyIcon?: string
  readonly onTextClick?: () => void
}

export function EthCopyWalletAddress({
  type,
  walletAddresses,
  color,
  onCopy,
  textOnCopied = 'Copied',
  copyIcon,
  className,
  onTextClick,
  ...rest
}: EthCopyWalletAddressProps) {
  const [copied, setCopied] = useState(false)

  const text = copied ? textOnCopied : walletAddresses?.[0] ?? ''
  const copyIconSrc: string =
    useTheme().theme === ThemeName.DARK ? Images.Misc.CopyGray200 : Images.Misc.CopyGray600

  const handleClick: MouseEventHandler<HTMLDivElement | HTMLButtonElement> = async (event) => {
    onTextClick && event.stopPropagation()

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    onCopy && (await onCopy())
  }

  const handleTextClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (onTextClick) {
      event.stopPropagation()
      onTextClick()
    }
  }

  return (
    <button
      style={copied ? { backgroundColor: color } : {}}
      className={classNames(
        'relative font-Satoshi14px text-[14px] leading-[20px] py-[8px] cursor-pointer',
        {
          'text-white-100 font-bold rounded-[56px] pl-[21px] pr-[25px]': copied,
          'text-gray-600 dark:text-gray-200 bg-white-100 dark:bg-gray-900 rounded-[30px] pl-4 pr-3':
            !copied,
        },
        className,
      )}
      onClick={onTextClick ? undefined : handleClick}
      type={type ?? 'button'}
      {...rest}
    >
      <div className='flex justify-center items-center'>
        {copied && (
          <div className='block'>
            <Images.Misc.CopiedSvg fill='white' height='18' width='18' />
          </div>
        )}

        <div
          className={classNames('block', { 'mr-[10.33px]': !copied, 'ml-[5.67px]': copied })}
          onClick={handleTextClick}
        >
          {text}

          {(walletAddresses?.length ?? 1) > 1 && !copied ? (
            <span className='ml-[5px] -mr-[5px] bg-gray-100 dark:bg-gray-800 text-[12px] py-[3px] px-[5px] rounded-full'>
              +{(walletAddresses?.length ?? 1) - 1}
            </span>
          ) : null}
        </div>

        {!copied && (
          <div className='block' onClick={onTextClick ? handleClick : undefined}>
            <img alt='Copy' src={copyIcon ?? copyIconSrc} />
          </div>
        )}
      </div>
    </button>
  )
}
