import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { useChainPageInfo } from 'hooks'
import React from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'

import GasPriceOptions from './index'

type FeesSettingsSheetProps = {
  showFeesSettingSheet: boolean
  onClose: () => void
  gasError: string | null
  hideAdditionalSettings?: boolean
}

export const FeesSettingsSheet: React.FC<FeesSettingsSheetProps> = ({
  onClose,
  showFeesSettingSheet,
  gasError,
  hideAdditionalSettings,
}) => {
  const { topChainColor } = useChainPageInfo()
  return (
    <BottomModal
      isOpen={showFeesSettingSheet}
      closeOnBackdropClick={true}
      title='Transaction Fees'
      onClose={onClose}
    >
      <div>
        <h3 className='text-gray-700 dark:text-gray-400 font-bold text-sm'>
          About transaction fee
        </h3>
        <p className='text-gray-800 dark:text-white-100 dark:text-white mt-2'>
          Transaction fee is charged by the network. Higher the transaction fee, faster the
          transaction will go through.
        </p>
        <GasPriceOptions.Selector className='mt-4' />
        {!hideAdditionalSettings && (
          <div className='flex justify-end w-full mt-4'>
            <GasPriceOptions.AdditionalSettingsToggle />
          </div>
        )}
        {!hideAdditionalSettings && (
          <GasPriceOptions.AdditionalSettings
            className='mt-4'
            showGasLimitWarning={true}
            rootDenomsStore={rootDenomsStore}
            rootBalanceStore={rootBalanceStore}
          />
        )}

        {gasError ? (
          <p className='text-red-300 text-sm font-medium mt-3 px-1 text-center'>{gasError}</p>
        ) : null}
        <Buttons.Generic
          color={topChainColor}
          onClick={onClose}
          disabled={gasError !== null}
          className='!w-full mt-4'
          data-testing-id='send-tx-fee-proceed-btn'
        >
          Proceed
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
