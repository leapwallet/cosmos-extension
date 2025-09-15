import { Key, SelectedAddress } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainFeatureFlagsStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store'
import Text from 'components/text'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import { AddressBook } from 'utils/addressbook'

import { ErrorWarning } from '../error-warning'
import InputCard from './input-card'
import { RecipientChainInfo } from './recipient-chain-info'
import RecipientDisplayCard from './recipient-display-card'

interface RecipientCardProps {
  isIBCTransfer: boolean
  sendSelectedNetwork: string
  destChainInfo: ChainInfo | null
  selectedAddress: SelectedAddress | null
  setSelectedContact: (contact: AddressBook.SavedAddress) => void
  setIsAddContactSheetVisible: (visible: boolean) => void
  setShowSelectRecipient: (visible: boolean) => void
  setInputInProgress: (inProgress: boolean) => void
  inputInProgress: boolean
  activeChain: SupportedChain
  chainInfoStore: ChainInfosStore
  chainFeatureFlagsStore: ChainFeatureFlagsStore
}

const RecipientCard = forwardRef(
  (
    {
      isIBCTransfer,
      sendSelectedNetwork,
      destChainInfo,
      selectedAddress,
      setSelectedContact,
      setIsAddContactSheetVisible,
      setShowSelectRecipient,
      activeChain,
      setInputInProgress,
      inputInProgress,
      chainInfoStore,
      chainFeatureFlagsStore,
    }: RecipientCardProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [recipientInputValue, setRecipientInputValue] = useState<string>('')
    const { setSelectedAddress } = useSendContext()
    const wallets = Wallet.useWallets()
    const walletsArray: Key[] = useMemo(() => {
      return wallets ? Object.values(wallets) : []
    }, [wallets])

    return (
      <div className=' bg-secondary-100 rounded-xl mx-6'>
        <div className='w-full p-5 flex flex-col gap-4'>
          <div className='flex justify-between items-center w-full'>
            <p className='text-muted-foreground text-sm font-medium !leading-[22.4px]'>Recipient</p>
            {isIBCTransfer && sendSelectedNetwork === 'mainnet' && destChainInfo ? (
              <div className='flex w-fit gap-0.5 py-0.5 px-[10px] bg-[#0A84FF] rounded-3xl items-center'>
                <Images.Misc.IbcProtocol color='#fff' />
                <Text size='xs' color='text-white-100' className='whitespace-nowrap font-medium'>
                  IBC Transfer
                </Text>
              </div>
            ) : null}
          </div>

          {selectedAddress && !inputInProgress ? (
            <RecipientDisplayCard
              selectedAddress={selectedAddress}
              setSelectedContact={setSelectedContact}
              setIsAddContactSheetVisible={setIsAddContactSheetVisible}
              activeChain={activeChain}
              wallets={walletsArray}
              onEdit={() => {
                setInputInProgress(true)
                setRecipientInputValue(
                  selectedAddress?.ethAddress || selectedAddress?.address || '',
                )
                setSelectedAddress(null)
                setTimeout(() => {
                  if (ref && 'current' in ref) {
                    ref.current?.focus()
                  }
                }, 200)
              }}
            />
          ) : (
            <InputCard
              ref={ref}
              setInputInProgress={setInputInProgress}
              setShowSelectRecipient={setShowSelectRecipient}
              setRecipientInputValue={setRecipientInputValue}
              recipientInputValue={recipientInputValue}
              chainInfoStore={chainInfoStore}
              chainFeatureFlagsStore={chainFeatureFlagsStore}
              selectedNetwork={sendSelectedNetwork}
            />
          )}
        </div>

        {selectedAddress && !inputInProgress ? <RecipientChainInfo /> : null}

        <ErrorWarning />
      </div>
    )
  },
)

RecipientCard.displayName = 'RecipientCard'

export default observer(RecipientCard)
