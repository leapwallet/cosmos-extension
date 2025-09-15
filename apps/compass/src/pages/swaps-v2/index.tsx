import { useActiveWallet, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore } from '@leapwallet/cosmos-wallet-store'
import { Faders } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import { WalletButton } from 'components/button'
import { PageHeader } from 'components/header'
import { SideNavMenuOpen } from 'components/header/sidenav-menu'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { PageName } from 'config/analytics'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useNonNativeCustomChains } from 'hooks/useNonNativeCustomChains'
import useQuery from 'hooks/useQuery'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import SelectWallet from 'pages/home/SelectWallet'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { activeChainStore } from 'stores/active-chain-store'
import { cw20TokenBalanceStore, priceStore } from 'stores/balance-store'
import { compassTokensAssociationsStore } from 'stores/chain-infos-store'
import {
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  compassTokenTagsStore,
  cw20DenomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  erc20DenomsStore,
  rootDenomsStore,
  whitelistedFactoryTokensStore,
} from 'stores/denoms-store-instance'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'
import { SourceToken } from 'types/swap'

import {
  InterchangeButton,
  MoreDetailsSheet,
  SelectTokenSheet,
  SlippageInfoSheet,
  SlippageSheet,
  SwapInfo,
  SwapTxPage,
  TokenInputCard,
  TxReviewSheet,
} from './components'
import FeesSheet from './components/FeesSheet'
import { WarningsSection } from './components/WarningsSection'
import { SwapContextProvider, useSwapContext } from './context'
import { isNoRoutesAvailableError } from './hooks'
import { getConversionRateRemark, getPriceImpactVars } from './utils/priceImpact'

const SwapSkeleton = () => {
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const navigate = useNavigate()
  const { walletAvatar, walletName } = useWalletInfo()
  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])
  return (
    <>
      <PageHeader>
        <SideNavMenuOpen />

        <WalletButton
          className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
          walletName={walletName}
          showWalletAvatar={true}
          walletAvatar={walletAvatar}
          showDropdown={true}
          handleDropdownClick={handleOpenWalletSheet}
        />
      </PageHeader>

      <div className='flex flex-1 flex-col justify-between p-4 w-full gap-3 relative'>
        <div className='flex flex-col w-full gap-4 relative p-2'>
          <div className='w-full flex flex-col items-center gap-y-1'>
            <TokenInputCard
              loadingAssets={false}
              showFor='source'
              isInputInUSDC={false}
              setIsInputInUSDC={() => {}}
              value=''
              balanceStatus='loading'
              readOnly={true}
              textInputValue=''
              setTextInputValue={() => {}}
            />
            <InterchangeButton isSwitchOrderPossible={false} handleSwitchOrder={() => {}} />
            <TokenInputCard
              loadingAssets={false}
              showFor='destination'
              isInputInUSDC={false}
              setIsInputInUSDC={() => {}}
              value=''
              balanceStatus='loading'
              readOnly={true}
              textInputValue=''
              setTextInputValue={() => {}}
            />
          </div>
        </div>
      </div>

      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => {
          setShowSelectWallet(false)
          navigate('/home')
        }}
        title='Wallets'
      />
    </>
  )
}

