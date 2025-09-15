import {
  Key,
  useActiveChain,
  useChainInfo,
  useGetChains,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  isAptosChain,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Check, DotsThreeVertical } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { CopyIcon } from 'icons/copy-icon'
import { EyeIcon } from 'icons/eye-icon'
import { LedgerDriveIcon } from 'icons/ledger-icon'
import { getWalletIconAtIndex } from 'images/misc'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { rootBalanceStore } from 'stores/root-store'
import { selectedNetworkStore } from 'stores/selected-network-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import { cn } from 'utils/cn'
import { formatWalletName } from 'utils/formatWalletName'
import { getLedgerEnabledEvmChainsKey } from 'utils/getLedgerEnabledEvmChains'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

import useActiveWallet from '../../hooks/settings/useActiveWallet'
import { sliceAddress } from '../../utils/strings'

export const WatchWalletAvatar = (props: {
  colorIndex: number
  className?: string
  iconClassName?: string
}) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-secondary-400 flex items-center justify-center shrink-0',
        props.className,
      )}
      style={{ backgroundColor: Colors.getWalletColorAtIndex(props.colorIndex) }}
    >
      <EyeIcon className={cn('size-5 p-0.5', props.iconClassName)} />
    </div>
  )
}

const AddressLabel = observer(({ address }: { address: string }) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false)
      }, 2_000)
    }
  }, [isCopied])

  if (!address) return null

  return (
    <button
      className='text-xs text-muted-foreground truncate max-w-56 hover:text-accent-green'
      onClick={(e) => {
        e.stopPropagation()
        UserClipboard.copyText(address)
        setIsCopied(true)
      }}
    >
      <AnimatePresence mode='wait'>
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
})

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
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const chains = useGetChains()
    const [formatCurrency] = useFormatCurrency()

    const ledgerEnabledEvmChainsKeys = useMemo(() => {
      return getLedgerEnabledEvmChainsKey(Object.values(chains))
    }, [chains])

    const ledgerApp = useMemo(() => {
      return ledgerEnabledEvmChainsKeys.includes(activeChainInfo?.key) ? 'EVM' : 'Cosmos'
    }, [activeChainInfo?.key, ledgerEnabledEvmChainsKeys])

    const { walletLabel, shortenedWalletName } = useMemo(() => {
      let walletLabel = ''

      if (
        (wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
          wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED) &&
        !wallet.watchWallet
      ) {
        walletLabel = 'Imported'
      }

      if (!wallet.watchWallet && wallet.walletType === WALLETTYPE.LEDGER && wallet.path) {
        walletLabel = `${wallet.path?.replace("m/44'/118'/", '')}`
      }

      const walletName = formatWalletName(wallet.name)

      const sliceLength = 19
      const walletNameLength = walletName.length
      const shortenedWalletName =
        walletNameLength > sliceLength ? walletName.slice(0, sliceLength) + '...' : walletName

      return { walletLabel, walletName, walletNameLength, shortenedWalletName }
    }, [wallet])

    const { addressText, disableEdit } = useMemo(() => {
      const addressValue = activeChainInfo?.evmOnlyChain
        ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key], true) ??
          wallet?.addresses?.[activeChainInfo?.key]
        : wallet?.addresses?.[activeChainInfo?.key] ?? ''

      let addressText = addressValue

      let disableEdit = false

      if (
        wallet.walletType === WALLETTYPE.LEDGER &&
        !isLedgerEnabled(
          activeChainInfo?.key,
          activeChainInfo?.bip44?.coinType,
          Object.values(chains),
        )
      ) {
        addressText = `Ledger not supported on ${activeChainInfo?.chainName}`
        disableEdit = true
      }
      if (
        wallet.walletType === WALLETTYPE.LEDGER &&
        isLedgerEnabled(
          activeChainInfo?.key,
          activeChainInfo?.bip44?.coinType,
          Object.values(chains),
        ) &&
        !wallet.addresses[activeChainInfo?.key]
      ) {
        addressText = `Please import ${ledgerApp} wallet`
        disableEdit = true
      }

      const isEvmNotImportedOnWW =
        wallet.walletType === WALLETTYPE.WATCH_WALLET &&
        !!activeChainInfo?.evmOnlyChain &&
        !wallet.addresses[activeChainInfo?.key]

      const isAptosNotImportedOnWW =
        wallet.walletType === WALLETTYPE.WATCH_WALLET &&
        isAptosChain(activeChainInfo?.key) &&
        !wallet.addresses[activeChainInfo?.key]

      if (isEvmNotImportedOnWW || isAptosNotImportedOnWW) {
        addressText = `Please import ${isEvmNotImportedOnWW ? 'EVM' : 'Movement'} wallet`
        disableEdit = true
      }

      return { addressText, disableEdit }
    }, [wallet, activeChainInfo, chains, ledgerApp])

    const onClick = useCallback(async () => {
      await setActiveWallet(wallet)
      onClose()
      navigate('/home')
    }, [setActiveWallet, wallet, onClose, navigate])

    const isActiveWallet = activeWallet?.id === wallet.id

    const forceAddresses = useMemo(() => {
      const _forceAddresses: Record<string, string> = {}
      Object.keys(wallet.addresses).forEach((chain) => {
        if (chains[chain as SupportedChain]?.evmOnlyChain) {
          const pubKey = wallet?.pubKeys?.[chain as SupportedChain]
          if (!pubKey) {
            return
          }
          const evmAddress = pubKeyToEvmAddressToShow(pubKey, true)
          if (!evmAddress) {
            return
          }
          _forceAddresses[chain] = evmAddress
        } else {
          const address = wallet.addresses?.[chain as SupportedChain]
          if (!address) {
            return
          }
          _forceAddresses[chain] = address
        }
      })
      return _forceAddresses
    }, [wallet?.addresses, wallet?.pubKeys, chains])

    const totalFiatValue = rootBalanceStore.getTotalFiatValue(
      'aggregated',
      selectedNetworkStore.selectedNetwork,
      forceAddresses,
    )

    const hasAnyBalances =
      rootBalanceStore.getAllTokens(
        'aggregated',
        selectedNetworkStore.selectedNetwork,
        forceAddresses,
      )?.length > 0

    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center justify-between gap-3 py-3 px-4 bg-secondary-100 rounded-2xl transition-colors cursor-pointer',
          isActiveWallet
            ? 'bg-accent-green/10 border border-spacing-0.5 border-accent-green-600'
            : 'hover:bg-secondary-200',
        )}
      >
        {wallet.watchWallet ? (
          <WatchWalletAvatar
            colorIndex={wallet.colorIndex}
            className='size-9 rounded-full'
            iconClassName='size-7'
          />
        ) : (
          <img
            src={wallet?.avatar || getWalletIconAtIndex(wallet.colorIndex)}
            className='size-9 rounded-full'
          />
        )}

        <div className='flex flex-col flex-1'>
          <div className='flex flex-row items-center gap-2 whitespace-nowrap text-sm font-bold'>
            {shortenedWalletName}
            {walletLabel && (
              <span className='bg-background bg-opacity-40 text-xs font-medium text-muted-foreground px-1 rounded-sm'>
                {walletLabel}
              </span>
            )}
            {wallet.walletType === WALLETTYPE.LEDGER && (
              <span className='shrink-0 p-1 bg-secondary-300 rounded' title='Ledger'>
                <LedgerDriveIcon className='size-2' />
              </span>
            )}
          </div>
          <span className='text-xs text-muted-foreground max-w-56 whitespace-nowrap w-full flex items-center gap-1'>
            {hasAnyBalances ? (
              <>
                <span className='text-xs text-muted-foreground truncate whitespace-nowrap max-w-24'>
                  {hideAssetsStore.formatHideBalance(formatCurrency(totalFiatValue, true))}
                </span>
                {activeChain !== 'aggregated' ? (
                  <span className='w-1 h-1 bg-muted-foreground rounded-full'></span>
                ) : null}
              </>
            ) : null}
            {activeChain !== 'aggregated' ? (
              disableEdit ? (
                addressText
              ) : (
                <AddressLabel address={addressText} />
              )
            ) : null}
          </span>
        </div>

        <div className='flex items-center gap-2'>
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
      </div>
    )
  },
)

export default WalletCardWrapper
