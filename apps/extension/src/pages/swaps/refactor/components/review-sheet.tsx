/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { calculateFee, DeliverTxResponse } from '@cosmjs/stargate'
import {
  formatBigNumber,
  useActiveChain,
  useChainInfo,
  useDenoms,
  useGasAdjustment,
  usePendingTxState,
} from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import { BigNumber } from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import { DisplayFeeValue } from 'components/gas-price-options/context'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { LoaderAnimation } from 'components/loader/Loader'
import { getSwapProviderImage } from 'images/logos'
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { DEBUG } from 'utils/debug'

import { useSwapContext } from '../swap-context'

interface propTypes {
  isOpen: boolean
  onDone: () => void
  feeDenom: NativeDenom
  customFee?: { gasLimit: string; gasPrice: GasPrice }
  displayFeeValue: DisplayFeeValue
}

const ReviewSheet: React.FC<propTypes> = ({
  isOpen,
  onDone,
  displayFeeValue,
  feeDenom,
  customFee,
}) => {
  const [
    {
      amountValue,
      selectedToken,
      selectedTargetToken,
      currentTokenPrice,
      unitConversionPrice,
      slippagePercentage,
      selectedTokenUsdPrice,
      targetTokenUsdPrice,
      via,
      showLedgerPopup,
    },
    { performSwap },
  ] = useSwapContext()

  const navigate = useNavigate()
  const { setPendingTx } = usePendingTxState()
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const activeChainInfo = useChainInfo()
  const activeChain = useActiveChain()
  const denoms = useDenoms()
  const gasAdjustment = useGasAdjustment()

  const handleSwapRequest = useCallback(async () => {
    setIsLoading(true)

    const stdFee = (() => {
      if (!customFee) return null
      const gasEstimate = Math.ceil(Number(customFee.gasLimit) * gasAdjustment)
      return calculateFee(gasEstimate, customFee.gasPrice)
    })()

    try {
      const response = await performSwap(
        stdFee !== null
          ? {
              feeDenom: feeDenom,
              stdFee: stdFee,
            }
          : undefined,
      )
      const srcCoin = denoms[response?.data.fromToken.denom ?? '']
      const destCoin = denoms[response?.data.toToken.denom ?? '']
      setPendingTx({
        txHash: response?.txHash,
        img: srcCoin.icon,
        secondaryImg: destCoin.icon,
        subtitle1: '',
        title1: 'Swap ' + srcCoin.coinDenom + ' 👉🏻 ' + destCoin.coinDenom,
        txStatus: 'loading',
        txType: 'swap',
        promise: response?.pollPromise as Promise<DeliverTxResponse | ExecuteResult>,
      })
      setIsLoading(false)
      navigate('/pending-tx')
    } catch (e: any) {
      captureException(e)
      DEBUG('OSMOSIS SWAP', 'Failed to execute token swap', e)
      setIsLoading(false)
      if (e.message.includes('Tx Error Code')) {
        navigate('/home?txDeclined=true')
      } else if (e instanceof Error) {
        setError(`Failed to execute token swap.\nError: ${e.message}`)
      } else {
        setError(`Failed to execute token swap.\n${e.toString()}`)
      }
    }
  }, [customFee, denoms, feeDenom, gasAdjustment, navigate, performSwap, setPendingTx])

  if (!error && showLedgerPopup) {
    return <LedgerConfirmationPopup showLedgerPopup />
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onDone} title='Review Swap'>
      <div className='flex flex-col w-full items-center justify-center'>
        {/* Swap summary of tokens */}
        <div className='w-[344px] h-[212px] px-4 pt-[42px] dark:bg-gray-900 bg-white-100 rounded-2xl'>
          <div className='flex flex-row justify-evenly'>
            <div className='flex flex-col justify-center items-center text-black-100 dark:text-gray-400'>
              <img src={selectedToken?.image} className='h-[70px] w-[70px] mb-[16px]' />
              <p className='font-bold text-white-100'>
                {`${formatBigNumber(new BigNumber(amountValue as string))} ${
                  selectedToken?.symbol
                }`}
              </p>
              <p>
                {selectedTokenUsdPrice === undefined
                  ? '-'
                  : `$ ${formatBigNumber(
                      selectedTokenUsdPrice.multipliedBy(amountValue as string),
                    )}`}
              </p>
            </div>
            <div className='flex flex-col justify-center items-center text-black-100 dark:text-gray-400'>
              <span className='material-icons-round'>keyboard_double_arrow_right</span>
            </div>
            <div className='flex flex-col justify-center items-center text-black-100 dark:text-gray-400'>
              <img src={selectedTargetToken?.image} className='h-[70px] w-[70px] mb-[16px]' />
              <p className='font-bold text-white-100'>
                {`${formatBigNumber(currentTokenPrice as BigNumber)} ${
                  selectedTargetToken?.symbol
                }`}
              </p>
              <p>
                {targetTokenUsdPrice === undefined
                  ? '-'
                  : `$ ${formatBigNumber(
                      targetTokenUsdPrice.multipliedBy(currentTokenPrice as BigNumber),
                    )}`}
              </p>
            </div>
          </div>
        </div>

        {/* Slippage and unit transaction cost */}
        <div className='flex flex-row w-[344px] mt-2'>
          {/* amount per unit token indicator */}
          <div className='bg-white-100 dark:bg-gray-900 flex flex-row w-[206px] h-[56px] rounded-[8px] px-[12px] py-[8px]'>
            <div className='flex flex-col justify-center'>
              <img src={getSwapProviderImage(activeChainInfo.key)} className='h-6 w-6 mr-[10px]' />
            </div>
            <div className='flex flex-col justify-center text-[12px]'>
              <p>
                <span className='font-bold text-black-100 dark:text-white-100'>
                  {formatBigNumber(unitConversionPrice)} {selectedTargetToken?.symbol}
                </span>{' '}
                <span className='text-gray-400'>per {selectedToken?.symbol}</span>
              </p>
              <p className='text-gray-400'>{via}</p>
            </div>
          </div>
          {/* max slippage selector */}
          <div className='bg-white-100 dark:bg-gray-900 flex flex-row justify-between w-[130px] h-[56px] rounded-[8px] px-[12px] py-[8px] ml-[8px]'>
            <div className='flex flex-col justify-center text-[12px]'>
              <p>
                <span className='text-gray-400'>Max slippage</span>
              </p>
              <p className='font-bold text-black-100 dark:text-white-100'>{slippagePercentage}%</p>
            </div>
          </div>
        </div>

        {/* Swap and Tx fee indicator */}
        <p
          className='font-bold text-black-100 dark:text-[#D6D6D6] text-sm mt-4'
          title={`${displayFeeValue.value}`}
        >
          {`Transaction Fee: ${displayFeeValue.formattedAmount} ${feeDenom.coinDenom} (${displayFeeValue.fiatValue})`}
        </p>

        {error ? (
          <div className='my-4'>
            <ErrorCard text={error} />
          </div>
        ) : null}

        <Buttons.Generic
          size='normal'
          color={Colors.getChainColor(activeChain)}
          disabled={showLedgerPopup || isLoading}
          className='w-[344px] mt-4'
          onClick={handleSwapRequest}
        >
          {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Swap'}
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}

export default ReviewSheet
