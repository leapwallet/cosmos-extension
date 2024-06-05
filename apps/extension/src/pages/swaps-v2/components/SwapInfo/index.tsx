import { GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { useDefaultGasPrice } from 'components/gas-price-options'
import { useSwapContext } from 'pages/swaps-v2/context'
import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import Skeleton from 'react-loading-skeleton'

import { ConversionRateDisplay } from './ConversionRateDisplay'

type SwapInfoProps = {
  setShowMoreDetailsSheet: Dispatch<SetStateAction<boolean>>
}

export function SwapInfo({ setShowMoreDetailsSheet }: SwapInfoProps) {
  const {
    inAmount,
    displayFee,
    sourceChain,
    setGasOption,
    setUserPreferredGasPrice,
    setGasPriceOption,
    isSkipGasFeeLoading,
  } = useSwapContext()

  const defaultGasPrice = useDefaultGasPrice({
    activeChain: sourceChain?.key,
  })

  useEffect(() => {
    setGasPriceOption({
      option: GasOptions.LOW,
      gasPrice: defaultGasPrice.gasPrice,
    })
    setGasOption(GasOptions.LOW)
    setUserPreferredGasPrice(defaultGasPrice.gasPrice)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

  const handleGasClick = useCallback(() => {
    setShowMoreDetailsSheet(true)
  }, [setShowMoreDetailsSheet])

  return (
    <>
      <div className='w-full flex justify-between items-center gap-2 px-2 py-1'>
        <ConversionRateDisplay />
        {inAmount !== '' && (
          <button onClick={handleGasClick} className='flex items-center justify-end gap-1'>
            <span className='!leading-5 [transform:rotateY(180deg)] rotate-180 !text-md material-icons-round dark:text-white-100'>
              local_gas_station
            </span>
            {isSkipGasFeeLoading ? (
              <Skeleton
                containerClassName='block !leading-none rounded-xl'
                width={35}
                height={16}
              />
            ) : (
              <span className='dark:text-white-100 text-xs font-medium'>
                {displayFee?.fiatValue}
              </span>
            )}
            <span className='!leading-5 !text-md material-icons-round dark:text-white-100'>
              keyboard_arrow_down
            </span>
          </button>
        )}
      </div>
    </>
  )
}
