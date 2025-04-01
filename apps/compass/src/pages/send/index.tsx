import { capitalize, sliceAddress, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { PencilSimple } from '@phosphor-icons/react'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { WalletButton } from 'components/button'
import { PageHeader } from 'components/header'
import { LoaderAnimation } from 'components/loader/Loader'
import { PageName } from 'config/analytics'
import { useWalletInfo } from 'hooks'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectWallet from 'pages/home/SelectWallet'
import TxPage, { TxType } from 'pages/nfts-v2/send-nft/TxPage'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { evmBalanceStore } from 'stores/balance-store'
import { compassTokensAssociationsStore } from 'stores/chain-infos-store'
import {
  rootCW20DenomsStore,
  rootDenomsStore,
  rootERC20DenomsStore,
} from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { AddressBook } from 'utils/addressbook'

import { AmountCard } from './components/amount-card'
import ErrorWarning from './components/error-warning'
import { Memo } from './components/memo'
import SaveAddressSheet from './components/recipient-card/save-address-sheet'
import { ReviewTransfer } from './components/review-transfer'
import { SendContextProvider, useSendContext } from './context'
import { useCheckAddressError } from './hooks/useCheckAddressError'
import { useFillAddressWarning } from './hooks/useFillAddressWarning'
import { SelectRecipientSheet } from './SelectRecipientSheet'

const Send = observer(() => {
  usePageView(PageName.Send)

  const navigate = useNavigate()
  const isAllAssetsLoading = rootBalanceStore.loading
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showSelectRecipient, setShowSelectRecipient] = useState(false)
  const { walletAvatar, walletName } = useWalletInfo()
  const {
    selectedAddress,
    setSelectedAddress,
    setInputAmount,
    fetchAccountDetailsData,
    fetchAccountDetailsStatus,
    setAssociatedSeiAddress,
    setAssociated0xAddress,
    setAddressError,
    setAddressWarning,
    setFetchAccountDetailsData,
    fetchAccountDetails,
    selectedToken,
    sendSelectedNetwork,
    setHasToUsePointerLogic,
    setPointerAddress,
    setHasToUseCw20PointerLogic,
    setSelectedToken,
    sendActiveChain,
  } = useSendContext()
  const [showTxPage, setShowTxPage] = useState(false)
  const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState(false)
  const [selectedContact, setSelectedContact] = useState<AddressBook.SavedAddress | undefined>()
  const [resetForm, setResetForm] = useState(false)
  const activeChain = useActiveChain()
  const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms
  const allCW20Denoms = rootCW20DenomsStore.allCW20Denoms

  useFillAddressWarning({
    fetchAccountDetailsData,
    fetchAccountDetailsStatus,

    addressWarningElementError: (
      <>
        Recipient will receive this on address:{' '}
        <LoaderAnimation color={Colors.white100} className='w-[20px] h-[20px]' />
      </>
    ),
    setAddressWarning,
  })

  useCheckAddressError({
    setAssociatedSeiAddress,
    setAssociated0xAddress,

    setAddressError,
    setAddressWarning,
    setFetchAccountDetailsData,
    fetchAccountDetails,

    selectedToken,
    recipientInputValue: selectedAddress?.ethAddress || selectedAddress?.address || '',
    allCW20Denoms,
    allERC20Denoms,
    addressWarningElementError: (
      <>
        Checking the Ox and Sei address link status{' '}
        <LoaderAnimation color={Colors.white100} className='w-[20px] h-[20px]' />
      </>
    ),
    showNameServiceResults: false,
    compassEvmToSeiMapping: compassTokensAssociationsStore.compassEvmToSeiMapping,
    compassSeiToEvmMapping: compassTokensAssociationsStore.compassSeiToEvmMapping,

    sendActiveChain,
    sendSelectedNetwork,
    setHasToUsePointerLogic,
    setPointerAddress,
    setHasToUseCw20PointerLogic,
    setSelectedToken,
  })

  usePerformanceMonitor({
    page: 'send',
    queryStatus: isAllAssetsLoading ? 'loading' : 'success',
    op: 'sendPageLoad',
    description: 'loading state on send page',
  })

  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])

  const handleCloseRecipientSheet = useCallback(() => {
    if (!selectedAddress) {
      navigate(-1)
    } else {
      setShowSelectRecipient(false)
    }
  }, [navigate, selectedAddress])

  useEffect(() => {
    if (!selectedAddress) {
      setShowSelectRecipient(true)
    }
  }, [selectedAddress])

  const editContact = (savedAddress?: AddressBook.SavedAddress) => {
    if (savedAddress) {
      setSelectedContact(savedAddress)
    }
    setIsAddContactSheetVisible(true)
  }

  return (
    <>
      {selectedAddress ? (
        <>
          <PageHeader>
            <ArrowLeft
              size={48}
              className='text-monochrome cursor-pointer p-3'
              onClick={() => navigate(-1)}
            />

            <WalletButton
              className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
              walletName={walletName}
              showWalletAvatar={true}
              walletAvatar={walletAvatar}
              showDropdown={true}
              handleDropdownClick={handleOpenWalletSheet}
            />
          </PageHeader>

          <div className='flex flex-1 flex-col justify-between pt-4 px-4 w-full gap-3 relative overflow-y-scroll'>
            <div className='flex flex-col w-full gap-3 relative p-2'>
              <AmountCard
                rootBalanceStore={rootBalanceStore}
                isAllAssetsLoading={isAllAssetsLoading}
                rootDenomsStore={rootDenomsStore}
                rootCW20DenomsStore={rootCW20DenomsStore}
                rootERC20DenomsStore={rootERC20DenomsStore}
                evmBalanceStore={evmBalanceStore}
                resetForm={resetForm}
              />
              <div className='w-full bg-secondary-100 rounded-xl overflow-hidden'>
                <div className='w-full p-5 flex flex-col gap-4'>
                  <p className='text-muted-foreground text-sm font-medium !leading-[22.4px]'>
                    Recipient
                  </p>
                  <div className='flex justify-between items-center w-full'>
                    <div className='flex gap-4 items-center'>
                      <img className='h-11 w-11' src={Images.Misc.getWalletIconAtIndex(1)} />

                      <div className='flex flex-col gap-1'>
                        <p className='font-bold text-left text-monochrome text-sm'>
                          {selectedAddress?.name
                            ? capitalize(selectedAddress.name)
                            : sliceAddress(
                                selectedAddress?.ethAddress
                                  ? selectedAddress.ethAddress
                                  : selectedAddress?.address,
                              )}
                        </p>
                        {selectedAddress?.name ? (
                          <p className='text-sm text-muted-foreground'>
                            {sliceAddress(
                              selectedAddress?.ethAddress
                                ? selectedAddress.ethAddress
                                : selectedAddress?.address,
                            )}
                          </p>
                        ) : (
                          <div
                            className='bg-secondary-200 hover:bg-secondary-300 text-xs text-muted-foreground hover:text-monochrome rounded-full py-0.5 pl-1.5 pr-2 cursor-pointer'
                            onClick={() => {
                              setSelectedContact({
                                address:
                                  selectedAddress?.ethAddress || selectedAddress?.address || '',
                                name: '',
                                emoji: 0,
                                blockchain: activeChain,
                                ethAddress: selectedAddress?.ethAddress || '',
                              })
                              setIsAddContactSheetVisible(true)
                            }}
                          >
                            + Add to contacts
                          </div>
                        )}
                      </div>
                    </div>

                    <PencilSimple
                      size={32}
                      weight='fill'
                      className='bg-secondary-300 rounded-full p-2 text-monochrome cursor-pointer'
                      onClick={() => {
                        setSelectedAddress(null)
                        setShowSelectRecipient(true)
                      }}
                    />
                  </div>
                </div>
                <ErrorWarning />
              </div>
              <Memo />

              <ReviewTransfer setShowTxPage={setShowTxPage} />
            </div>
          </div>
        </>
      ) : null}

      <SelectRecipientSheet
        isOpen={showSelectRecipient && !selectedAddress && !isAddContactSheetVisible}
        onClose={handleCloseRecipientSheet}
        editContact={editContact}
      />

      {showTxPage && (
        <TxPage
          isOpen={showTxPage}
          onClose={() => {
            setShowTxPage(false)
            setInputAmount('')
            setResetForm(true)
            setTimeout(() => setResetForm(false), 2000)
          }}
          txType={TxType.SEND}
        />
      )}
      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => {
          setShowSelectWallet(false)
          navigate('/home')
        }}
        title='Wallets'
      />
      <SaveAddressSheet
        isOpen={isAddContactSheetVisible}
        onSave={setSelectedAddress}
        onClose={() => {
          setIsAddContactSheetVisible(false)
          setSelectedContact(undefined)
        }}
        address={selectedContact?.address ?? ''}
        ethAddress={selectedContact?.ethAddress ?? ''}
        sendActiveChain={activeChain}
        title={selectedContact ? 'Edit Contact' : 'Add Contact'}
        showDeleteBtn={!!selectedContact}
      />
    </>
  )
})

const SendPage = observer(() => {
  const activeChain = useActiveChain()
  return (
    <SendContextProvider
      activeChain={activeChain}
      rootDenomsStore={rootDenomsStore}
      rootCW20DenomsStore={rootCW20DenomsStore}
      rootERC20DenomsStore={rootERC20DenomsStore}
    >
      <Send />
    </SendContextProvider>
  )
})

export default SendPage
