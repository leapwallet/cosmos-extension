import { Key, useChainInfo, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { WALLET_NAME_SLICE_LENGTH } from 'config/constants'
import { useChainPageInfo } from 'hooks'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { useSendContext } from 'pages/send-v2/context'
import React, { useMemo } from 'react'
import { formatWalletName } from 'utils/formatWalletName'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { sliceAddress } from 'utils/strings'

import useWallets = Wallet.useWallets
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { getDerivationPathToShow } from 'utils'
import { getLedgerEnabledEvmChainsKey } from 'utils/getLedgerEnabledEvmChains'

type SelectWalletSheetProps = {
  isOpen: boolean
  onClose: () => void
  setSelectedWallet: (val: Key) => void
  selectedWallet: Key
}

export const SelectWalletSheet: React.FC<SelectWalletSheetProps> = ({
  isOpen,
  onClose,
  setSelectedWallet,
  selectedWallet,
}) => {
  const wallets = useWallets()
  const { topChainColor } = useChainPageInfo()
  const { sendActiveChain } = useSendContext()

  const activeChainInfo = useChainInfo(sendActiveChain)
  const chains = useGetChains()

  const ledgerEnabledEvmChainsKeys = useMemo(() => {
    return getLedgerEnabledEvmChainsKey(Object.values(chains))
  }, [chains])

  const ledgerApp = useMemo(() => {
    return ledgerEnabledEvmChainsKeys.includes(activeChainInfo?.key) ? 'EVM' : 'Cosmos'
  }, [activeChainInfo?.key, ledgerEnabledEvmChainsKeys])

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) => a.name.localeCompare(b.name))
      : []
  }, [wallets])

  return (
    <BottomModal
      title='Wallets'
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='pt-3 px-6 pb-6'
    >
      <div>
        {walletsList.map((wallet, index, array) => {
          const isLast = index === array.length - 1
          let walletLabel = ''

          if (wallet.walletType === WALLETTYPE.LEDGER) {
            const path = wallet.path
              ? getDerivationPathToShow(wallet.path)
              : `0'/0/${wallet.addressIndex}`

            walletLabel = ` · /${path}`
          }

          if (
            (wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
              wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED) &&
            !wallet.watchWallet
          ) {
            walletLabel = ` · Imported`
          }

          const walletName = formatWalletName(wallet.name)
          const shortenedWalletName =
            walletName.length > WALLET_NAME_SLICE_LENGTH
              ? walletName.slice(0, WALLET_NAME_SLICE_LENGTH) + '...'
              : walletName
          const walletAddress = activeChainInfo?.evmOnlyChain
            ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key], true)
            : wallet?.addresses?.[activeChainInfo?.key]

          const addressValue = activeChainInfo?.evmOnlyChain
            ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key])
            : wallet?.addresses?.[activeChainInfo?.key] ?? ''
          let addressText = `${
            addressValue ? sliceAddress(addressValue) + walletLabel : walletLabel.replace(' · ', '')
          }`

          if (
            wallet.walletType === WALLETTYPE.LEDGER &&
            !isLedgerEnabled(
              activeChainInfo.key,
              activeChainInfo.bip44.coinType,
              Object.values(chains),
            )
          ) {
            addressText = `Ledger not supported on ${activeChainInfo.chainName}`
          }

          if (
            wallet.walletType === WALLETTYPE.LEDGER &&
            isLedgerEnabled(
              activeChainInfo.key,
              activeChainInfo.bip44.coinType,
              Object.values(chains),
            ) &&
            !wallet.addresses[activeChainInfo.key]
          ) {
            addressText = `Please import ${ledgerApp} wallet`
          }

          return (
            <div className='relative min-h-[56px]' key={wallet.id}>
              <button
                className='w-full flex items-center gap-3 py-3 cursor-pointer'
                onClick={() => {
                  setSelectedWallet(wallet)
                  onClose()
                }}
              >
                <img
                  src={
                    wallet?.avatar ??
                    Images.Misc.getWalletIconAtIndex(wallet.colorIndex, wallet.watchWallet)
                  }
                  alt={`wallet icon`}
                  className='rounded-full border border-white-30 h-10 w-10'
                />

                <div className='flex-1 flex flex-col items-start'>
                  <p className='flex text-left items-center gap-1 font-bold dark:text-white-100 text-gray-700 capitalize'>
                    {shortenedWalletName}
                    {wallet.walletType === WALLETTYPE.LEDGER && (
                      <Text
                        className='bg-gray-900 font-normal rounded-2xl justify-center items-center px-2 ml-1 h-[18px]'
                        color='text-gray-400'
                        size='xs'
                      >
                        Ledger
                      </Text>
                    )}
                  </p>

                  <p className='text-sm font-medium dark:text-gray-400 text-gray-600'>
                    {addressText}
                  </p>
                </div>

                {selectedWallet?.id === wallet.id ? (
                  <CheckCircle
                    weight='fill'
                    size={24}
                    className='ml-2'
                    style={{ color: topChainColor }}
                  />
                ) : null}
              </button>

              {!isLast && <div className='border-b w-full border-gray-100 dark:border-gray-850' />}
            </div>
          )
        })}
      </div>
    </BottomModal>
  )
}
