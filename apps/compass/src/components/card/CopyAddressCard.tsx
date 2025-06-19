import { sliceAddress, useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Check } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useDefaultTokenLogo } from 'hooks'
import { CopyIcon } from 'icons/copy-icon'
import React, { useCallback, useMemo, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'
import { transition150 } from 'utils/motion-variants'

type CopyAddressCardProps = {
  forceChain?: SupportedChain
  address: string
  differentIconButtonOnClick?: () => void
  forceName?: string
}

const copyVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
}

const CopyAddressCard = React.memo(({ forceChain, address, forceName }: CopyAddressCardProps) => {
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
    <div className='bg-secondary-100 rounded-2xl flex items-center justify-between py-3 px-4 w-full'>
      <div className='flex items-center justify-start gap-3 w-[150px] flex-1'>
        <img
          className='size-10'
          src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
          alt={activeChainInfo.chainName + ' logo'}
          onError={imgOnError(defaultTokenLogo)}
        />

        <div className='flex flex-col'>
          <p className='font-[700] text-[16px]'>{name}</p>
          <p className='text-muted-foreground  font-medium text-xs'>
            {address.includes(', ') ? address : sliceAddress(address, 5)}
          </p>
        </div>
      </div>

      <AnimatePresence mode='wait'>
        <Button
          key={isCopied ? 'copied' : 'copy'}
          variant={'ghost'}
          size='iconSm'
          onClick={isCopied ? undefined : handleCopyClick}
          title={isCopied ? 'Copied' : 'Copy'}
        >
          <motion.span
            variants={copyVariants}
            transition={transition150}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            {isCopied ? (
              <Check className='size-4 text-accent-blue-200' />
            ) : (
              <CopyIcon className='size-4' />
            )}
          </motion.span>
        </Button>
      </AnimatePresence>
    </div>
  )
})

CopyAddressCard.displayName = 'CopyAddressCard'
export { CopyAddressCard }
