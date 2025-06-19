import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import React from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { cn } from 'utils/cn'

import { useGasPriceContext } from './context'
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
  const { setViewAdditionalOptions, viewAdditionalOptions } = useGasPriceContext()

  return (
    <BottomModal
      isOpen={showFeesSettingSheet}
      title='Transaction Fees'
      onClose={() => {
        onClose()
        setViewAdditionalOptions(false)
      }}
    >
      <div
        className={cn('flex flex-col', {
          'gap-y-8 mb-10': !viewAdditionalOptions,
          'gap-y-5 mb-6': viewAdditionalOptions,
        })}
      >
        <p className='text-sm font-medium text-secondary-800'>
          Transaction fee is charged by the network. Higher the transaction fee, faster the
          transaction will go through.
        </p>

        <GasPriceOptions.Selector />

        {!hideAdditionalSettings && (
          <div className='w-full flex-col border border-secondary-200 flex items-center justify-between rounded-2xl overflow-hidden'>
            <div className='w-full'>
              <GasPriceOptions.AdditionalSettingsToggle />
            </div>
            <GasPriceOptions.AdditionalSettings
              showGasLimitWarning={true}
              gasError={gasError}
              rootBalanceStore={rootBalanceStore}
              rootDenomsStore={rootDenomsStore}
            />
          </div>
        )}
      </div>
      <Button
        onClick={onClose}
        disabled={gasError !== null}
        className='w-full'
        data-testing-id='send-tx-fee-proceed-btn'
      >
        Confirm and proceed
      </Button>
    </BottomModal>
  )
}
