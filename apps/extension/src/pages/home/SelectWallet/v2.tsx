import { Key } from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { MagnifyingGlassMinus, Plus } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { SearchInput } from 'components/ui/input/search-input'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useMemo, useState } from 'react'
import { activeChainStore } from 'stores/active-chain-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import { cn } from 'utils/cn'

import { Wallet } from '../../../hooks/wallet/useWallet'
import { EditWalletForm } from '../EditWallet/index'
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
  const [searchQuery, setSearchQuery] = useState<string>('')
  const wallets = Wallet.useWallets()
  const chainInfos = useChainInfos()

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
          .filter(
            (wallet) =>
              wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              Object.entries(wallet.addresses).some(([chain, address]) => {
                if (chainInfos[chain as SupportedChain]?.evmOnlyChain) {
                  const pubKey = wallet.pubKeys?.[chain as SupportedChain]
                  if (!pubKey) return false
                  const evmAddress = pubKeyToEvmAddressToShow(pubKey, true)
                  return evmAddress?.toLowerCase().includes(searchQuery.toLowerCase())
                }
                return address.toLowerCase().includes(searchQuery.toLowerCase())
              }),
          )
      : []
  }, [wallets, searchQuery, chainInfos])

  return (
    <>
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title={title}
        className='h-full mb-4'
        fullScreen
        footerComponent={
          <Button className='w-full' size={'md'} onClick={() => setShowCreateImportActions(true)}>
            <Plus size={16} /> Create / Import Wallet
          </Button>
        }
      >
        <div className='h-full'>
          <SearchInput
            value={searchQuery}
            autoFocus={false}
            onChange={(e) => setSearchQuery(e?.target?.value ?? '')}
            placeholder='Search by wallet name or address'
            onClear={() => setSearchQuery('')}
            className='mb-6'
          />

          {currentWalletInfo && !searchQuery && (
            <WalletNotConnectedMsg currentWalletInfo={currentWalletInfo} onClose={onClose} />
          )}

          {walletsList?.length > 0 ? (
            <div className='flex flex-col rounded-2xl overflow-y-auto mb-4 py-1 gap-3.5'>
              {walletsList?.map((wallet, index, array) => {
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
          ) : searchQuery ? (
            <div
              className={cn(
                'w-full flex items-center justify-center rounded-2xl border border-secondary-200 h-[calc(100%-63px)]',
              )}
            >
              <div className='flex items-center justify-center flex-col gap-4'>
                <div className='p-5 bg-secondary-200 rounded-full flex items-center justify-center'>
                  <MagnifyingGlassMinus size={24} className='text-foreground' />
                </div>
                <p className='text-[18px] !leading-[24px] font-bold text-foreground text-center'>
                  No results found
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </BottomModal>

      <CreateImportActions
        title='Create / Import Wallet'
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
        chainInfoStore={chainInfoStore}
      />
    </>
  )
}

export default SelectWallet
