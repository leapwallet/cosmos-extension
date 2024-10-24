import { GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { CaretDown, GasPump } from '@phosphor-icons/react'
import { useDefaultGasPrice } from 'components/gas-price-options'
import { observer } from 'mobx-react-lite'
import { useSwapContext } from 'pages/swaps-v2/context'
import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import Skeleton from 'react-loading-skeleton'

import { ConversionRateDisplay } from './ConversionRateDisplay'

type SwapInfoProps = {
  setShowMoreDetailsSheet: Dispatch<SetStateAction<boolean>>
  rootDenomsStore: RootDenomsStore
}

export const SwapInfo = observer(({ setShowMoreDetailsSheet, rootDenomsStore }: SwapInfoProps) => {
  const {
    inAmount,
    displayFee,
    sourceChain,
    setGasOption,
    setUserPreferredGasPrice,
    setGasPriceOption,
    isSkipGasFeeLoading,
    loadingRoutes,
    loadingMessages,
  } = useSwapContext()

  const denoms = rootDenomsStore.allDenoms

  const defaultGasPrice = useDefaultGasPrice(denoms, {
    activeChain: sourceChain?.key ?? 'cosmos',
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
      <div className='w-full flex justify-between items-start gap-2 px-2 py-1'>
        <ConversionRateDisplay />
        {inAmount !== '' && (
          <button onClick={handleGasClick} className='flex items-center justify-end gap-1'>
            <GasPump size={16} className='dark:text-white-100' />
            {loadingRoutes || loadingMessages || isSkipGasFeeLoading ? (
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
            <CaretDown size={16} className='dark:text-white-100' />
          </button>
        )}
      </div>
    </>
  )
})
