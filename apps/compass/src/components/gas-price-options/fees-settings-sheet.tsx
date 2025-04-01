import BottomModal from 'components/bottom-modal'
import { Button } from 'components/ui/button'
import React from 'react'

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
  const { setViewAdditionalOptions } = useGasPriceContext()

  return (
    <BottomModal
      isOpen={showFeesSettingSheet}
      title='Transaction fees'
      onClose={() => {
        onClose()
        setViewAdditionalOptions(false)
      }}
      className='!px-6 !py-7'
    >
      <div className='flex flex-col gap-y-8 mb-10'>
        <p className='text-sm font-medium text-secondary-800'>
          Transaction fee is charged by the network. Higher the transaction fee, faster the
          transaction will go through.
        </p>

        <GasPriceOptions.Selector />

        {!hideAdditionalSettings && (
          <div className='w-full flex-col bg-secondary border border-secondary-200 flex items-center justify-between rounded-2xl overflow-hidden'>
            <div className='w-full'>
              <GasPriceOptions.AdditionalSettingsToggle />
            </div>
            <GasPriceOptions.AdditionalSettings showGasLimitWarning={true} gasError={gasError} />
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
