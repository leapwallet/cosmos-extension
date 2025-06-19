import { sliceAddress, useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Check } from '@phosphor-icons/react'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useDefaultTokenLogo } from 'hooks'
import { CopySvg } from 'images/misc'
import React, { ReactNode, useCallback, useMemo, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'
import { scaleInOut, transition200 } from 'utils/motion-variants/global-layout-motions'

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

      let _name = activeChainInfo?.chainName

      if (address.toLowerCase().startsWith('0x')) {
        _name = `${_name} (EVM)`
      }

      return _name
    }, [activeChainInfo?.chainName, address, forceName])

    const handleCopyClick = useCallback(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)

      UserClipboard.copyText(address)
    }, [address])

    return (
      <div className='rounded-xl flex items-center justify-between w-full bg-secondary-100 px-4 py-3'>
        <div className='flex items-center justify-start gap-3 w-[150px] flex-1'>
          <img
            className='w-[32px] h-[32px]'
            src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            alt={activeChainInfo.chainName + ' logo'}
            onError={imgOnError(defaultTokenLogo)}
          />

          <div className='flex flex-col gap-[2px] items-start justify-center'>
            <p className='text-foreground font-bold text-md !leading-[22px]'>{name}</p>
            <p className='text-secondary-800 font-medium text-xs !leading-[19px]'>
              {address.includes(', ') ? address : sliceAddress(address, 5)}
            </p>
          </div>
        </div>

        {showDifferentIconForButton ? (
          <button
            onClick={differentIconButtonOnClick}
            className={classNames(
              'w-[36px] h-[36px] rounded-full bg-secondary-200 flex items-center justify-center',
              differentIconButtonClassName,
            )}
          >
            {DifferentIconToShow}
          </button>
        ) : (
          <button
            className={classNames(
              'w-[36px] h-[36px] rounded-full flex transition-all duration-200 items-center justify-center border',
              {
                'cursor-pointer bg-secondary-200 border-secondary-200': !isCopied,
                'bg-accent-green/10 border-accent-green/40': isCopied,
              },
            )}
            onClick={isCopied ? undefined : handleCopyClick}
          >
            <AnimatePresence mode='popLayout' initial={false}>
              {isCopied ? (
                <motion.div
                  key='copied'
                  transition={transition200}
                  variants={scaleInOut}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  <Check className='size-4 text-accent-success' />
                </motion.div>
              ) : (
                <motion.div
                  key='copy'
                  transition={transition200}
                  variants={scaleInOut}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  <CopySvg className='size-4 text-muted-foreground' />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    )
  },
)

CopyAddressCard.displayName = 'CopyAddressCard'
export { CopyAddressCard }
