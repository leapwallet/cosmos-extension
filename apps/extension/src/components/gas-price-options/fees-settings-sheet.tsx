import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import React from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import GasPriceOptions from './index'

type FeesSettingsSheetProps = {
  showFeesSettingSheet: boolean
  onClose: () => void
  gasError: string | null
}

export const FeesSettingsSheet: React.FC<FeesSettingsSheetProps> = ({
  onClose,
  showFeesSettingSheet,
  gasError,
}) => {
  const activeChain = useActiveChain()

  return (
    <BottomModal
      isOpen={showFeesSettingSheet}
      closeOnBackdropClick={true}
      title='Transaction Fees'
      onClose={onClose}
      disableClose={gasError !== null}
    >
      <div>
        <h3 className='text-gray-700 dark:text-gray-400 font-bold text-sm'>
          About transaction fee
        </h3>
        <p className='text-gray-800 dark:text-white-100 dark:text-white mt-2'>
          Transaction fee is charged by the network. {isCompassWallet() ? 'Compass' : 'Leap'} Wallet
          is free to use. Higher the transaction fee, faster the transaction will go through.
        </p>
        <GasPriceOptions.Selector className='mt-4' />
        <div className='flex justify-end w-full mt-4'>
          <GasPriceOptions.AdditionalSettingsToggle />
        </div>
        <GasPriceOptions.AdditionalSettings className='mt-4' showGasLimitWarning={true} />
        {gasError ? (
          <p className='text-red-300 text-sm font-medium mt-3 px-1 text-center'>{gasError}</p>
        ) : null}
        <Buttons.Generic
          color={Colors.getChainColor(activeChain)}
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