const SwapPage = observer(() => {
  const navigate = useNavigate()
  const defaultTokenLogo = useDefaultTokenLogo()
  const counter = useRef(0)
  const intervalTimeout = useRef<NodeJS.Timeout>()

  const activeWallet = useActiveWallet()
  const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(false)
  const [showSelectSheetFor, setShowSelectSheetFor] = useState<'source' | 'destination' | ''>(
    'source',
  )
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [showSelectWallet, setShowSelectWallet] = useState(false)

  const [showTxReviewSheet, setShowTxReviewSheet] = useState<boolean>(false)
  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)
  const [isPriceImpactChecked, setIsPriceImpactChecked] = useState<boolean>(false)
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)

  const [showMoreDetailsSheet, setShowMoreDetailsSheet] = useState<boolean>(false)
  const [showTxPage, setShowTxPage] = useState<boolean>(false)
  const [showSlippageSheet, setShowSlippageSheet] = useState(false)
  const [showSlippageInfo, setShowSlippageInfo] = useState(false)
  const [ledgerError, setLedgerError] = useState<string>()
  const [isInputInUSDC, setIsInputInUSDC] = useState<boolean>(false)
  const [showMainnetAlert, setShowMainnetAlert] = useState<boolean>(false)
  const [isQuoteReady, setIsQuoteReady] = useState<boolean>(false)
  const [isQuoteReadyEventLogged, setIsQuoteReadyEventLogged] = useState<boolean>(false)

  const customChains = useNonNativeCustomChains()
  const selectedNetwork = useSelectedNetwork()

  const { walletAvatar, walletName } = useWalletInfo()

  useEffect(() => {
    if (selectedNetwork === 'testnet') {
      setShowMainnetAlert(true)
      const timeout = setTimeout(() => {
        setShowMainnetAlert(false)
      }, 10000)
      return () => clearTimeout(timeout)
    }
  }, [selectedNetwork])

  const {
    inAmount,
    sourceToken,
    loadingSourceAssets,
    sourceChain,
    sourceTokenBalanceStatus,
    handleInAmountChange,
    sourceAssets,
    loadingChains,
    chainsToShow,
    invalidAmount,
    amountExceedsBalance,
    amountOut,
    destinationToken,
    destinationChain,
    loadingDestinationAssets,
    destinationTokenBalancesStatus,
    destinationAssets,
    reviewBtnDisabled,
    setSourceToken,
    setDestinationToken,
    setSourceChain,
    setDestinationChain,
    refresh,
    handleSwitchOrder,
    isSwitchOrderPossible,
    setInAmount,
    displayFee,
    errorMsg,
    feeDenom,
    routingInfo,
    isChainAbstractionView,
    loadingRoutes,
    slippagePercent,
  } = useSwapContext()
  const [textInputValue, setTextInputValue] = useState<string>(inAmount?.toString())
  const [textOutputValue, setTextOutputValue] = useState<string>(
    amountOut ? Number(amountOut).toFixed(6) : amountOut,
  )
  const { priceImpactPercent, usdValueDecreasePercent } = getPriceImpactVars(
    routingInfo?.route,
    sourceToken,
    destinationToken,
    Object.assign({}, rootDenomsStore.allDenoms, compassTokenTagsStore.compassTokenDenomInfo),
  )

  const checkNeeded = useMemo(() => {
    return (
      getConversionRateRemark(
        routingInfo.route,
        sourceToken,
        destinationToken,
        Object.assign({}, rootDenomsStore.allDenoms, compassTokenTagsStore.compassTokenDenomInfo),
      ) === 'request-confirmation'
    )
  }, [routingInfo.route, sourceToken, destinationToken])

  useEffect(() => {
    if (checkNeeded) {
      setIsPriceImpactChecked(false)
    } else {
      setIsPriceImpactChecked(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkNeeded])

  const uncheckWarnings = useCallback(() => {
    setIsPriceImpactChecked(false)
  }, [])

  useEffect(() => {
    if (
      Number(amountOut) &&
      ![showSlippageSheet, showTokenSelectSheet, showTxPage, showTxReviewSheet].includes(true)
    ) {
      intervalTimeout.current = setInterval(async () => {
        if (counter.current === 10) {
          counter.current = 0
          setIsRefreshing(true)
          uncheckWarnings()

          try {
            await refresh()
          } catch (_) {
            //
          }
          setIsRefreshing(false)
          return
        }

        counter.current += 1
      }, 1000)
    } else {
      counter.current = 0
    }

    return () => clearInterval(intervalTimeout.current)
  }, [
    amountOut,
    refresh,
    showSlippageSheet,
    showTokenSelectSheet,
    showTxPage,
    showTxReviewSheet,
    uncheckWarnings,
  ])

  const additionalProperties = useMemo(() => {
    let inAmountDollarValue, outAmountDollarValue
    if (
      sourceToken?.usdPrice &&
      !isNaN(parseFloat(sourceToken?.usdPrice)) &&
      inAmount &&
      !isNaN(parseFloat(inAmount))
    ) {
      inAmountDollarValue = parseFloat(sourceToken?.usdPrice) * parseFloat(inAmount)
    }
    if (
      destinationToken?.usdPrice &&
      !isNaN(parseFloat(destinationToken?.usdPrice)) &&
      amountOut &&
      !isNaN(parseFloat(amountOut))
    ) {
      outAmountDollarValue = parseFloat(destinationToken.usdPrice) * parseFloat(amountOut)
    }
    return {
      pageName: PageName.SwapsQuoteReady,
      priceImpactPercent: priceImpactPercent?.toNumber(),
      balanceSufficient: !amountExceedsBalance,
      routePresent: !!routingInfo?.route,
      userApproval: checkNeeded
        ? 'High Price Impact'
        : usdValueDecreasePercent.isNaN()
        ? 'Token Price Unavailable'
        : '',
      fromToken: sourceToken?.symbol,
      fromTokenAmount: inAmountDollarValue,
      fromChain: sourceChain?.chainName ?? '',
      toToken: destinationToken?.symbol,
      toChain: destinationChain?.chainName,
      toTokenAmount: outAmountDollarValue,
      transactionCount: routingInfo?.route?.transactionCount,
    }
  }, [
    amountExceedsBalance,
    amountOut,
    checkNeeded,
    destinationChain?.chainName,
    destinationToken?.symbol,
    destinationToken?.usdPrice,
    inAmount,
    priceImpactPercent,
    routingInfo?.route,
    sourceChain?.chainName,
    sourceToken?.symbol,
    sourceToken?.usdPrice,
    usdValueDecreasePercent,
  ])

  useEffect(() => {
    if (isQuoteReady && !isQuoteReadyEventLogged) {
      try {
        setIsQuoteReadyEventLogged(true)
      } catch (error) {
        // ignore
      }
    }
  }, [additionalProperties, isQuoteReady, isQuoteReadyEventLogged])

  useEffect(() => {
    setIsQuoteReadyEventLogged(false)
  }, [inAmount, sourceToken, destinationToken])

  useEffect(() => {
    if (
      parseFloat(inAmount) > 0 &&
      !loadingRoutes &&
      (isNoRoutesAvailableError(errorMsg) || (!!routingInfo?.route && parseFloat(amountOut) > 0))
    ) {
      setIsQuoteReady(true)
    } else {
      setIsQuoteReady(false)
    }
  }, [
    inAmount,
    loadingRoutes,
    routingInfo?.route,
    priceImpactPercent,
    checkNeeded,
    amountExceedsBalance,
    amountOut,
    errorMsg,
  ])

  const _chainsToShow = useMemo(() => {
    if (activeWallet && activeWallet.walletType === WALLETTYPE.LEDGER) {
      return chainsToShow.filter((chain) => {
        const chainInfo = Object.values(ChainInfos).find(
          (chainInfo) => chainInfo.chainId === chain.chainId,
        )
        if (!chainInfo) return false
        const hasAddress = activeWallet.addresses[chainInfo.key]
        return hasAddress
      })
    }
    return chainsToShow
  }, [activeWallet, chainsToShow])

  const reviewBtnText = useMemo(() => {
    if (inAmount === '') {
      return 'Enter amount'
    }
    if (invalidAmount) {
      return 'Amount must be greater than 0'
    }
    if (amountExceedsBalance) {
      return 'Insufficient balance'
    }
    if (isNoRoutesAvailableError(errorMsg)) {
      return 'No transaction routes available'
    }
    if (
      activeChainStore.activeChain === 'evmos' &&
      activeWallet?.walletType === WALLETTYPE.LEDGER
    ) {
      return 'Not supported using Ledger wallet'
    }
    return 'Review Swap'
  }, [activeWallet?.walletType, amountExceedsBalance, errorMsg, inAmount, invalidAmount])

  const reviewDisabled = useMemo(() => {
    if (
      activeChainStore.activeChain === 'evmos' &&
      activeWallet?.walletType === WALLETTYPE.LEDGER
    ) {
      return true
    }
    return reviewBtnDisabled || isRefreshing || (checkNeeded && !isPriceImpactChecked)
  }, [activeWallet?.walletType, checkNeeded, isPriceImpactChecked, isRefreshing, reviewBtnDisabled])

  const autoAdjustAmountFee = useMemo(() => {
    if (!displayFee || !feeDenom) return null

    return {
      amount: toSmall(String(displayFee.value), feeDenom.coinDecimals),
      denom: feeDenom.coinMinimalDenom,
    }
  }, [displayFee, feeDenom])

  const sourceTokenLoading = useMemo(() => {
    return (
      loadingChains ||
      loadingSourceAssets ||
      (isChainAbstractionView && sourceToken?.amount === '0'
        ? sourceTokenBalanceStatus === 'loading'
        : false)
    )
  }, [
    isChainAbstractionView,
    loadingChains,
    loadingSourceAssets,
    sourceToken,
    sourceTokenBalanceStatus,
  ])

  const autoAdjustAmountToken = useMemo(() => {
    if (!sourceToken) return null

    return {
      amount: sourceToken.amount,
      coinMinimalDenom: sourceToken.coinMinimalDenom,
      chain: sourceToken?.skipAsset?.originChainId,
    }
  }, [sourceToken])

  const handleOnSettingsClick = useCallback(() => {
    setShowSlippageSheet(true)
  }, [setShowSlippageSheet])

  const handleInputAmountChange = useCallback(
    (value: string) => {
      handleInAmountChange(value)
      uncheckWarnings()
    },
    [handleInAmountChange, uncheckWarnings],
  )

  const handleInputTokenSelectSheetOpen = useCallback(() => {
    setShowTokenSelectSheet(true)
    setShowSelectSheetFor('source')
    uncheckWarnings()
  }, [setShowTokenSelectSheet, setShowSelectSheetFor, uncheckWarnings])

  const handleInputChainSelectSheetOpen = useCallback(() => {
    setShowSelectSheetFor('source')
    uncheckWarnings()
  }, [uncheckWarnings, setShowSelectSheetFor])

  const handleOutputTokenSelectSheetOpen = useCallback(() => {
    setShowTokenSelectSheet(true)
    setShowSelectSheetFor('destination')
    uncheckWarnings()
  }, [setShowTokenSelectSheet, setShowSelectSheetFor, uncheckWarnings])

  const handleOutputChainSelectSheetOpen = useCallback(() => {
    setShowSelectSheetFor('destination')
    uncheckWarnings()
  }, [uncheckWarnings, setShowSelectSheetFor])

  const handleOnTokenSelectSheetClose = useCallback(() => {
    setShowTokenSelectSheet(false)
    setShowSelectSheetFor('')
  }, [setShowTokenSelectSheet, setShowSelectSheetFor])

  const handleSetToken = useCallback(
    (token: SourceToken) => {
      const chain = _chainsToShow.find((chain) => chain.chainId === token.skipAsset.chainId)
      if (showSelectSheetFor === 'source') {
        if (isChainAbstractionView) {
          setSourceChain(chain)
        }
        setSourceToken(token)
      } else if (showSelectSheetFor === 'destination') {
        if (isChainAbstractionView) {
          setDestinationChain(chain)
        }
        setDestinationToken(token)
      }
      setShowTokenSelectSheet(false)
      setShowSelectSheetFor('')
    },
    [
      _chainsToShow,
      showSelectSheetFor,
      isChainAbstractionView,
      setSourceToken,
      setSourceChain,
      setDestinationToken,
      setDestinationChain,
    ],
  )

  const handleOnTokenSelect = useCallback(
    (token: SourceToken) => {
      const customChain = Object.values(customChains).find(
        (_customChain) => _customChain.chainId === token.skipAsset.chainId,
      )
      if (customChain) {
        return
      }
      handleSetToken(token)
    },
    [customChains, handleSetToken],
  )

  const handleOnSlippageInfoClick = useCallback(() => {
    setShowSlippageInfo(true)
  }, [setShowSlippageInfo])

  const handleOnSlippageInfoSheetClose = useCallback(() => {
    setShowSlippageInfo(false)
  }, [setShowSlippageInfo])

  const handleOnSlippageSheetClose = useCallback(() => {
    setShowSlippageSheet(false)
  }, [setShowSlippageSheet])

  const handleOnMoreDetailsSheetClose = useCallback(() => {
    setShowMoreDetailsSheet(false)
  }, [setShowMoreDetailsSheet])

  const handleOnAutoAdjustmentSheetClose = useCallback(() => {
    setCheckForAutoAdjust(false)
  }, [setCheckForAutoAdjust])

  const handleOnTxReviewSheetClose = useCallback(() => {
    setShowTxReviewSheet(false)
  }, [setShowTxReviewSheet])

  const handleOnTxReviewSheetProceed = useCallback(() => {
    setShowTxReviewSheet(false)
    setShowTxPage(true)
    setTextOutputValue('')
    ledgerError && setLedgerError(undefined)
  }, [setShowTxReviewSheet, setShowTxPage, ledgerError])

  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])

  const handleOnTxPageClose = useCallback(() => {
    setShowTxPage(false)
    setTextInputValue('')
    setTextOutputValue('')
  }, [])

  const swapTxPageSetLedgerError = useCallback(
    (ledgerError?: string) => {
      setLedgerError(ledgerError)
      ledgerError && setShowTxPage(false)
    },
    [setLedgerError, setShowTxPage],
  )

  usePerformanceMonitor({
    page: 'swaps',
    queryStatus: sourceTokenLoading || loadingDestinationAssets ? 'loading' : 'success',
    op: 'swapsPageLoad',
    description: 'loading state on swaps page',
  })

  return (
    <>
      <PageHeader>
        <SideNavMenuOpen />

        <WalletButton
          className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
          walletName={walletName}
          showWalletAvatar={true}
          walletAvatar={walletAvatar}
          showDropdown={true}
          handleDropdownClick={handleOpenWalletSheet}
        />

        <button
          onClick={handleOnSettingsClick}
          className='text-black-100 dark:text-white-100 flex items-center gap-x-0.5 p-3'
        >
          <Faders
            size={24}
            className='!leading-[24px] rotate-90 text-muted-foreground hover:text-foreground'
          />
          {slippagePercent !== 0.5 && (
            <Text size='sm' className='font-bold'>
              {slippagePercent}%
            </Text>
          )}
        </button>
      </PageHeader>

      {!!showMainnetAlert && (
        <div className='flex flex-col items-center justify-center px-4 py-2 bg-[#0D9488]'>
          <Text size='xs' color='dark:text-white-100 text-white-100' className='font-bold'>
            Switched to mainnet for swaps
          </Text>
        </div>
      )}

      <div className='flex flex-1 flex-col justify-between p-4 !pb-[64px] w-full gap-3 relative overflow-y-scroll'>
        <div className={classNames('flex flex-col w-full gap-4 relative p-2')}>
          <div className='w-full flex flex-col items-center gap-y-1'>
            <TokenInputCard
              value={inAmount}
              isInputInUSDC={isInputInUSDC}
              setIsInputInUSDC={setIsInputInUSDC}
              token={sourceToken}
              balanceStatus={sourceTokenBalanceStatus}
              loadingAssets={sourceTokenLoading}
              loadingChains={loadingChains}
              chainName={sourceChain?.chainName}
              chainLogo={sourceChain?.icon ?? defaultTokenLogo}
              onChange={handleInputAmountChange}
              selectTokenDisabled={sourceAssets.length === 0 || !sourceChain}
              selectChainDisabled={_chainsToShow.length === 0}
              onTokenSelectSheet={handleInputTokenSelectSheetOpen}
              onChainSelectSheet={handleInputChainSelectSheetOpen}
              amountError={amountExceedsBalance || invalidAmount}
              showFor='source'
              selectedChain={isChainAbstractionView ? sourceChain : undefined}
              isChainAbstractionView={isChainAbstractionView}
              textInputValue={textInputValue}
              setTextInputValue={setTextInputValue}
            />

            <InterchangeButton
              isSwitchOrderPossible={isSwitchOrderPossible}
              handleSwitchOrder={handleSwitchOrder}
            />

            <TokenInputCard
              readOnly
              isInputInUSDC={isInputInUSDC}
              setIsInputInUSDC={setIsInputInUSDC}
              value={amountOut ? Number(amountOut).toFixed(6) : amountOut}
              token={destinationToken}
              balanceStatus={destinationTokenBalancesStatus}
              loadingChains={loadingChains}
              loadingAssets={loadingChains || loadingDestinationAssets}
              chainName={destinationChain?.chainName}
              chainLogo={destinationChain?.icon ?? defaultTokenLogo}
              selectTokenDisabled={destinationAssets.length === 0 || !destinationChain}
              selectChainDisabled={_chainsToShow.length === 0}
              onTokenSelectSheet={handleOutputTokenSelectSheetOpen}
              onChainSelectSheet={handleOutputChainSelectSheetOpen}
              isChainAbstractionView={isChainAbstractionView}
              showFor='destination'
              textInputValue={textOutputValue}
              setTextInputValue={setTextOutputValue}
            />
          </div>

          <WarningsSection
            isPriceImpactChecked={isPriceImpactChecked}
            setIsPriceImpactChecked={setIsPriceImpactChecked}
            ledgerError={ledgerError}
          />

          <SwapInfo
            setShowMoreDetailsSheet={setShowMoreDetailsSheet}
            rootDenomsStore={rootDenomsStore}
          />

          <Button
            className={classNames('w-full', {
              '!bg-red-300 text-white-100':
                invalidAmount || amountExceedsBalance || isNoRoutesAvailableError(errorMsg),
              'mt-2': inAmount === '',
              'mt-1': inAmount !== '',
            })}
            disabled={reviewDisabled}
            onClick={() => {
              if (activeWallet?.watchWallet) {
                globalSheetsStore.setImportWatchWalletSeedPopupOpen(true)
              } else {
                setCheckForAutoAdjust(true)
              }
            }}
          >
            {reviewBtnText}
          </Button>
        </div>
      </div>

      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => {
          setShowSelectWallet(false)
          navigate('/home')
        }}
        title='Wallets'
      />
      <SelectTokenSheet
        isOpen={showTokenSelectSheet}
        sourceAssets={sourceAssets}
        destinationAssets={destinationAssets}
        sourceToken={sourceToken}
        selectedChain={showSelectSheetFor === 'source' ? sourceChain : destinationChain}
        destinationToken={destinationToken}
        showFor={showSelectSheetFor}
        onClose={handleOnTokenSelectSheetClose}
        onTokenSelect={handleOnTokenSelect}
        rootDenomsStore={rootDenomsStore}
        whitelistedFactorTokenStore={whitelistedFactoryTokensStore}
        isChainAbstractionView={isChainAbstractionView}
        loadingTokens={
          showSelectSheetFor === 'source' ? loadingSourceAssets : loadingDestinationAssets
        }
      />
      <MoreDetailsSheet
        isOpen={showMoreDetailsSheet}
        onClose={handleOnMoreDetailsSheetClose}
        onSlippageInfoClick={handleOnSlippageInfoClick}
        setShowFeesSettingSheet={setShowFeesSettingSheet}
      />
      <SlippageSheet
        isOpen={showSlippageSheet}
        onClose={handleOnSlippageSheetClose}
        onSlippageInfoClick={handleOnSlippageInfoClick}
      />
      <SlippageInfoSheet isOpen={showSlippageInfo} onClose={handleOnSlippageInfoSheetClose} />
      {checkForAutoAdjust &&
        autoAdjustAmountFee &&
        autoAdjustAmountToken &&
        inAmount &&
        sourceChain && (
          <AutoAdjustAmountSheet
            amount={inAmount}
            setAmount={setInAmount}
            selectedToken={autoAdjustAmountToken}
            fee={autoAdjustAmountFee}
            forceChain={sourceChain?.key}
            setShowReviewSheet={setShowTxReviewSheet}
            closeAdjustmentSheet={handleOnAutoAdjustmentSheetClose}
          />
        )}
      <TxReviewSheet
        isOpen={showTxReviewSheet}
        onClose={handleOnTxReviewSheetClose}
        onProceed={handleOnTxReviewSheetProceed}
        setShowFeesSettingSheet={setShowFeesSettingSheet}
        onSlippageInfoClick={handleOnSlippageInfoClick}
      />
      {routingInfo?.route?.response && (
        <FeesSheet
          showFeesSettingSheet={showFeesSettingSheet}
          setShowFeesSettingSheet={setShowFeesSettingSheet}
        />
      )}

      {showTxPage ? (
        <SwapTxPage
          onClose={handleOnTxPageClose}
          setLedgerError={swapTxPageSetLedgerError}
          ledgerError={ledgerError}
        />
      ) : null}
    </>
  )
})

