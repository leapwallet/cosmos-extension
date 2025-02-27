import { useActiveWallet, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, ChainInfos, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore } from '@leapwallet/cosmos-wallet-store'
import { Buttons } from '@leapwallet/leap-ui'
import { ArrowSquareOut } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { EventName, PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useNonNativeCustomChains } from 'hooks/useNonNativeCustomChains'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import AddFromChainStore from 'pages/home/AddFromChainStore'
import qs from 'qs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
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
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'
import { SourceChain, SourceToken } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

import {
  InterchangeButton,
  MoreDetailsSheet,
  SelectChainSheet,
  SelectTokenSheet,
  SlippageInfoSheet,
  SlippageSheet,
  SwapInfo,
  SwapTxPage,
  TokenInputCard,
  TxReviewSheet,
} from './components'
import { TokenAssociatedChain } from './components/ChainsList'
import FeesSheet from './components/FeesSheet'
import InputPageHeader from './components/InputPageHeader'
import { WarningsSection } from './components/WarningsSection'
import { SwapContextProvider, useSwapContext } from './context'
import { isNoRoutesAvailableError } from './hooks'
import { getConversionRateRemark, getPriceImpactVars } from './utils/priceImpact'

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

  const [showTxReviewSheet, setShowTxReviewSheet] = useState<boolean>(false)
  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)
  const [isPriceImpactChecked, setIsPriceImpactChecked] = useState<boolean>(false)
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)

  const [showMoreDetailsSheet, setShowMoreDetailsSheet] = useState<boolean>(false)
  const [showChainSelectSheet, setShowChainSelectSheet] = useState<boolean>(false)
  const [showTxPage, setShowTxPage] = useState<boolean>(false)
  const [showSlippageSheet, setShowSlippageSheet] = useState(false)
  const [showSlippageInfo, setShowSlippageInfo] = useState(false)
  const [ledgerError, setLedgerError] = useState<string>()
  const [isInputInUSDC, setIsInputInUSDC] = useState<boolean>(false)
  const [showMainnetAlert, setShowMainnetAlert] = useState<boolean>(false)
  const [isQuoteReady, setIsQuoteReady] = useState<boolean>(false)
  const [isQuoteReadyEventLogged, setIsQuoteReadyEventLogged] = useState<boolean>(false)
  const [newChain, setNewChain] = useState<ChainInfo | null>(null)
  const [tokenToSet, setTokenToSet] = useState<SourceToken | null>(null)
  const [chainToSet, setChainToSet] = useState<
    | (TokenAssociatedChain & {
        callbackToUse: 'handleSetDestinationChain' | 'handleSetChain'
      })
    | null
  >(null)

  const chains = useGetChains()
  const customChains = useNonNativeCustomChains()
  const pageViewSource = useQuery().get('pageSource') ?? undefined
  const selectedNetwork = useSelectedNetwork()

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
    redirectUrl,
    isMoreThanOneStepTransaction,
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
  } = useSwapContext()
  const {
    priceImpactPercent,
    usdValueDecreasePercent,
    destinationAssetUSDValue,
    sourceAssetUSDValue,
  } = getPriceImpactVars(
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
      ![
        showChainSelectSheet,
        showSlippageSheet,
        showTokenSelectSheet,
        showTxPage,
        showTxReviewSheet,
      ].includes(true)
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
    showChainSelectSheet,
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
        mixpanel.track(EventName.PageView, additionalProperties)
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

  const { _destinationChainsToShow, _destinationAssets } = useMemo(() => {
    const _destinationAssets = destinationAssets.filter((asset) => {
      return asset.skipAsset.symbol === destinationToken?.skipAsset.symbol
    })

    const _destinationChainsToShow: TokenAssociatedChain[] = []
    _destinationAssets.forEach((asset) => {
      _chainsToShow.forEach((chain) => {
        if (chain.chainId === asset.skipAsset.chainId) {
          _destinationChainsToShow.push({
            chain,
            asset,
          })
        }
      })
    })
    return {
      _destinationAssets,
      _destinationChainsToShow,
    }
  }, [_chainsToShow, destinationToken, destinationAssets])

  const reviewBtnText = useMemo(() => {
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
  }, [activeWallet?.walletType, amountExceedsBalance, errorMsg, invalidAmount])

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

  const emitMixpanelDropdownOpenEvent = useCallback((dropdownType: string) => {
    try {
      mixpanel.track(EventName.DropdownOpened, {
        dropdownType,
      })
    } catch (error) {
      // ignore
    }
  }, [])

  const handleOnBackClick = useCallback(() => {
    if (pageViewSource === 'swapAgain') {
      navigate('/home')
    } else {
      navigate(-1)
    }
  }, [navigate, pageViewSource])

  const handleOnRefreshClick = useCallback(() => {
    refresh()
  }, [refresh])

  const handleOnSettingsClick = useCallback(() => {
    setShowSlippageSheet(true)
  }, [setShowSlippageSheet])

  const handleInputAmountChange = useCallback(
    (value) => {
      handleInAmountChange(value)
      uncheckWarnings()
    },
    [handleInAmountChange, uncheckWarnings],
  )

  const handleInputTokenSelectSheetOpen = useCallback(() => {
    setShowTokenSelectSheet(true)
    setShowSelectSheetFor('source')
    uncheckWarnings()
    emitMixpanelDropdownOpenEvent('Source Token')
  }, [
    setShowTokenSelectSheet,
    setShowSelectSheetFor,
    uncheckWarnings,
    emitMixpanelDropdownOpenEvent,
  ])

  const handleInputChainSelectSheetOpen = useCallback(() => {
    setShowChainSelectSheet(true)
    setShowSelectSheetFor('source')
    uncheckWarnings()
  }, [uncheckWarnings, setShowChainSelectSheet, setShowSelectSheetFor])

  const handleOutputTokenSelectSheetOpen = useCallback(() => {
    setShowTokenSelectSheet(true)
    setShowSelectSheetFor('destination')
    uncheckWarnings()
    emitMixpanelDropdownOpenEvent('Destination Token')
  }, [
    setShowTokenSelectSheet,
    setShowSelectSheetFor,
    uncheckWarnings,
    emitMixpanelDropdownOpenEvent,
  ])

  const handleOutputChainSelectSheetOpen = useCallback(() => {
    setShowChainSelectSheet(true)
    setShowSelectSheetFor('destination')
    uncheckWarnings()
    emitMixpanelDropdownOpenEvent('Destination Chain')
  }, [
    uncheckWarnings,
    setShowChainSelectSheet,
    setShowSelectSheetFor,
    emitMixpanelDropdownOpenEvent,
  ])

  const handleOnChainSelectSheetClose = useCallback(() => {
    setShowChainSelectSheet(false)
    setShowSelectSheetFor('')
  }, [setShowChainSelectSheet, setShowSelectSheetFor])

  const handleSetChain = useCallback(
    (chain: SourceChain) => {
      if (showSelectSheetFor === 'source' && chain.chainId !== sourceChain?.chainId) {
        setSourceChain(chain)
        setSourceToken(null)
      } else if (
        showSelectSheetFor === 'destination' &&
        chain.chainId !== destinationChain?.chainId
      ) {
        setDestinationChain(chain)
        setDestinationToken(null)
      }
      setShowChainSelectSheet(false)
      setShowSelectSheetFor('')
    },
    [
      destinationChain?.chainId,
      setDestinationChain,
      setDestinationToken,
      setSourceChain,
      setSourceToken,
      showSelectSheetFor,
      sourceChain?.chainId,
    ],
  )

  const handleOnChainSelect = useCallback(
    (tokenAssociatedChain: TokenAssociatedChain) => {
      const customChain = Object.values(customChains).find(
        (_customChain) => _customChain.chainId === tokenAssociatedChain.chain.chainId,
      )
      if (customChain) {
        setChainToSet({
          chain: tokenAssociatedChain.chain,
          callbackToUse: 'handleSetChain',
        })
        setNewChain(customChain)
        return
      }
      handleSetChain(tokenAssociatedChain.chain)
    },
    [customChains, handleSetChain],
  )

  const handleSetDestinationChain = useCallback(
    (tokenAssociatedChain: TokenAssociatedChain) => {
      setDestinationChain(tokenAssociatedChain.chain)
      const _destToken = _destinationAssets.find(
        (asset) =>
          asset.skipAsset.chainId === tokenAssociatedChain.chain.chainId &&
          (!tokenAssociatedChain.asset ||
            asset.skipAsset.denom === tokenAssociatedChain.asset.skipAsset.denom),
      )
      setDestinationToken(_destToken as SourceToken)
      setShowChainSelectSheet(false)
      setShowSelectSheetFor('')
    },
    [
      _destinationAssets,
      setDestinationChain,
      setDestinationToken,
      setShowChainSelectSheet,
      setShowSelectSheetFor,
    ],
  )

  const handleOnDestinationChainSelect = useCallback(
    (tokenAssociatedChain: TokenAssociatedChain) => {
      const customChain = Object.values(customChains).find(
        (_customChain) => _customChain.chainId === tokenAssociatedChain.chain.chainId,
      )
      if (customChain) {
        setChainToSet({
          asset: tokenAssociatedChain.asset,
          chain: tokenAssociatedChain.chain,
          callbackToUse: 'handleSetDestinationChain',
        })
        setNewChain(customChain)
        return
      }
      handleSetDestinationChain(tokenAssociatedChain)
    },
    [customChains, handleSetDestinationChain],
  )

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
        setTokenToSet(token)
        setNewChain(customChain)
        return
      }
      handleSetToken(token)
    },
    [customChains, handleSetToken],
  )

  const handlePostAddChainCallback = useCallback(() => {
    setNewChain(null)
    if (tokenToSet) {
      handleSetToken(tokenToSet)
      setTokenToSet(null)
    } else if (chainToSet) {
      if (chainToSet.callbackToUse === 'handleSetChain') {
        handleOnChainSelect(chainToSet)
      } else if (chainToSet.callbackToUse === 'handleSetDestinationChain') {
        handleSetDestinationChain({
          asset: chainToSet.asset,
          chain: chainToSet.chain,
        })
      }
      setChainToSet(null)
    }
  }, [tokenToSet, chainToSet, handleSetToken, handleOnChainSelect, handleSetDestinationChain])

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
    ledgerError && setLedgerError(undefined)
  }, [setShowTxReviewSheet, setShowTxPage, ledgerError])

  const handleOnTxPageClose = useCallback(
    (
      sourceChainId?: string,
      sourceToken?: string,
      destinationChainId?: string,
      destinationToken?: string,
    ) => {
      if (sourceChainId || sourceToken || destinationChainId || destinationToken) {
        let queryStr = ''
        queryStr = `?${qs.stringify({
          sourceChainId,
          sourceToken,
          destinationChainId,
          destinationToken,
          pageSource: 'swapAgain',
        })}`
        navigate(`/swap${queryStr}`)
      }
      setShowTxPage(false)
      setInAmount('')
    },
    [navigate, setInAmount, setShowTxPage],
  )

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
    <div className='panel-width panel-height enclosing-panel overflow-clip'>
      <PopupLayout
        header={
          <InputPageHeader
            onBack={handleOnBackClick}
            onRefresh={handleOnRefreshClick}
            onSettings={handleOnSettingsClick}
            topColor='transparent'
          />
        }
        className='flex flex-col'
      >
        {!!showMainnetAlert && (
          <div className='flex flex-col items-center justify-center px-4 py-2 bg-[#0D9488]'>
            <Text size='xs' color='dark:text-white-100 text-white-100' className='font-bold'>
              Switched to mainnet for swaps
            </Text>
          </div>
        )}
        <div className='flex flex-1 flex-col justify-between p-4 w-full gap-3 relative'>
          <div className='flex flex-col w-full gap-2 relative'>
            <div className='w-full flex flex-col items-center'>
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
                assetUsdValue={destinationAssetUSDValue}
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
          </div>

          {isMoreThanOneStepTransaction ? (
            <Buttons.Generic
              className='w-full dark:!bg-white-100 !bg-black-100 text-white-100 dark:text-black-100'
              onClick={() => window.open(redirectUrl, '_blank')}
              style={{ boxShadow: 'none' }}
            >
              <span className='flex items-center gap-1'>
                Swap on Swapfast <ArrowSquareOut size={20} className='!leading-[20px] !text-lg' />
              </span>
            </Buttons.Generic>
          ) : (
            <>
              <Buttons.Generic
                className={classNames('w-full', {
                  [`${
                    isCompassWallet() ? '!bg-compassChainTheme-400' : '!bg-green-600'
                  } text-white-100`]: !(
                    invalidAmount ||
                    amountExceedsBalance ||
                    isNoRoutesAvailableError(errorMsg)
                  ),
                  '!bg-red-300 text-white-100':
                    invalidAmount || amountExceedsBalance || isNoRoutesAvailableError(errorMsg),
                })}
                disabled={reviewDisabled}
                style={{ boxShadow: 'none' }}
                onClick={() => {
                  if (activeWallet?.watchWallet) {
                    importWatchWalletSeedPopupStore.setShowPopup(true)
                  } else {
                    setCheckForAutoAdjust(true)
                  }
                }}
              >
                {reviewBtnText}
              </Buttons.Generic>
            </>
          )}
        </div>
      </PopupLayout>

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

      {isChainAbstractionView ? (
        <SelectChainSheet
          title='Select Destination Chain'
          isOpen={showChainSelectSheet}
          chainsToShow={_destinationChainsToShow}
          onClose={() => {
            setShowChainSelectSheet(false)
            setShowSelectSheetFor('')
          }}
          selectedChain={destinationChain}
          selectedToken={destinationToken}
          onChainSelect={handleOnDestinationChainSelect}
          destinationAssets={_destinationAssets}
        />
      ) : (
        <SelectChainSheet
          isOpen={showChainSelectSheet}
          chainsToShow={_chainsToShow.map((chain) => ({ chain }))}
          onClose={handleOnChainSelectSheetClose}
          selectedChain={showSelectSheetFor === 'source' ? sourceChain : destinationChain}
          selectedToken={showSelectSheetFor === 'source' ? sourceToken : destinationToken}
          onChainSelect={handleOnChainSelect}
        />
      )}

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
            rootDenomsStore={rootDenomsStore}
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
        destinationAssetUSDValue={destinationAssetUSDValue}
        sourceAssetUSDValue={sourceAssetUSDValue}
      />

      {routingInfo?.route?.response && sourceChain && (
        <FeesSheet
          showFeesSettingSheet={showFeesSettingSheet}
          setShowFeesSettingSheet={setShowFeesSettingSheet}
        />
      )}

      {newChain && (
        <AddFromChainStore
          isVisible={!!newChain}
          onClose={() => {
            setNewChain(null)
            setTokenToSet(null)
            setChainToSet(null)
          }}
          newAddChain={newChain}
          skipUpdatingActiveChain={true}
          successCallback={handlePostAddChainCallback}
        />
      )}

      {showTxPage ? (
        <SwapTxPage
          onClose={handleOnTxPageClose}
          setLedgerError={swapTxPageSetLedgerError}
          ledgerError={ledgerError}
        />
      ) : null}
    </div>
  )
})

const Swap = observer(({ rootBalanceStore }: { rootBalanceStore: RootBalanceStore }) => {
  const query = useQuery()

  const location = useLocation()

  const totalFiatValue = useMemo(() => {
    return rootBalanceStore
      .getAggregatedBalances('mainnet')
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

  usePageView(PageName.SwapsStart, true, pageViewAdditionalProperties)

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
