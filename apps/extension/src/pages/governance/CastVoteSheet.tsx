/* eslint-disable no-unused-vars */
import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { LoaderAnimation } from 'components/loader/Loader'
import React, { useState } from 'react'
import { Colors } from 'theme/colors'

export enum VoteOptions {
  YES = 'Yes',
  NO = 'No',
  NO_WITH_VETO = 'No with Veto',
  ABSTAIN = 'Abstain',
}

export type CastVoteSheetProps = {
  isOpen: boolean
  feeDenom: NativeDenom
  gasLimit: string
  gasPrice: GasPrice
  setShowFeesSettingSheet: React.Dispatch<React.SetStateAction<boolean>>
  onCloseHandler: () => void
  onSubmitVote: (option: VoteOptions) => void
  loadingFees: boolean
}

const VoteOptionsList = [
  {
    label: VoteOptions.YES,
    icon: 'thumb_up',
    selectedCSS: 'text-white-100 bg-green-600',
  },
  {
    label: VoteOptions.NO,
    icon: 'thumb_down',
    selectedCSS: 'text-white-100 bg-red-300',
  },
  {
    label: VoteOptions.NO_WITH_VETO,
    icon: 'thumb_down',
    selectedCSS: 'text-white-100 bg-indigo-300',
  },
  {
    label: VoteOptions.ABSTAIN,
    icon: 'block',
    selectedCSS: 'text-white-100 bg-yellow-600',
  },
]

function CastVoteSheet({
  isOpen,
  setShowFeesSettingSheet,
  onCloseHandler,
  onSubmitVote,
  loadingFees,
}: CastVoteSheetProps): React.ReactElement {
  const [selectedOption, setSelectedOption] = useState<VoteOptions | undefined>(undefined)
  const activeChain = useActiveChain()

  return (
    <BottomModal isOpen={isOpen} onClose={onCloseHandler} title='Cast your Vote'>
      <div className='flex flex-col items-center gap-4'>
        {VoteOptionsList.map((option) => (
          <button
            key={option.label}
            onClick={() => setSelectedOption(option.label)}
            className={classNames('flex w-[344px] p-4 rounded-2xl cursor-pointer', {
              'dark:text-gray-200 dark:bg-gray-900 text-gray-600 bg-white-100':
                selectedOption !== option.label,
              [option.selectedCSS]: selectedOption === option.label,
            })}
          >
            <span className='material-icons-round mr-3'>{option.icon}</span>
            <span className='text-base font-bold dark:text-white-100'>{option.label}</span>
          </button>
        ))}
      </div>
      {!loadingFees ? (
        <DisplayFee className='mt-4' setShowFeesSettingSheet={setShowFeesSettingSheet} />
      ) : (
        <div className='flex justify-center'>
          <LoaderAnimation color={Colors.getChainColor(activeChain)} />
        </div>
      )}
      <Buttons.Generic
        color={Colors.getChainColor(activeChain)}
        size='normal'
        className='w-[344px] py-3 mt-4'
        disabled={!selectedOption || loadingFees}
        onClick={() => onSubmitVote(selectedOption as VoteOptions)}
      >
        <div className={'flex justify-center text-white-100 items-center'}>
          <span>Submit</span>
        </div>
      </Buttons.Generic>
    </BottomModal>
  )
}

export default CastVoteSheet
