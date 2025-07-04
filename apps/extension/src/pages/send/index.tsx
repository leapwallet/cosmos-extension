import {
  getKeyToUseForDenoms,
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
  isEthAddress,
  isSolanaAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Token } from '@leapwallet/cosmos-wallet-store'
import {
  Asset,
  SkipDestinationChain,
  useSkipDestinationChains,
  useSkipSupportedChains,
} from '@leapwallet/elements-hooks'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { bech32 } from 'bech32'
import { BigNumber } from 'bignumber.js'
import { WalletButtonV2 } from 'components/button'
import { PageHeader } from 'components/header/PageHeaderV2'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useWalletInfo } from 'hooks'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import useQuery from 'hooks/useQuery'
import { observer } from 'mobx-react-lite'
import SelectWallet from 'pages/home/SelectWallet/v2'
import TxPage, { TxType } from 'pages/nfts/send-nft/TxPage'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { chainFeatureFlagsStore, evmBalanceStore } from 'stores/balance-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import {
  rootCW20DenomsStore,
  rootDenomsStore,
  rootERC20DenomsStore,
} from 'stores/denoms-store-instance'
import { manageChainsStore } from 'stores/manage-chains-store'
import { rootBalanceStore } from 'stores/root-store'
import { AggregatedSupportedChain } from 'types/utility'
import { AddressBook } from 'utils/addressbook'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

