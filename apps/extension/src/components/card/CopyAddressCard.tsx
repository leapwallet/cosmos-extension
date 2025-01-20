import { sliceAddress, useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import classNames from 'classnames'
import { useDefaultTokenLogo } from 'hooks'
import { CopySvg, OutlinRoundGreenCheckSvg } from 'images/misc'
import React, { ReactNode, useCallback, useMemo, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'

type CopyAddressCardProps = {
  forceChain?: SupportedChain
  address: string
  showDifferentIconForButton?: boolean
  DifferentIconToShow?: ReactNode
  differentIconButtonClassName?: string
  differentIconButtonOnClick?: () => void
  forceName?: string
}

const CopyAddressCard = React.memo(
  ({
    forceChain,
    address,
    showDifferentIconForButton,
    DifferentIconToShow,
    differentIconButtonClassName,
    differentIconButtonOnClick,
    forceName,
  }: CopyAddressCardProps) => {
    const chains = useGetChains()
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const activeChainInfo = chains[activeChain]
    const defaultTokenLogo = useDefaultTokenLogo()
    const [isCopied, setIsCopied] = useState(false)

    const name = useMemo(() => {
      if (forceName) {
        return forceName
      }

      let _name =
        activeChainInfo.addressPrefix.slice(0, 1).toUpperCase() +
        activeChainInfo.addressPrefix.slice(1).toLowerCase()

      if (address.toLowerCase().startsWith('0x')) {
        _name = 'EVM'
      }

      return _name + ' ' + 'address'
    }, [activeChainInfo.addressPrefix, address, forceName])

    const handleCopyClick = useCallback(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)

      UserClipboard.copyText(address)
    }, [address])

    return (
      <div className='bg-white-100 dark:bg-gray-950 rounded-xl flex items-center justify-between p-[12px] w-full'>
        <div className='flex items-center justify-start gap-3 w-[150px] flex-1'>
          <img
            className='w-[32px] h-[32px]'
            src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            alt={activeChainInfo.chainName + ' logo'}
            onError={imgOnError(defaultTokenLogo)}
          />

          <div className='flex flex-col'>
            <p className='text-black-100 dark:text-white-100 font-[700] text-[16px]'>{name}</p>
            <p className='text-gray-600 dark:text-gray-400 text-[14px] font-[500]'>
              {address.includes(', ') ? address : sliceAddress(address, 5)}
            </p>
          </div>
        </div>

        {showDifferentIconForButton ? (
          <button
            onClick={differentIconButtonOnClick}
            className={classNames(
              'w-[36px] h-[36px] rounded-full bg-gray-100 dark:bg-gray-850 flex items-center justify-center',
              differentIconButtonClassName,
            )}
          >
            {DifferentIconToShow}
          </button>
        ) : (
          <button
            className={classNames(
              'w-[36px] h-[36px] rounded-full bg-gray-100 dark:bg-gray-850 flex items-center justify-center',
              {
                'cursor-pointer': !isCopied,
              },
            )}
            onClick={isCopied ? undefined : handleCopyClick}
          >
            {isCopied ? (
              <OutlinRoundGreenCheckSvg className='w-[16px] h-[16px]' />
            ) : (
              <CopySvg className='fill-black-100 dark:fill-white-100 w-[16px] h-[16px]' />
            )}
          </button>
        )}
      </div>
    )
  },
)

CopyAddressCard.displayName = 'CopyAddressCard'
export { CopyAddressCard }
