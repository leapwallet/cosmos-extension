import { Key, useChainInfo, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { Check, DotsThreeVertical } from '@phosphor-icons/react'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import { AnimatePresence, motion } from 'framer-motion'
import { WatchWalletAvatar } from 'hooks'
import { Wallet } from 'hooks/wallet/useWallet'
import { CopyIcon } from 'icons/copy-icon'
import { GoogleColorIcon } from 'icons/google-color-icon'
import { LedgerDriveIcon } from 'icons/ledger-icon'
import { getWalletIconAtIndex } from 'images/misc'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserClipboard } from 'utils/clipboard'
import { cn } from 'utils/cn'
import { formatWalletName } from 'utils/formatWalletName'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

import useActiveWallet from '../../hooks/settings/useActiveWallet'
import { sliceAddress } from '../../utils/strings'
import { trimEmail } from './utils/trim-email'

const WalletCardWrapper = observer(
  ({
    isLast,
    wallet,
    onClose,
    setEditWallet,
    setIsEditWalletVisible,
  }: {
    isLast: boolean
    wallet: Key
    onClose: () => void
    setEditWallet: (wallet: Key) => void
    setIsEditWalletVisible: (visible: boolean) => void
  }) => {
    const navigate = useNavigate()
    const activeChainInfo = useChainInfo()
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const socialWallets = Wallet.useSocialWallet()

    const { walletLabel, shortenedWalletName } = useMemo(() => {
      let walletLabel = ''

      if (
        (wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
          wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED) &&
        !wallet.watchWallet
      ) {
        walletLabel = `Imported`
      }

      if (!wallet.watchWallet && wallet.walletType === WALLETTYPE.LEDGER && wallet.path) {
        walletLabel = `Imported · ${wallet.path?.replace("m/44'/118'/", '')}`
      }

      const socialWallet = socialWallets?.[wallet.id]
      if (socialWallet?.id) {
        walletLabel = trimEmail(socialWallet.email) || 'Social'
      }

      const walletName = formatWalletName(wallet.name)

      const sliceLength = 19
      const walletNameLength = walletName.length
      const shortenedWalletName =
        walletNameLength > sliceLength ? walletName.slice(0, sliceLength) + '...' : walletName

      return { walletLabel, walletName, walletNameLength, shortenedWalletName }
    }, [wallet, socialWallets])

    const { addressText, disableEdit } = useMemo(() => {
      let addressText =
        pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key], true) ||
        wallet?.addresses?.[activeChainInfo?.key]

      let disableEdit = false

      if (wallet.walletType === WALLETTYPE.LEDGER) {
        if (!wallet.addresses[activeChainInfo?.key]) {
          addressText = `Please import EVM wallet`
          disableEdit = true
        } else {
          addressText =
            wallet.addresses[activeChainInfo?.key] ||
            pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key], true)
        }
      }

      return { addressText, disableEdit }
    }, [wallet, activeChainInfo])

    const onClick = useCallback(async () => {
      await setActiveWallet(wallet)
      onClose()
      navigate('/home')
    }, [setActiveWallet, wallet, onClose, navigate])

    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center justify-between gap-3 py-3 px-4 bg-secondary-100 rounded-2xl transition-colors cursor-pointer',
          activeWallet?.id === wallet.id
            ? 'bg-accent-blue-900 border border-spacing-0.5 border-accent-blue-700'
            : 'hover:bg-secondary-200',
        )}
      >
        {wallet.watchWallet ? (
          <WatchWalletAvatar
            colorIndex={wallet.colorIndex}
            className='size-9 rounded-full'
            iconClassName='size-7'
          />
        ) : socialWallets?.[wallet.id]?.id ? (
          <GoogleColorIcon className='size-9 rounded-full' />
        ) : (
          <img
            src={wallet?.avatar || getWalletIconAtIndex(wallet.colorIndex)}
            className='size-9 rounded-full'
          />
        )}

        <div className='flex flex-col flex-1'>
          <div className='flex flex-row items-center gap-2 whitespace-nowrap text-sm font-bold'>
            {shortenedWalletName}
            {wallet.walletType === WALLETTYPE.LEDGER && (
              <span className='shrink-0 p-1 bg-secondary-300 rounded' title='Ledger'>
                <LedgerDriveIcon className='size-2' />
              </span>
            )}
          </div>
          <span className='text-xs text-muted-foreground max-w-56 whitespace-nowrap w-full flex items-center gap-1'>
            {walletLabel ? (
              <>
                <span className='max-w-40 truncate'>{walletLabel}</span> ·{' '}
              </>
            ) : (
              <></>
            )}
            <AddressLabel address={addressText} />
          </span>
        </div>

        <button
          className='size-7 cursor-pointer justify-center text-monochrome/60 hover:text-monochrome grid place-content-center'
          onClick={(e) => {
            e.stopPropagation()
            if (disableEdit) return
            setEditWallet(wallet)
            setIsEditWalletVisible(true)
          }}
          data-testing-id={isLast ? 'btn-more-horiz' : ''}
        >
          <DotsThreeVertical size={20} />
        </button>
      </div>
    )
  },
)

export default WalletCardWrapper

const AddressLabel = ({ address }: { address: string }) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false)
      }, 2_000)
    }
  }, [isCopied])

  return (
    <button
      className='text-xs text-muted-foreground truncate max-w-56 hover:text-accent-blue'
      onClick={(e) => {
        e.stopPropagation()
        UserClipboard.copyText(address)
        setIsCopied(true)
      }}
    >
      <AnimatePresence exitBeforeEnter>
        {isCopied ? (
          <motion.span
            key='copied'
            transition={transition150}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='flex items-center gap-1'
          >
            Copied
            <Check className='size-3' />
          </motion.span>
        ) : (
          <motion.span
            key='address'
            transition={transition150}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='flex items-center gap-1 group'
          >
            {sliceAddress(address)}
            <CopyIcon className='size-3 opacity-0 group-hover:opacity-100 transition-opacity' />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
