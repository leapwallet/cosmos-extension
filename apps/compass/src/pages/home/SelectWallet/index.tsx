import { Key } from '@leapwallet/cosmos-wallet-hooks'
import { Plus } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { Button } from 'components/ui/button'
import React, { useMemo, useState } from 'react'
import { activeChainStore } from 'stores/active-chain-store'

import { Wallet } from '../../../hooks/wallet/useWallet'
import { EditWalletForm } from '../EditWallet'
import WalletCardWrapper from '../WalletCardWrapper'
import CreateImportActions from './CreateImportActions'
import { WalletNotConnectedMsg } from './not-connected-msg'

type SelectWalletProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly title?: string
  readonly currentWalletInfo?: {
    wallets: [Key]
    chainIds: [string]
    origin: string
  } | null
}

const SelectWallet = ({
  isVisible,
  onClose,
  title = 'Your Wallets',
  currentWalletInfo,
}: SelectWalletProps) => {
  const [isEditWalletVisible, setIsEditWalletVisible] = useState(false)
  const wallets = Wallet.useWallets()

  const [editWallet, setEditWallet] = useState<Key>()
  const [showCreateImportActions, setShowCreateImportActions] = useState(false)

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) =>
            a.createdAt && b.createdAt
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : a.name.localeCompare(b.name),
          )
      : []
  }, [wallets])

  return (
    <>
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title={title}
        fullScreen
        footerComponent={
          <Button className='w-full' size={'md'} onClick={() => setShowCreateImportActions(true)}>
            <Plus size={16} /> Add / Connect Wallet
          </Button>
        }
      >
        <div>
          {currentWalletInfo && (
            <WalletNotConnectedMsg currentWalletInfo={currentWalletInfo} onClose={onClose} />
          )}

          <div className='flex flex-col rounded-2xl overflow-y-auto mb-4 py-1 gap-2'>
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
        </div>
      </BottomModal>

      <CreateImportActions
        title='Add / Connect Wallet'
        isVisible={showCreateImportActions}
        onClose={(closeParent) => {
          setShowCreateImportActions(false)
          if (closeParent) onClose()
        }}
      />

      <EditWalletForm
        wallet={editWallet as Key}
        isVisible={isEditWalletVisible}
        onClose={() => {
          setIsEditWalletVisible(false)
        }}
        activeChainStore={activeChainStore}
      />
    </>
  )
}

export default SelectWallet
