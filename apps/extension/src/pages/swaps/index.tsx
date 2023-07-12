import { useGetTokenBalances } from '@leapwallet/cosmos-wallet-hooks'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { DEFAULT_SWAP_FEE } from 'config/config'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFetchTokens } from 'hooks/swaps/useFetchTokens'
import { useTokenToTokenPrice } from 'hooks/swaps/useTokenToTokenPrice'
import React, { Fragment, ReactElement, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import extension from 'webextension-polyfill'

import SwapScreen from './refactor'
import ReviewSheet from './screens/sheets/ReviewSheet'
import SlippageSheet from './screens/sheets/SlippageSheet'
import TargetTokenSheet from './screens/sheets/TargetTokenSheet'
import UserTokenSheet from './screens/sheets/UserTokenSheet'
import SwapHome from './screens/swapHome'

function JunoSwap(): ReactElement {
  const { allAssets } = useGetTokenBalances()
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const [supportedTokenForSwap] = useFetchTokens()
  const views = extension.extension.getViews({ type: 'popup' })

  const [tokenSelectionSheet, setTokenSelectionSheet] = useState<boolean>(false)
  const [targetTokenSelectionSheet, setTargetTokenSelectionSheet] = useState<boolean>(false)
  const [slippageSheet, setSlippageSheet] = useState<boolean>(false)
  const [reviewSheet, setReviewSheet] = useState<boolean>(false)

  const [amountValue, setAmountValue] = useState<string>('')

  const [selectedTokenName, setSelectedTokenName] = useState<string>('Select token')
  const [selectedTokenIcon, setSelectedTokenIcon] = useState<string>('')
  const [selectedTokenBalance, setSelectedTokenBalance] = useState<string>('0')
  const [selectedTokenId, setSelectedTokenId] = useState<string>('')
  const [targetTokenName, setTargetTokenName] = useState<string>('Select token')
  const [targetTokenIcon, setTargetTokenIcon] = useState<string>('')
  // const [transactionFee, setTransactionFee] = useState<string>('0.004')
  const [feesCurrency, setFeesCurrency] = useState<string>('0')
  const [unitConversionPrice, setUnitConversionPrice] = useState<string>('')
  const [junoDollarValue, setJunoDollarValue] = useState<number>()
  const [slippagePercentage, setSlippagePercentage] = useState<number>(2)
  const [isFeeAvailable, setIsFeeAvailable] = useState<boolean>(false)

  const [currentTokenPrice, isPriceLoading] = useTokenToTokenPrice({
    tokenASymbol: selectedTokenName.toUpperCase(),
    tokenBSymbol: targetTokenName.toUpperCase(),
    tokenAmount: Number(amountValue),
  })

  const unitPriceOfTokenOfQuantity = useCallback(
    (tokenName: string, quantity: string) => {
      const unitPrice = parseFloat(
        allAssets.find((asset) => asset.symbol.toLowerCase() === tokenName.toLowerCase())
          ?.usdPrice ?? '0',
      )
      if (!unitPrice) return '-'
      return (parseFloat(quantity) * unitPrice).toPrecision(6)
    },
    [allAssets],
  )

  useEffect(() => {
    const unitConversionPrice = parseFloat(
      allAssets.find((asset) => asset.symbol.toLowerCase() === 'juno')?.usdPrice ?? '0',
    )
    setJunoDollarValue(unitConversionPrice)
    setFeesCurrency((unitConversionPrice * DEFAULT_SWAP_FEE).toFixed(3))
  }, [allAssets])

  useEffect(() => {
    setUnitConversionPrice(
      String(
        isPriceLoading ? '0' : (Number(currentTokenPrice) / Number(amountValue ?? '1')).toFixed(2),
      ),
    )
  }, [isPriceLoading, amountValue, currentTokenPrice])

  useEffect(() => {
    setSelectedTokenBalance(
      allAssets.find((asset) => asset.symbol.toLowerCase() === selectedTokenName.toLowerCase())
        ?.amount ?? '0',
    )
    const junoAvailable =
      allAssets.find((asset) => asset.symbol.toLowerCase() === 'juno')?.amount ?? '0'
    setIsFeeAvailable(Number(junoAvailable) > Number(DEFAULT_SWAP_FEE))
  }, [allAssets, selectedTokenName])

  const setSelectedTokenData = (
    id: string,
    tokenName: string,
    tokenIcon: string,
    tokenBalance: string,
  ) => {
    setSelectedTokenId(id)
    setSelectedTokenName(tokenName)
    setSelectedTokenIcon(tokenIcon)
    setSelectedTokenBalance(tokenBalance)
  }

  const setSelectedTargetTokenData = (tokenName: string, tokenIcon: string) => {
    setTargetTokenName(tokenName)
    setTargetTokenIcon(tokenIcon)
  }

  const page = (
    <PopupLayout
      header={
        <Header
          title={'Swap'}
          action={{
            onClick: () => {
              navigate(-1)
            },
            type: HeaderActionType.BACK,
          }}
          topColor={Colors.getChainColor(activeChain ?? 'cosmos')}
        />
      }
    >
      <SwapHome
        toggleUserTokenSheet={() => setTokenSelectionSheet(!tokenSelectionSheet)}
        toggleTargetTokenSheet={() => setTargetTokenSelectionSheet(!targetTokenSelectionSheet)}
        toggleSlippageSheet={() => setSlippageSheet(!slippageSheet)}
        toggleReviewSheet={() => setReviewSheet(!reviewSheet)}
        slippage={String(slippagePercentage)}
        amountValue={amountValue}
        junoDollarValue={junoDollarValue}
        targetAmountValue={currentTokenPrice?.toString() as string}
        selectedTokenName={selectedTokenName}
        selectedTokenIcon={selectedTokenIcon}
        selectedTokenBalance={selectedTokenBalance}
        targetTokenName={targetTokenName}
        targetTokenIcon={targetTokenIcon}
        feesCurrency={feesCurrency}
        unitConversionPrice={unitConversionPrice}
        setAmountValue={setAmountValue}
        setSelectedTokenName={setSelectedTokenName}
        setSelectedTokenIcon={setSelectedTokenIcon}
        setSelectedTokenBalance={setSelectedTokenBalance}
        setTargetTokenName={setTargetTokenName}
        setTargetTokenIcon={setTargetTokenIcon}
        setFeesCurrency={setFeesCurrency}
        setUnitConversionPrice={setUnitConversionPrice}
        setSlippagePercentage={setSlippagePercentage}
        slippagePercentage={slippagePercentage}
        isFeeAvailable={isFeeAvailable}
      />
      <div>
        {tokenSelectionSheet && (
          <UserTokenSheet
            onCloseHandler={() => setTokenSelectionSheet(false)}
            isVisible={tokenSelectionSheet}
            allAssets={allAssets}
            selectedTokenId={selectedTokenId}
            setTokenData={setSelectedTokenData}
            selectedTokenName={selectedTokenName}
          />
        )}

        {targetTokenSelectionSheet && (
          <TargetTokenSheet
            onCloseHandler={() => setTargetTokenSelectionSheet(false)}
            isVisible={targetTokenSelectionSheet}
            assets={supportedTokenForSwap}
            allAssets={allAssets}
            selectedToken={selectedTokenName}
            selectedTargetToken={targetTokenName}
            setTagetTokenData={setSelectedTargetTokenData}
          />
        )}

        {slippageSheet && (
          <SlippageSheet
            onCloseHandler={() => setSlippageSheet(false)}
            toggleReviewSheet={() => {
              setSlippageSheet(false)
              setReviewSheet(true)
            }}
            isVisible={slippageSheet}
            slippagePercentage={slippagePercentage}
            setSlippagePercentage={setSlippagePercentage}
          />
        )}

        {reviewSheet && (
          <ReviewSheet
            onCloseHandler={() => setReviewSheet(false)}
            isVisible={reviewSheet}
            slippage={String(slippagePercentage)}
            targetTokenName={targetTokenName}
            targetTokenIcon={targetTokenIcon}
            targetAmountValue={currentTokenPrice?.toString() as string}
            selectedTokenName={selectedTokenName}
            selectedTokenIcon={selectedTokenIcon}
            selectedTokenValue={amountValue}
            feesCurrency={feesCurrency}
            unitPrice={unitConversionPrice}
            unitPriceOfTokenOfQuantity={unitPriceOfTokenOfQuantity}
          />
        )}
      </div>
    </PopupLayout>
  )

  return views.length === 0 ? (
    <div className='select-none relative'>
      <div className='dark:shadow-sm shadow-xl dark:shadow-gray-700'>{page}</div>
    </div>
  ) : (
    <Fragment>{page}</Fragment>
  )
}

const FinalSwapExport = () => {
  const activeChain = useActiveChain()

  if (activeChain === 'juno') {
    return <JunoSwap />
  }
  return <SwapScreen />
}

export default FinalSwapExport