import { AmountCard } from './components/amount-card'
import { SelectTokenSheet } from './components/amount-card/select-token-sheet'
import { ErrorChannel } from './components/error-warning'
import { Memo } from './components/memo'
import RecipientCard from './components/recipient-card'
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
  const locationState = useLocation().state
  const activeChain = useActiveChain()
  const [amount, setAmount] = useState('')
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
    setGasError,
    setInputAmount,
    setFeeDenom,
    setSelectedToken,
  } = useSendContext()

  const assetCoinDenom = useQuery().get('assetCoinDenom') ?? undefined
  const chainId = useQuery().get('chainId') ?? undefined
  const [showTxPage, setShowTxPage] = useState(false)
  const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState(false)
  const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(!assetCoinDenom)
  const [selectedContact, setSelectedContact] = useState<AddressBook.SavedAddress | undefined>()
  const [inputInProgress, setInputInProgress] = useState<boolean>(false)
  const [resetForm, setResetForm] = useState(false)

  const chainInfos = chainInfoStore.chainInfos

  usePerformanceMonitor({
    page: 'send',
    queryStatus: isAllAssetsLoading ? 'loading' : 'success',
    op: 'sendPageLoad',
    description: 'loading state on send page',
  })

  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])

  const handleCloseRecipientSheet = useCallback(() => {
    setShowSelectRecipient(false)
  }, [])

  const handleCloseTokenSelectSheet = useCallback(
    (isTokenSelected?: boolean) => {
      if (!selectedToken && !isTokenSelected) {
        navigate(-1)
      } else {
        setShowTokenSelectSheet(false)
      }
    },
    [navigate, selectedToken],
  )

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
  const { getAggregatedSpendableBalances } = rootBalanceStore
  const evmBalance = evmBalanceStore.evmBalance
  const { data: featureFlags } = useFeatureFlags()
  const selectedNetwork = useSelectedNetwork()
  const inputRef = useRef<HTMLInputElement | null>(null)

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

  const allAssets = rootBalanceStore.getAggregatedSpendableBalances(selectedNetwork)
  const assets = useMemo(() => {
    const _assets = allAssets

    return _assets.sort((a, b) => Number(b.usdValue) - Number(a.usdValue))
  }, [allAssets])

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
    if (
      selectedToken &&
      selectedToken.tokenBalanceOnChain &&
      sendActiveChain !== selectedToken.tokenBalanceOnChain
    ) {
      setSelectedChain(selectedToken.tokenBalanceOnChain)
    }
  }, [selectedToken, sendActiveChain])

  const updateSelectedToken = useCallback(
    (token: Token | null) => {
      setSelectedToken(token)
      setSelectedChain(token?.tokenBalanceOnChain || null)

      if (token && token?.isEvm) {
        setFeeDenom({
          coinMinimalDenom: token.coinMinimalDenom,
          coinDecimals: token.coinDecimals ?? 6,
          coinDenom: token.symbol,
          icon: token.img,
          coinGeckoId: token.coinGeckoId ?? '',
          chain: token.chain ?? '',
        })
      }

      if (token && (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY) {
        const _token =
          Object.values(
            chainInfos[token.tokenBalanceOnChain as SupportedChain]?.nativeDenoms,
          )?.[0] || token

        setFeeDenom({
          coinMinimalDenom: _token.coinMinimalDenom,
          coinDecimals: _token.coinDecimals ?? 6,
          coinDenom: _token.coinDenom || token.symbol,
          icon: _token.icon || token.img,
          coinGeckoId: _token.coinGeckoId ?? '',
          chain: _token.chain ?? '',
        })
      }
    },
    [setSelectedToken, activeChain, setSelectedChain, setFeeDenom, chainInfos],
  )

  const isTokenStatusSuccess = useMemo(() => {
    let status = isAllAssetsLoading === false
    const addEvmDetails = chainInfos?.[sendActiveChain]?.evmOnlyChain ?? false

    if (addEvmDetails) {
      status = status && evmBalance.status === 'success'
    }
    return status
  }, [chainInfos, evmBalance.status, isAllAssetsLoading, sendActiveChain])

  useEffect(() => {
    if (!selectedToken && !assetCoinDenom && isTokenStatusSuccess) {
      if (locationState && (locationState as Token).coinMinimalDenom) {
        const token = locationState as Token
        updateSelectedToken(token)
      }
    }
  }, [
    assets,
    locationState,
    isTokenStatusSuccess,
    selectedToken,
    updateSelectedToken,
    assetCoinDenom,
    selectedChain,
  ])

  useEffect(() => {
    if (assetCoinDenom) {
      const tokenFromParams: Token | null =
        assets.find((asset) => {
          if (assetCoinDenom?.startsWith('ibc/')) {
            return asset.ibcDenom === assetCoinDenom
          }
          if (
            getKeyToUseForDenoms(asset.ibcDenom || asset.coinMinimalDenom, asset.chain || '') ===
            getKeyToUseForDenoms(assetCoinDenom, chainId || '')
          ) {
            return true
          }
          return false
        }) || null
      updateSelectedToken(tokenFromParams)
    } else if (chainId) {
      const tokenFromParams: Token | null =
        assets.find((asset) => new BigNumber(asset.amount).gt(0)) || null
      updateSelectedToken(tokenFromParams)
    }
  }, [chainId, assetCoinDenom, activeChain, assets, updateSelectedToken])

  const isNotIBCError = addressError
    ? !addressError.includes('IBC transfers are not supported')
    : false

  return (
    <>
      {selectedToken ? (
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
              setShowTokenSelectSheet={setShowTokenSelectSheet}
              isTokenStatusSuccess={isTokenStatusSuccess}
              setAmount={setAmount}
              amount={amount}
            />
            <RecipientCard
              ref={inputRef}
              isIBCTransfer={isIBCTransfer}
              sendSelectedNetwork={sendSelectedNetwork}
              destChainInfo={destChainInfo}
              selectedAddress={selectedAddress}
              activeChain={activeChain}
              setSelectedContact={setSelectedContact}
              setShowSelectRecipient={setShowSelectRecipient}
              setIsAddContactSheetVisible={setIsAddContactSheetVisible}
              setInputInProgress={setInputInProgress}
              inputInProgress={inputInProgress}
              chainInfoStore={chainInfoStore}
              chainFeatureFlagsStore={chainFeatureFlagsStore}
            />
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
        isOpen={showSelectRecipient && !isAddContactSheetVisible}
        onClose={handleCloseRecipientSheet}
        postSelectRecipient={() => {
          setInputInProgress(false)
        }}
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

      <SelectTokenSheet
        denoms={rootDenomsStore.allDenoms}
        isOpen={showTokenSelectSheet}
        assets={assets}
        selectedToken={selectedToken}
        onClose={handleCloseTokenSelectSheet}
        onTokenSelect={(token) => {
          updateSelectedToken(token)
          setGasError('')
          setAmount('')
          inputRef.current?.focus()
        }}
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
