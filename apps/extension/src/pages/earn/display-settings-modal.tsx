import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
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
    <BottomModal isOpen={isOpen} onClose={onClose} title={'Sort by'}>
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
                <span
                  className='material-icons-round'
                  style={{ color: Colors.getChainColor(activeChain) }}
                >
                  check_circle
                </span>
              ) : null}
            </button>
            {index === options.length - 1 ? null : <CardDivider />}
          </React.Fragment>
        ))}
      </div>
    </BottomModal>
    // <BottomModal isOpen={isOpen} title='Sort By' onClose={onClose}>
    //   <div className='rounded-2xl dark:bg-gray-900 bg-white-100 p-4'>
    //     <Text size='sm' className='text-gray-900 dark:text-gray-50 capitalize'>
    //       Sort By
    //     </Text>

    //     <RadioGroup
    //       className='mt-2'
    //       themeColor={Colors.Indigo300}
    //       options={Object.entries(SortBy).map(([option, label]) => ({
    //         value: option,
    //         title: label,
    //       }))}
    //       onChange={(option) => {
    //         onSettingsChange({ ...settings, sortBy: option as infoField })
    //       }}
    //       selectedOption={settings.sortBy}
    //     />
    //   </div>
    // </BottomModal>
  )
}
