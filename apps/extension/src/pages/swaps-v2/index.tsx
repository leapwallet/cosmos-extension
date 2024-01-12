import { useActiveWallet, useChainInfo, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { NamedSkip } from 'images/logos'
import { SwapVert } from 'images/misc'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'

import {
  FeesView,
  HighPriceImpactWarning,
  PriceImpactSheet,
  SelectChainSheet,
  SelectTokenSheet,
  SlippageSheet,
  SwapError,
  SwapInfo,
  SwapLoading,
  SwapTxPage,
  TokenInputCard,
  TxReviewSheet,
} from './components'
import { SwapContextProvider, useSwapContext } from './context'

function SwapPage() {
  usePageView(PageName.Swap)

  const activeChainInfo = useChainInfo()
  const navigate = useNavigate()
  const defaultTokenLogo = useDefaultTokenLogo()
  const counter = useRef(0)
  const intervalTimeout = useRef<NodeJS.Timeout>()

  const [showPriceImpactSheet, setShowPriceImpactSheet] = useState(false)
  const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(false)
  const [showSelectSheetFor, setShowSelectSheetFor] = useState<'source' | 'destination' | ''>(
    'source',
  )
  const [showChainSelectSheet, setShowChainSelectSheet] = useState<boolean>(false)
  const [showTxReviewSheet, setShowTxReviewSheet] = useState<boolean>(false)
  const [showTxPage, setShowTxPage] = useState<boolean>(false)
  const [showSlippageSheet, setShowSlippageSheet] = useState(false)
  const [ledgerError, setLedgerError] = useState<string>()

  const activeWallet = useActiveWallet()

  const {
    inAmount,
    sourceToken,
    sourceChain,
    handleInAmountChange,
    sourceAssets,
    chainsToShow,
    amountExceedsBalance,
    amountOut,
    destinationToken,
    destinationChain,
    destinationAssets,
    errorMsg,
    loadingMsg,
    reviewBtnDisabled,
    setSourceToken,
    setDestinationToken,
    setSourceChain,
    setDestinationChain,
    infoMsg,
    redirectUrl,
    isMoreThanOneStepTransaction,
    refresh,
    handleSwitchOrder,
    isSwitchOrderPossible,
    setInAmount,
  } = useSwapContext()

  useEffect(() => {
    if (
      Number(amountOut) &&
      ![
        showChainSelectSheet,
        showPriceImpactSheet,
        showSlippageSheet,
        showTokenSelectSheet,
        showTxPage,
        showTxReviewSheet,
      ].includes(true)
    ) {
      intervalTimeout.current = setInterval(() => {
        if (counter.current === 10) {
          counter.current = 0
          refresh()
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
    showPriceImpactSheet,
    showSlippageSheet,
    showTokenSelectSheet,
    showTxPage,
    showTxReviewSheet,
  ])

  const _chainsToShow = useMemo(() => {
    if (activeWallet && activeWallet.walletType === WALLETTYPE.LEDGER) {
      return chainsToShow.filter((chain) => chain.coinType !== '60' && chain.coinType !== '931')
    }
    return chainsToShow
  }, [chainsToShow, activeWallet])

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <Header
            title='Swap'
            action={{
              onClick: () => navigate(-1),
              type: HeaderActionType.BACK,
            }}
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            topColor={activeChainInfo.theme.primaryColor}
          />
        }
      >
        <div className='flex flex-col p-7 w-full gap-3 relative'>
          <div className='w-full flex flex-col items-center'>
            <TokenInputCard
              value={inAmount}
              placeholder='0'
              token={sourceToken}
              chainName={sourceChain?.chainName ?? 'Select chain'}
              chainLogo={sourceChain?.icon ?? defaultTokenLogo}
              onChange={handleInAmountChange}
              selectTokenDisabled={sourceAssets.length === 0 || !sourceChain}
              selectChainDisabled={_chainsToShow.length === 0}
              onTokenSelectSheet={() => {
                setShowTokenSelectSheet(true)
                setShowSelectSheetFor('source')
              }}
              onChainSelectSheet={() => {
                setShowChainSelectSheet(true)
                setShowSelectSheetFor('source')
              }}
              amountError={amountExceedsBalance ? 'Insufficient balance' : undefined}
              showFor='source'
              onGearClick={() => setShowSlippageSheet(true)}
            />

            <div
              className={classNames(
                'w-[44px] h-[44px] relative rounded-full bg-white-100 dark:bg-gray-900 flex items-center justify-center border-4 border-gray-50 dark:border-black-100 -mt-[18px] -mb-[18px]',
                { 'cursor-pointer': isSwitchOrderPossible },
              )}
              onClick={handleSwitchOrder}
            >
              <img src={SwapVert} className='invert dark:invert-0' />
            </div>

            <TokenInputCard
              readOnly
              value={amountOut ? Number(amountOut).toFixed(5) : amountOut}
              placeholder='0'
              token={destinationToken}
              chainName={destinationChain?.chainName ?? 'Select chain'}
              chainLogo={destinationChain?.icon ?? defaultTokenLogo}
              selectTokenDisabled={destinationAssets.length === 0 || !destinationChain}
              selectChainDisabled={_chainsToShow.length === 0}
              onTokenSelectSheet={() => {
                setShowTokenSelectSheet(true)
                setShowSelectSheetFor('destination')
              }}
              onChainSelectSheet={() => {
                setShowChainSelectSheet(true)
                setShowSelectSheetFor('destination')
              }}
            />
          </div>

          {errorMsg ? <SwapError errorMsg={errorMsg} /> : null}
          {ledgerError ? <SwapError errorMsg={ledgerError} /> : null}
          {loadingMsg ? <SwapLoading loadingMsg={loadingMsg} /> : null}
          {infoMsg ? <SwapInfo infoMsg={infoMsg} /> : null}

          {isMoreThanOneStepTransaction ? (
            <Buttons.Generic
              className='w-[344px]'
              color={activeChainInfo.theme.primaryColor ?? Colors.cosmosPrimary}
              onClick={() => window.open(redirectUrl, '_blank')}
            >
              <span className='flex items-center gap-1'>
                Swap on Leapboard <img src={Images.Misc.OpenLink} className='' />
              </span>
            </Buttons.Generic>
          ) : (
            <>
              <HighPriceImpactWarning onClick={() => setShowPriceImpactSheet(true)} />
              <div className='w-[344px] flex flex-col gap-3'>
                <FeesView />

                <Buttons.Generic
                  className='w-full'
                  color={activeChainInfo.theme.primaryColor ?? Colors.cosmosPrimary}
                  disabled={reviewBtnDisabled}
                  onClick={() => setShowTxReviewSheet(true)}
                >
                  Review
                </Buttons.Generic>
              </div>
            </>
          )}

          <p className='text-center text-gray-400 flex items-center justify-center gap-1 text-sm'>
            Powered by <img src={NamedSkip} alt='Skip' className='w-[50px]' />
          </p>
        </div>
      </PopupLayout>

      <SelectTokenSheet
        isOpen={showTokenSelectSheet}
        sourceAssets={sourceAssets}
        destinationAssets={destinationAssets}
        sourceToken={sourceToken}
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

      <TxReviewSheet
        isOpen={showTxReviewSheet}
        onClose={() => setShowTxReviewSheet(false)}
        onProceed={() => {
          setShowTxReviewSheet(false)
          setShowTxPage(true)
          ledgerError && setLedgerError(undefined)
        }}
      />

      {showTxPage ? (
        <SwapTxPage
          onClose={() => {
            setShowTxPage(false)
            setInAmount('')
          }}
          setLedgerError={(ledgerError?: string) => {
            setLedgerError(ledgerError)
            ledgerError && setShowTxPage(false)
          }}
        />
      ) : null}

      <PriceImpactSheet
        isOpen={showPriceImpactSheet}
        onClose={() => setShowPriceImpactSheet(false)}
      />

      <SlippageSheet isOpen={showSlippageSheet} onClose={() => setShowSlippageSheet(false)} />
    </div>
  )
}

export function Swap() {
  return (
    <SwapContextProvider>
      <SwapPage />
    </SwapContextProvider>
  )
}
