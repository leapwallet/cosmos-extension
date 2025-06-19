import { Key } from '@leapwallet/cosmos-wallet-hooks'
import BottomModal from 'components/bottom-modal'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Images } from 'images'
import { addToConnections } from 'pages/ApproveConnection/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { activeChainStore } from 'stores/active-chain-store'
import { chainInfoStore } from 'stores/chain-infos-store'

import Text from '../../components/text'
import { Wallet } from '../../hooks/wallet/useWallet'
import CreateImportActions from './CreateImportActions'
import { NewWalletForm } from './CreateNewWallet'
import { EditWalletForm } from './EditWallet'
import { ImportPrivateKey } from './ImportPrivateKey'
import { ImportSeedPhrase } from './ImportSeedPhrase'
import ImportWatchWallet from './ImportWatchWallet'
import WalletCardWrapper from './WalletCardWrapper'
type SelectWalletProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly title: string
  readonly hideCreateNewWallet?: boolean
  readonly currentWalletInfo?: {
    wallets: [Key]
    chainIds: [string]
    origin: string
  } | null
}

export default function SelectWallet({
  isVisible,
  onClose,
  title,
  currentWalletInfo,
  hideCreateNewWallet,
}: SelectWalletProps) {
  const [isNewWalletFormVisible, setIsNewWalletFormVisible] = useState(false)
  const [isEditWalletVisible, setIsEditWalletVisible] = useState(false)
  const wallets = Wallet.useWallets()

  const [editWallet, setEditWallet] = useState<Key>()

  const [showImportPrivateKey, setShowImportPrivateKey] = useState(false)
  const [showImportSeedPhrase, setShowImportSeedPhrase] = useState(false)
  const [showImportWatchWallet, setShowImportWatchWallet] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setEditWallet(undefined)
    }
  }, [isVisible])

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) =>
            a.watchWallet === b.watchWallet ? a.name.localeCompare(b.name) : a.watchWallet ? 1 : -1,
          )
      : []
  }, [wallets])

  const handleConnectWalletClick = async () => {
    const walletIds = currentWalletInfo?.wallets.map((wallet) => wallet.id)
    await addToConnections(
      currentWalletInfo?.chainIds as [string],
      walletIds ?? [],
      currentWalletInfo?.origin as string,
    )
    onClose()
  }

  const walletName = currentWalletInfo?.wallets?.[0]?.name
  const walletColorIndex = currentWalletInfo?.wallets?.[0]?.colorIndex
  const siteName =
    currentWalletInfo?.origin?.split('//')?.at(-1)?.split('.')?.at(-2) ||
    currentWalletInfo?.origin?.split('//')?.at(-1)
  const siteLogo = useSiteLogo(currentWalletInfo?.origin)

  return (
    <>
      <BottomModal
        containerDiv={document.getElementById('select-wallet-container') ?? undefined}
        isOpen={isVisible}
        onClose={onClose}
        title={title}
        closeOnBackdropClick={true}
      >
        <div>
          {currentWalletInfo && (
            <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 min-h-[100px] justify-center items-center p-2'>
              <div className='pt-8 pb-2 flex flex-row'>
                <img
                  src={Images.Misc.getWalletIconAtIndex(
                    walletColorIndex as number,
                    currentWalletInfo?.wallets?.[0]?.watchWallet,
                  )}
                  className='z-10 border-2 border-gray-900 rounded-full relative left-2'
                />
                <object data={siteLogo} type='image' className='relative -left-2 z-0'>
                  <img src={Images.Misc.DefaultWebsiteIcon} alt='Website default icon' />
                </object>
              </div>

              <Text size='md' color='text-green-600' className='font-bold my-2'>
                {siteName}
              </Text>
              <Text size='xl' className='my-0 font-extrabold'>
                {walletName} not Connected
              </Text>

              <Text
                size='xs'
                style={{ textAlign: 'center' }}
                className='mb-2'
                color='text-gray-400'
              >
                You can connect this wallet, or can switch to an already connected wallet.
              </Text>

              <div
                onClick={handleConnectWalletClick}
                style={{ background: 'rgba(225, 136, 129, 0.1)', color: '#E18881' }}
                className='font-bold p-1 px-2 rounded-2xl cursor-pointer my-2'
              >
                Connect {walletName}
              </div>
            </div>
          )}

          <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 max-h-[200px] overflow-y-auto mb-4 py-1'>
            {walletsList.map((wallet, index, array) => {
              if (wallet.id === currentWalletInfo?.wallets?.[0]?.id) return null
              return (
                <WalletCardWrapper
                  key={wallet.id}
                  isLast={index === array.length - 1}
                  wallet={wallet}
                  onClose={onClose}
                  setEditWallet={setEditWallet}
                  setIsEditWalletVisible={setIsEditWalletVisible}
                />
              )
            })}
          </div>

          {!hideCreateNewWallet ? (
            <CreateImportActions
              setShowImportSeedPhrase={setShowImportSeedPhrase}
              setShowImportPrivateKey={setShowImportPrivateKey}
              setShowImportWatchWallet={setShowImportWatchWallet}
              setIsNewWalletFormVisible={setIsNewWalletFormVisible}
            />
          ) : null}
        </div>
      </BottomModal>

      <EditWalletForm
        wallet={editWallet as Key}
        isVisible={isEditWalletVisible}
        onClose={() => {
          setIsEditWalletVisible(false)
        }}
        activeChainStore={activeChainStore}
        chainInfosStore={chainInfoStore}
      />

      <NewWalletForm
        isVisible={isNewWalletFormVisible}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) {
            onClose()
          }
          setIsNewWalletFormVisible(false)
        }}
      />

      <ImportSeedPhrase
        isVisible={showImportSeedPhrase}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose()
          setShowImportSeedPhrase(false)
        }}
      />

      <ImportPrivateKey
        isVisible={showImportPrivateKey}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose()
          setShowImportPrivateKey(false)
        }}
      />

      <ImportWatchWallet
        isVisible={showImportWatchWallet}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose()
          setShowImportWatchWallet(false)
        }}
      />
      <div id='select-wallet-container' />
      <div id='import-private-key-container' />
      <div id='edit-wallet-container' />
      <div id='remove-wallet-container' />
    </>
  )
}
