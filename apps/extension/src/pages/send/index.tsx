import {
  capitalize,
  sliceAddress,
  useActiveChain,
  useActiveWallet,
  useAddressPrefixes,
  useChainsStore,
  useFeatureFlags,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getBlockChainFromAddress,
  isAptosAddress,
  isAptosChain,
  isEthAddress,
  isSolanaAddress,
  isSolanaChain,
  isSuiChain,
  isValidBtcAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store'
import {
  Asset,
  SkipDestinationChain,
  useSkipDestinationChains,
  useSkipSupportedChains,
} from '@leapwallet/elements-hooks'
import { PencilSimple } from '@phosphor-icons/react'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { bech32 } from 'bech32'
import { WalletButtonV2 } from 'components/button'
import { PageHeader } from 'components/header/PageHeaderV2'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { useWalletInfo } from 'hooks'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectWallet from 'pages/home/SelectWallet/v2'
import TxPage, { TxType } from 'pages/nfts/send-nft/TxPage'
import { isValidSuiAddress } from 'pages/send-v2/hooks/useCheckAddressError'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { evmBalanceStore } from 'stores/balance-store'
import {
  rootCW20DenomsStore,
  rootDenomsStore,
  rootERC20DenomsStore,
} from 'stores/denoms-store-instance'
import { manageChainsStore } from 'stores/manage-chains-store'
import { rootBalanceStore } from 'stores/root-store'
import { AddressBook } from 'utils/addressbook'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

import { AmountCard } from './components/amount-card'
import { ErrorChannel, ErrorWarning } from './components/error-warning'
import { Memo } from './components/memo'
import SaveAddressSheet from './components/recipient-card/save-address-sheet'
import { ReviewTransfer } from './components/review-transfer'
import { SendContextProvider, useSendContext } from './context'
import { useCheckIbcTransfer } from './hooks/useCheckIbcTransfer'
import { SelectRecipientSheet } from './SelectRecipientSheet'

const Send = observer(() => {
  // usePageView(PageName.Send)

  const navigate = useNavigate()
  const isAllAssetsLoading = rootBalanceStore.loading
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showSelectRecipient, setShowSelectRecipient] = useState(false)
  const { walletAvatar, walletName } = useWalletInfo()
  const {
    selectedAddress,
    setSelectedAddress,
    addressError,
    setAddressError,
    isIBCTransfer,
    setCustomIbcChannelId,
    selectedToken,
    isIbcUnwindingDisabled,
    sendActiveChain,
    setSelectedChain,
    sendSelectedNetwork,
    selectedChain,
    setInputAmount,
  } = useSendContext()
  const [showTxPage, setShowTxPage] = useState(false)
  const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState(false)
  const [selectedContact, setSelectedContact] = useState<AddressBook.SavedAddress | undefined>()
  const [resetForm, setResetForm] = useState(false)
  const activeChain = useActiveChain()

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

  const { chains } = useChainsStore()
  const addressPrefixes = useAddressPrefixes()
  const activeWallet = useActiveWallet()

  const { data: elementsChains } = useSkipSupportedChains({ chainTypes: ['cosmos'] })
  const { data: featureFlags } = useFeatureFlags()

  const activeChainInfo = chains[sendActiveChain]

  const asset: Asset = {
    denom: selectedToken?.ibcDenom || selectedToken?.coinMinimalDenom || '',
    symbol: selectedToken?.symbol || '',
    logoUri: selectedToken?.img || '',
    decimals: selectedToken?.coinDecimals || 0,
    originDenom: selectedToken?.coinMinimalDenom || '',
    denomTracePath: selectedToken?.ibcChainInfo
      ? `transfer/${selectedToken.ibcChainInfo?.channelId}`
      : '',
  }

  const sourceChain = elementsChains?.find((chain) => chain.chainId === activeChainInfo.chainId)
  const { data: skipSupportedDestinationChains } =
    featureFlags?.ibc?.extension !== 'disabled'
      ? useSkipDestinationChains(asset, sourceChain, sendSelectedNetwork === 'mainnet')
      : { data: null }

  const skipSupportedDestinationChainsIDs: string[] = useMemo(() => {
    return (
      (
        skipSupportedDestinationChains as Array<
          Extract<SkipDestinationChain, { chainType: 'cosmos' }>
        >
      )
        ?.filter((chain) => {
          if (chain.chainType !== 'cosmos') {
            return false
          }
          if (
            (activeWallet?.walletType === WALLETTYPE.LEDGER &&
              !isLedgerEnabled(
                chain.key as SupportedChain,
                chain.coinType,
                Object.values(chains),
              )) ||
            !activeWallet?.addresses[chain.key as SupportedChain]
          ) {
            return false
          } else {
            return true
          }
        })
        .map((chain) => {
          return chain.chainId
        }) || []
    )
  }, [skipSupportedDestinationChains, activeWallet?.walletType, activeWallet?.addresses, chains])

  const destChainInfo = useMemo(() => {
    if (!selectedAddress?.address) {
      return null
    }

    const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address)
    if (!destChainAddrPrefix) {
      return null
    }

    const destinationChainKey = addressPrefixes[destChainAddrPrefix] as SupportedChain | undefined
    if (!destinationChainKey) {
      return null
    }

    // we are sure that the key is there in the chains object due to previous checks
    return chains[destinationChainKey]
  }, [addressPrefixes, chains, selectedAddress?.address])

  useCheckIbcTransfer({
    sendActiveChain,
    selectedAddress,
    sendSelectedNetwork,
    isIbcUnwindingDisabled,
    skipSupportedDestinationChainsIDs,
    selectedToken,

    setAddressError,
    manageChainsStore,
  })

  useEffect(() => {
    if (selectedAddress?.chainName) {
      setCustomIbcChannelId(undefined)
    }
  }, [selectedAddress?.chainName, setCustomIbcChannelId])

  useEffect(() => {
    const address = selectedAddress?.address || selectedAddress?.ethAddress
    if (address && Object.keys(addressPrefixes).length > 0) {
      let chain: SupportedChain = 'cosmos'
      try {
        if (isAptosAddress(address)) {
          chain = 'movement'
        } else if (isEthAddress(address)) {
          chain = 'ethereum'
        } else if (address.startsWith('tb1q')) {
          chain = 'bitcoinSignet'
        } else if (address.startsWith('bc1q')) {
          chain = 'bitcoin'
        } else {
          const { prefix } = bech32.decode(address)
          chain = addressPrefixes[prefix] as SupportedChain
          if (prefix === 'init') {
            chain = selectedAddress?.chainName as SupportedChain
          }
        }
      } catch (error) {
        if (isSolanaAddress(address)) {
          chain = 'solana'
        }
      }
      if (!selectedToken) {
        setSelectedChain(chain)
      }
    }
  }, [
    addressPrefixes,
    selectedAddress?.address,
    selectedAddress?.chainName,
    selectedAddress?.ethAddress,
    selectedToken,
    setSelectedChain,
  ])

  useEffect(() => {
    if (!selectedAddress?.address) {
      return
    }

    /**
     * Bitcoin address validation
     */
    if (isBitcoinChain(sendActiveChain)) {
      if (
        !isValidBtcAddress(
          selectedAddress.address,
          sendSelectedNetwork === 'mainnet' ? 'mainnet' : 'testnet',
        )
      ) {
        setAddressError('The entered address is invalid')
      } else {
        setAddressError(undefined)
      }
      return
    }

    /**
     * EVM address validation
     */
    if (activeChainInfo?.evmOnlyChain) {
      if (
        !isEthAddress(selectedAddress.address) &&
        !isEthAddress(selectedAddress?.ethAddress ?? '')
      ) {
        setAddressError('The entered address is invalid')
      } else {
        setAddressError(undefined)
      }
      return
    }

    /**
     * Move/Aptos address validation
     */
    if (isAptosChain(sendActiveChain)) {
      if (!isAptosAddress(selectedAddress.address)) {
        setAddressError('The entered address is invalid')
      } else {
        setAddressError(undefined)
      }
      return
    }

    /**
     * Sui address validation
     */
    if (isSuiChain(sendActiveChain)) {
      if (!isValidSuiAddress(selectedAddress.address)) {
        setAddressError('The entered address is invalid')
      } else {
        setAddressError(undefined)
      }
      return
    }

    /**
     * Solana address validation
     */
    if (isSolanaChain(sendActiveChain)) {
      if (!isSolanaAddress(selectedAddress.address)) {
        setAddressError('The entered address is invalid')
      } else {
        setAddressError(undefined)
      }
      return
    }

    setAddressError(undefined)
    // TODO: Add this. but also allow for hex addresses in some chains case
    // /**
    //  * Cosmos address validation
    //  */
    // if (
    //   !selectedAddress.address?.startsWith('bc1q') &&
    //   !selectedAddress.address?.startsWith('tb1q') &&
    //   !isValidAddress(selectedAddress.address)
    // ) {
    //   setAddressError('The entered address is invalid')
    // } else {
    //   setAddressError(undefined)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress?.address, sendActiveChain, sendSelectedNetwork, activeChainInfo])

  useEffect(() => {
    if (
      selectedToken &&
      selectedToken.tokenBalanceOnChain &&
      sendActiveChain !== selectedToken.tokenBalanceOnChain
    ) {
      setSelectedChain(selectedToken.tokenBalanceOnChain)
    }
  }, [selectedToken, sendActiveChain])

  const isNotIBCError = addressError
    ? !addressError.includes('IBC transfers are not supported')
    : false

  return (
    <>
      {selectedAddress ? (
        <>
          <PageHeader>
            <ArrowLeft
              size={36}
              className='text-monochrome cursor-pointer p-2'
              onClick={() => navigate(-1)}
            />

            <WalletButtonV2
              className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
              walletName={walletName}
              showWalletAvatar={true}
              walletAvatar={walletAvatar}
              showDropdown={true}
              handleDropdownClick={handleOpenWalletSheet}
            />
          </PageHeader>

          {/* <div className='flex flex-1 flex-col justify-between w-full gap-3 relative overflow-y-scroll h-full'> */}
          <div className='flex flex-col w-full h-full gap-3 relative pt-6'>
            <AmountCard
              rootBalanceStore={rootBalanceStore}
              isAllAssetsLoading={isAllAssetsLoading}
              rootDenomsStore={rootDenomsStore}
              rootCW20DenomsStore={rootCW20DenomsStore}
              rootERC20DenomsStore={rootERC20DenomsStore}
              evmBalanceStore={evmBalanceStore}
              resetForm={resetForm}
            />
            <div className=' bg-secondary-100 rounded-xl mx-6'>
              <div className='w-full p-5 flex flex-col gap-4'>
                <div className='flex justify-between items-center w-full'>
                  <p className='text-muted-foreground text-sm font-medium !leading-[22.4px]'>
                    Recipient
                  </p>
                  {isIBCTransfer && sendSelectedNetwork === 'mainnet' && destChainInfo ? (
                    <div className='flex w-fit gap-0.5 py-0.5 px-[10px] bg-[#0A84FF] rounded-3xl items-center'>
                      <Images.Misc.IbcProtocol color='#fff' />
                      <Text
                        size='xs'
                        color='text-white-100'
                        className='whitespace-nowrap font-medium'
                      >
                        IBC Transfer
                      </Text>
                    </div>
                  ) : null}
                </div>
                <div className='flex justify-between items-center w-full'>
                  <div className='flex gap-4 items-center'>
                    <img
                      className='h-11 w-11 rounded-full'
                      src={selectedAddress.avatarIcon || Images.Misc.getWalletIconAtIndex(0)}
                    />

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
                      setAddressError(undefined)
                      setSelectedAddress(null)
                      setShowSelectRecipient(true)
                    }}
                  />
                </div>
              </div>
              <ErrorWarning />
            </div>
            <Memo />
            <div className='mx-6'>
              <ErrorChannel />
            </div>

            <ReviewTransfer setShowTxPage={setShowTxPage} />
          </div>
          {/* </div> */}
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
          onClose={(clear) => {
            setShowTxPage(false)
            if (clear) {
              setInputAmount('')
              setResetForm(true)
              setTimeout(() => setResetForm(false), 2000)
            }
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
        title='Your Wallets'
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
