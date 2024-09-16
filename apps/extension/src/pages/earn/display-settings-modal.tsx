import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import React from 'react'
import { Colors } from 'theme/colors'

import { DisplaySettings, infoField } from './types'

export const SortBy: Record<infoField, string> = {
  tvl: 'Total Volume Locked (TVL)',
  apr: 'Annual Percentage Return (APR)',
}

type DisplaySettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  settings: DisplaySettings
  // eslint-disable-next-line no-unused-vars
  onSettingsChange: (_: DisplaySettings) => void
}

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const options = Object.entries(SortBy)
  const activeChain = useActiveChain()

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={'Sort by'} closeOnBackdropClick={true}>
      <div className='rounded-2xl flex flex-col items-center w-full justify-center dark:bg-gray-900 bg-white-100'>
        {options.map(([key, label], index) => (
          <React.Fragment key={key}>
            <button
              className='flex items-center justify-between text-md font-bold p-4 w-full text-gray-800 dark:text-white-100'
              onClick={() => {
                onSettingsChange({ ...settings, sortBy: key as infoField })
              }}
            >
              <span>{label}</span>
              {settings.sortBy === key ? (
                <CheckCircle
                  weight='fill'
                  size={24}
                  style={{ color: Colors.getChainColor(activeChain) }}
                />
              ) : null}
            </button>
            {index === options.length - 1 ? null : <CardDivider />}
          </React.Fragment>
        ))}
      </div>
    </BottomModal>
  )
}
