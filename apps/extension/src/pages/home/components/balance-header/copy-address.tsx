import { sliceAddress, useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { Check } from '@phosphor-icons/react'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { useQueryParams } from 'hooks/useQuery'
import { CopyIcon } from 'icons/copy-icon'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { cn } from 'utils/cn'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'
import { queryParams } from 'utils/query-params'

export const CopyAddress = observer(() => {
  const activeChain = useActiveChain()
  const activeWallet = useActiveWallet()
  const walletAddresses = useGetWalletAddresses()

  const query = useQueryParams()

  const [isWalletAddressCopied, setIsWalletAddressCopied] = useState(false)

  const showCopySheet =
    walletAddresses?.length > 1 || (activeChain as string) === AGGREGATED_CHAIN_KEY

  const address = useMemo(() => {
    if (!activeWallet || !walletAddresses?.[0] || showCopySheet) {
      return 'copy address'
    }

    return sliceAddress(walletAddresses[0])
  }, [activeWallet, showCopySheet, walletAddresses])

  const handleCopyAddress = () => {
    if (showCopySheet) {
      query.set(queryParams.copyAddress, 'true')
      return
    }

    setIsWalletAddressCopied(true)
    setTimeout(() => setIsWalletAddressCopied(false), 2000)

    UserClipboard.copyText(walletAddresses?.[0])
  }

  if (!address && (activeChain as string) !== AGGREGATED_CHAIN_KEY) {
    return null
  }

  return (
    <motion.button
      key={isWalletAddressCopied ? 'copied' : 'copy'}
      variants={opacityFadeInOut}
      initial='hidden'
      animate='visible'
      exit='hidden'
      transition={transition150}
      onClick={handleCopyAddress}
      className={cn(
        'text-xs !leading-[16px] font-medium text-muted-foreground flex items-center gap-x-[6px] border border-secondary-200 py-[5px] pl-4 pr-3 rounded-full transition-colors relative font-DMMono',
        isWalletAddressCopied
          ? 'text-primary outline-1 outline outline-primary bg-primary/10 justify-center'
          : 'bg-secondary-100 hover:bg-secondary-200',
      )}
    >
      {isWalletAddressCopied ? 'Copied!' : address}

      {isWalletAddressCopied ? (
        <Check className='size-4' />
      ) : (
        <CopyIcon className='text-secondary-600 size-4' />
      )}
    </motion.button>
  )
})