const Swap = observer(({ rootBalanceStore }: { rootBalanceStore: RootBalanceStore }) => {
  const [showLoader, setShowLoader] = useState(true)
  const query = useQuery()

  const location = useLocation()

  const totalFiatValue = useMemo(() => {
    return rootBalanceStore
      .getAggregatedBalances('mainnet', undefined)
      .reduce(
        (acc, asset) => (asset.usdValue ? acc.plus(new BigNumber(asset.usdValue)) : acc),
        new BigNumber(0),
      )
      ?.toNumber()
  }, [rootBalanceStore])

  const pageViewAdditionalProperties = useMemo(() => {
    let pageSourceFormatted
    const pageViewSource = query.get('pageSource') ?? undefined
    switch (pageViewSource) {
      case 'bottomNav': {
        pageSourceFormatted = 'Bottom Nav'
        break
      }
      case 'assetDetails': {
        pageSourceFormatted = 'Asset Details'
        break
      }
      case 'banners': {
        pageSourceFormatted = 'Banners'
        break
      }
      case 'swapAgain': {
        pageSourceFormatted = 'Swap Again CTA'
        break
      }
      case 'quickSearch': {
        pageSourceFormatted = 'Quick Search'
        break
      }
      case 'stake': {
        pageSourceFormatted = PageName.Stake
        break
      }
      case PageName.Home: {
        pageSourceFormatted = PageName.Home
        break
      }
      case 'search': {
        pageSourceFormatted = PageName.Search
        break
      }
      case PageName.ZeroState: {
        pageSourceFormatted = PageName.ZeroState
        break
      }
      default: {
        break
      }
    }
    const _properties = { pageViewSource: pageSourceFormatted, userBalance: totalFiatValue }
    if (pageViewSource === 'banners') {
      return {
        ..._properties,
        pageViewSourceDetail: query.get('bannerId') ?? undefined,
      }
    }
    return _properties
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, location?.key])

  useEffect(() => {
    setTimeout(() => {
      setShowLoader(false)
    }, 150)
  }, [])

  if (showLoader) {
    return (
      <div className='h-full'>
        <SwapSkeleton />
      </div>
    )
  }

  return (
    <SwapContextProvider
      rootDenomsStore={rootDenomsStore}
      rootBalanceStore={rootBalanceStore}
      activeChainStore={activeChainStore}
      autoFetchedCW20DenomsStore={autoFetchedCW20DenomsStore}
      betaCW20DenomsStore={betaCW20DenomsStore}
      cw20DenomsStore={cw20DenomsStore}
      cw20DenomBalanceStore={cw20TokenBalanceStore}
      disabledCW20DenomsStore={disabledCW20DenomsStore}
      enabledCW20DenomsStore={enabledCW20DenomsStore}
      betaERC20DenomsStore={betaERC20DenomsStore}
      erc20DenomsStore={erc20DenomsStore}
      compassTokenTagsStore={compassTokenTagsStore}
      compassTokensAssociationsStore={compassTokensAssociationsStore}
      priceStore={priceStore}
    >
      <SwapPage />
    </SwapContextProvider>
  )
})

export default Swap
