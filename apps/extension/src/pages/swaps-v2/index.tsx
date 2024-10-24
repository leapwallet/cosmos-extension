import { useActiveWallet, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { ArrowSquareOut, X } from '@phosphor-icons/react'
import classNames from 'classnames'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import qs from 'qs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { activeChainStore } from 'stores/active-chain-store'
import { cw20TokenBalanceStore } from 'stores/balance-store'
import {
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  cw20DenomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  rootDenomsStore,
  whitelistedFactoryTokensStore,
} from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { SourceChain, SourceToken } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabledChainId } from 'utils/isLedgerEnabled'

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
import FeesSheet from './components/FeesSheet'
import InputPageHeader from './components/InputPageHeader'
import { WarningsSection } from './components/WarningsSection'
import { SwapContextProvider, useSwapContext } from './context'
import { isNoRoutesAvailableError } from './hooks'
import { getConversionRateRemark } from './utils/priceImpact'

function SwapPage() {
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

  const chains = useGetChains()
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
    route,
    isChainAbstractionView,
  } = useSwapContext()

  const checkNeeded = useMemo(() => {
    return getConversionRateRemark(route) === 'request-confirmation'
  }, [route])

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

  const _chainsToShow = useMemo(() => {
    if (activeWallet && activeWallet.walletType === WALLETTYPE.LEDGER) {
      return chainsToShow.filter((chain) => {
        const chainInfo = Object.values(ChainInfos).find(
          (chainInfo) => chainInfo.chainId === chain.chainId,
        )
        if (!chainInfo) return false
        const hasAddress = activeWallet.addresses[chainInfo.key]
        return (
          isLedgerEnabledChainId(chain.chainId as string, chain.coinType, Object.values(chains)) &&
          hasAddress
        )
      })
    }
    return chainsToShow
  }, [activeWallet, chainsToShow, chains])

  const { _destinationChainsToShow, _destinationAssets } = useMemo(() => {
    const _destinationAssets = destinationAssets.filter((asset) => {
      if (asset.skipAsset.originDenom === 'uusdc') {
        return (
          asset.skipAsset.originDenom === destinationToken?.skipAsset.originDenom &&
          asset.skipAsset.originChainId === destinationToken?.skipAsset.originChainId
        )
      }
      return asset.skipAsset.originDenom === destinationToken?.skipAsset.originDenom
    })
    const destinationChainIds = _destinationAssets.map((asset) => asset.skipAsset.chainId)

    return {
      _destinationAssets,
      _destinationChainsToShow: _chainsToShow.filter((chain) =>
        destinationChainIds.includes(chain.chainId),
      ),
    }
  }, [_chainsToShow, destinationToken, destinationAssets])

  const _destinationAssetsToShow = useMemo(() => {
    return destinationAssets.filter((asset) => {
      return isCompassWallet() ? true : !asset.skipAsset.denom.includes('ibc/')
    })
  }, [destinationAssets])

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
  }, [setShowTokenSelectSheet, setShowSelectSheetFor, uncheckWarnings])

  const handleInputChainSelectSheetOpen = useCallback(() => {
    setShowChainSelectSheet(true)
    setShowSelectSheetFor('source')
    uncheckWarnings()
  }, [uncheckWarnings, setShowChainSelectSheet, setShowSelectSheetFor])

  const handleOutputTokenSelectSheetOpen = useCallback(() => {
    setShowTokenSelectSheet(true)
    setShowSelectSheetFor('destination')
    uncheckWarnings()
  }, [setShowTokenSelectSheet, setShowSelectSheetFor, uncheckWarnings])

  const handleOutputChainSelectSheetOpen = useCallback(() => {
    setShowChainSelectSheet(true)
    setShowSelectSheetFor('destination')
    uncheckWarnings()
  }, [uncheckWarnings, setShowChainSelectSheet, setShowSelectSheetFor])

  const handleOnChainSelectSheetClose = useCallback(() => {
    setShowChainSelectSheet(false)
    setShowSelectSheetFor('')
  }, [setShowChainSelectSheet, setShowSelectSheetFor])

  const handleOnChainSelect = useCallback(
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
      showSelectSheetFor,
      sourceChain?.chainId,
      destinationChain?.chainId,
      setSourceChain,
      setSourceToken,
      setDestinationChain,
      setDestinationToken,
    ],
  )

  const handleOnDestinationChainSelect = useCallback(
    (chain: SourceChain) => {
      setDestinationChain(chain)
      const _destToken = _destinationAssets.find(
        (asset) => asset.skipAsset.chainId === chain.chainId,
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

  const handleOnTokenSelectSheetClose = useCallback(() => {
    setShowTokenSelectSheet(false)
    setShowSelectSheetFor('')
  }, [setShowTokenSelectSheet, setShowSelectSheetFor])

  const handleOnTokenSelect = useCallback(
    (token: SourceToken) => {
      if (showSelectSheetFor === 'source') {
        if (isChainAbstractionView) {
          setSourceChain(_chainsToShow.find((chain) => chain.chainId === token.skipAsset.chainId))
        }
        setSourceToken(token)
      } else if (showSelectSheetFor === 'destination') {
        if (isChainAbstractionView) {
          setDestinationChain(
            _chainsToShow.find((chain) => chain.chainId === token.skipAsset.chainId),
          )
        }
        setDestinationToken(token)
      }
      setShowTokenSelectSheet(false)
      setShowSelectSheetFor('')
    },
    [
      showSelectSheetFor,
      setDestinationToken,
      setShowSelectSheetFor,
      setShowTokenSelectSheet,
      setSourceToken,
      isChainAbstractionView,
      _chainsToShow,
      setSourceChain,
      setDestinationChain,
    ],
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
                selectTokenDisabled={_destinationAssetsToShow.length === 0 || !destinationChain}
                selectChainDisabled={_chainsToShow.length === 0}
                onTokenSelectSheet={handleOutputTokenSelectSheetOpen}
                onChainSelectSheet={handleOutputChainSelectSheetOpen}
                isChainAbstractionView={isChainAbstractionView}
                showFor='destination'
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
                onClick={() => setCheckForAutoAdjust(true)}
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
        destinationAssets={_destinationAssetsToShow}
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
          onChainSelect={handleOnDestinationChainSelect}
        />
      ) : (
        <SelectChainSheet
          isOpen={showChainSelectSheet}
          chainsToShow={_chainsToShow}
          onClose={handleOnChainSelectSheetClose}
          selectedChain={showSelectSheetFor === 'source' ? sourceChain : destinationChain}
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
      />

      {route?.response && (
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
    </div>
  )
}

export default function Swap() {
  const pageViewSource = useQuery().get('pageSource') ?? undefined
  const location = useLocation()

  const pageViewAdditionalProperties = useMemo(() => {
    let pageSourceFormatted
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
      default: {
        break
      }
    }
    return { pageViewSource: pageSourceFormatted }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageViewSource, location?.key])

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
    >
      <SwapPage />
    </SwapContextProvider>
  )
}
