import { useActiveWallet, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import qs from 'qs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
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

  const pageViewSource = useQuery().get('pageSource') ?? undefined

  const handleOnBackClick = useCallback(() => {
    if (pageViewSource === 'swapAgain') {
      navigate('/home')
    } else {
      navigate(-1)
    }
  }, [navigate, pageViewSource])

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
  } = useSwapContext()

  const checkNeeded = getConversionRateRemark(route) === 'request-confirmation'

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
        return isLedgerEnabledChainId(chain.chainId as string, chain.coinType) && hasAddress
      })
    }
    return chainsToShow
  }, [chainsToShow, activeWallet])

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
    return 'Review Swap'
  }, [amountExceedsBalance, errorMsg, invalidAmount])

  const reviewDisabled = reviewBtnDisabled || isRefreshing || (checkNeeded && !isPriceImpactChecked)

  return (
    <div className='w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <InputPageHeader
            onBack={handleOnBackClick}
            onRefresh={() => {
              refresh()
            }}
            onSettings={() => {
              setShowSlippageSheet(true)
            }}
            topColor='transparent'
          />
        }
        className='flex flex-col'
      >
        <div className='flex flex-1 flex-col justify-between p-4 w-full gap-3 relative'>
          <div className='flex flex-col w-full gap-2 relative'>
            <div className='w-full flex flex-col items-center'>
              <TokenInputCard
                value={inAmount}
                isInputInUSDC={isInputInUSDC}
                setIsInputInUSDC={setIsInputInUSDC}
                placeholder='0'
                token={sourceToken}
                balanceStatus={sourceTokenBalanceStatus}
                loadingAssets={loadingChains || loadingSourceAssets}
                loadingChains={loadingChains}
                chainName={sourceChain?.chainName}
                chainLogo={sourceChain?.icon ?? defaultTokenLogo}
                onChange={(value) => {
                  handleInAmountChange(value)
                  uncheckWarnings()
                }}
                selectTokenDisabled={sourceAssets.length === 0 || !sourceChain}
                selectChainDisabled={_chainsToShow.length === 0}
                onTokenSelectSheet={() => {
                  setShowTokenSelectSheet(true)
                  setShowSelectSheetFor('source')
                  uncheckWarnings()
                }}
                onChainSelectSheet={() => {
                  setShowChainSelectSheet(true)
                  setShowSelectSheetFor('source')
                  uncheckWarnings()
                }}
                amountError={amountExceedsBalance || invalidAmount}
                showFor='source'
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
                placeholder='0'
                token={destinationToken}
                balanceStatus={destinationTokenBalancesStatus}
                loadingChains={loadingChains}
                loadingAssets={loadingChains || loadingDestinationAssets}
                chainName={destinationChain?.chainName}
                chainLogo={destinationChain?.icon ?? defaultTokenLogo}
                selectTokenDisabled={destinationAssets.length === 0 || !destinationChain}
                selectChainDisabled={_chainsToShow.length === 0}
                onTokenSelectSheet={() => {
                  setShowTokenSelectSheet(true)
                  setShowSelectSheetFor('destination')
                  uncheckWarnings()
                }}
                onChainSelectSheet={() => {
                  setShowChainSelectSheet(true)
                  setShowSelectSheetFor('destination')
                  uncheckWarnings()
                }}
              />
            </div>

            <WarningsSection
              isPriceImpactChecked={isPriceImpactChecked}
              setIsPriceImpactChecked={setIsPriceImpactChecked}
              ledgerError={ledgerError}
            />

            <SwapInfo setShowMoreDetailsSheet={setShowMoreDetailsSheet} />
          </div>

          {isMoreThanOneStepTransaction ? (
            <Buttons.Generic
              className='w-full dark:!bg-white-100 !bg-black-100 text-white-100 dark:text-black-100'
              onClick={() => window.open(redirectUrl, '_blank')}
              style={{ boxShadow: 'none' }}
            >
              <span className='flex items-center gap-1'>
                Swap on Swapfast{' '}
                <span className='!leading-[20px] !text-lg material-icons-round'>open_in_new</span>
              </span>
            </Buttons.Generic>
          ) : (
            <>
              <Buttons.Generic
                className={classNames('w-full', {
                  '!bg-green-600 text-white-100': !(
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
        destinationAssets={destinationAssets}
        sourceToken={sourceToken}
        selectedChain={showSelectSheetFor === 'source' ? sourceChain : destinationChain}
        destinationToken={destinationToken}
        showFor={showSelectSheetFor}
        onClose={() => {
          setShowTokenSelectSheet(false)
          setShowSelectSheetFor('')
        }}
        onTokenSelect={(token) => {
          if (showSelectSheetFor === 'source') {
            setSourceToken(token)
          } else if (showSelectSheetFor === 'destination') {
            setDestinationToken(token)
          }

          setShowTokenSelectSheet(false)
          setShowSelectSheetFor('')
        }}
      />

      <SelectChainSheet
        isOpen={showChainSelectSheet}
        chainsToShow={_chainsToShow}
        onClose={() => {
          setShowChainSelectSheet(false)
          setShowSelectSheetFor('')
        }}
        selectedChain={showSelectSheetFor === 'source' ? sourceChain : destinationChain}
        onChainSelect={(chain) => {
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
        }}
      />

      <MoreDetailsSheet
        isOpen={showMoreDetailsSheet}
        onClose={() => {
          setShowMoreDetailsSheet(false)
        }}
        onSlippageInfoClick={() => {
          setShowSlippageInfo(true)
        }}
        setShowFeesSettingSheet={setShowFeesSettingSheet}
      />

      <SlippageSheet
        isOpen={showSlippageSheet}
        onClose={() => setShowSlippageSheet(false)}
        onSlippageInfoClick={() => {
          setShowSlippageInfo(true)
        }}
      />

      <SlippageInfoSheet
        isOpen={showSlippageInfo}
        onClose={() => {
          setShowSlippageInfo(false)
        }}
      />

      {checkForAutoAdjust && displayFee && sourceToken && inAmount && sourceChain && (
        <AutoAdjustAmountSheet
          amount={inAmount}
          setAmount={setInAmount}
          selectedToken={{
            amount: sourceToken.amount,
            coinMinimalDenom: sourceToken.coinMinimalDenom,
          }}
          fee={{
            amount: toSmall(String(displayFee.value), feeDenom.coinDecimals),
            denom: feeDenom.coinMinimalDenom,
          }}
          forceChain={sourceChain?.key}
          setShowReviewSheet={setShowTxReviewSheet}
          closeAdjustmentSheet={() => setCheckForAutoAdjust(false)}
        />
      )}

      <TxReviewSheet
        isOpen={showTxReviewSheet}
        onClose={() => setShowTxReviewSheet(false)}
        onProceed={() => {
          setShowTxReviewSheet(false)
          setShowTxPage(true)
          ledgerError && setLedgerError(undefined)
        }}
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
          onClose={(
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
          }}
          setLedgerError={(ledgerError?: string) => {
            setLedgerError(ledgerError)
            ledgerError && setShowTxPage(false)
          }}
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
    <SwapContextProvider>
      <SwapPage />
    </SwapContextProvider>
  )
}
