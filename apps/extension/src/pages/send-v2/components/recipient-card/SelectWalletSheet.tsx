import { Key, useChainInfo, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useMemo } from 'react'
import { formatWalletName } from 'utils/formatWalletName'

import useWallets = Wallet.useWallets
import { useChainPageInfo } from 'hooks'
import { Images } from 'images'
import { useSendContext } from 'pages/send-v2/context'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { sliceAddress } from 'utils/strings'

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
            walletLabel = ` · /0'/0/${wallet.addressIndex}`
          }

          if (
            wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
            wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
          ) {
            walletLabel = ` · Imported`
          }

          const walletName =
            wallet.walletType == WALLETTYPE.LEDGER &&
            !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(wallet.name)
              ? `${walletLabels[wallet.walletType]} Wallet ${wallet.addressIndex + 1}`
              : formatWalletName(wallet.name)
          const walletNameLength = walletName.length
          const sliceLength = wallet.walletType === WALLETTYPE.LEDGER ? 10 : 19
          const shortenedWalletName =
            walletNameLength > sliceLength ? walletName.slice(0, sliceLength) + '...' : walletName

          let addressText = `${sliceAddress(wallet.addresses[activeChainInfo.key])}${walletLabel}`

          if (
            wallet.walletType === WALLETTYPE.LEDGER &&
            !isLedgerEnabled(activeChainInfo.key, activeChainInfo.bip44.coinType)
          ) {
            addressText = `Ledger not supported on ${activeChainInfo.chainName}`
          }

          if (
            wallet.walletType === WALLETTYPE.LEDGER &&
            isLedgerEnabled(activeChainInfo.key, activeChainInfo.bip44.coinType) &&
            !wallet.addresses[activeChainInfo.key]
          ) {
            addressText = `Please import EVM wallet`
          }

          return (
            <div className='relative min-h-[56px]' key={wallet.id}>
              <div
                className={`w-full flex items-center gap-3 py-3 cursor-pointer`}
                onClick={() => {
                  setSelectedWallet(wallet)
                  onClose()
                }}
              >
                <img
                  src={wallet?.avatar ?? Images.Misc.getWalletIconAtIndex(wallet.colorIndex)}
                  alt={`wallet icon`}
                  className='rounded-full border border-white-30 h-10 w-10'
                />
                <div className='flex-1'>
                  <p className='flex items-center gap-1 font-bold dark:text-white-100 text-gray-700 capitalize'>
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
                  <span className='material-icons-round ml-2' style={{ color: topChainColor }}>
                    check_circle
                  </span>
                ) : null}
              </div>

              {!isLast && <div className='border-b w-full border-gray-100 dark:border-gray-850' />}
            </div>
          )
        })}
      </div>
    </BottomModal>
  )
}
