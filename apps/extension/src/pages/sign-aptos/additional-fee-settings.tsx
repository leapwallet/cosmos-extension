import Tooltip from 'components/better-tooltip'
import GasPriceOptions from 'components/gas-price-options'
import { GasPriceOptionValue, useGasPriceContext } from 'components/gas-price-options/context'
import { Images } from 'images'
import React from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'

export const NotAllowSignTxGasOptions = ({
  gasPriceOption,
  gasPriceError,
}: {
  gasPriceOption: GasPriceOptionValue
  gasPriceError: string | null
}) => {
  const { viewAdditionalOptions } = useGasPriceContext()
  return viewAdditionalOptions ? (
    <div className='rounded-2xl p-4 mt-3 dark:bg-[#141414] bg-white-100'>
      <div className='flex items-center'>
        <p className='text-gray-500 dark:text-gray-100 text-sm font-medium tracking-wide'>
          Gas Fees <span className='capitalize'>({gasPriceOption.option})</span>
        </p>
        <Tooltip
          content={
            <p className='text-gray-500 dark:text-gray-100 text-sm'>
              You can choose higher gas fees for faster transaction processing.
            </p>
          }
        >
          <div className='relative ml-2'>
            <img src={Images.Misc.InfoCircle} alt='Hint' />
          </div>
        </Tooltip>
      </div>
      <GasPriceOptions.Selector className='mt-2' preSelected={false} />
      <GasPriceOptions.AdditionalSettings
        className='mt-5 p-0'
        showGasLimitWarning={true}
        rootDenomsStore={rootDenomsStore}
        rootBalanceStore={rootBalanceStore}
      />
      {gasPriceError ? (
        <p className='text-red-300 text-sm font-medium mt-2 px-1'>{gasPriceError}</p>
      ) : null}
    </div>
  ) : null
}
