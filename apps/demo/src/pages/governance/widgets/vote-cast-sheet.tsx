import { Buttons, HeaderActionType } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React from 'react'
import { Colors } from 'theme/colors'

import BottomSheet from '~/components/bottom-sheet'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { VoteOptions } from '~/types/vote'

export type CastVoteSheetProps = {
  isVisible: boolean
  onCloseHandler?: () => void
  onSubmitVote: (option: VoteOptions) => void
  error?: string
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
  isVisible,
  onCloseHandler,
  onSubmitVote,
}: CastVoteSheetProps): React.ReactElement {
  const [selectedOption, setSelectedOption] = React.useState<VoteOptions>()
  const activeChain = useActiveChain()

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle='Cast your Vote'
      headerActionType={HeaderActionType.CANCEL}
    >
      <>
        <div className='p-7 flex flex-col items-center gap-4'>
          {VoteOptionsList.map((option) => (
            <div
              key={option.label}
              className={classNames('flex w-[344px] p-4 rounded-2xl cursor-pointer', {
                'dark:text-gray-200 dark:bg-gray-900 text-gray-600 bg-white-100':
                  selectedOption !== option.label,
                [option.selectedCSS]: selectedOption === option.label,
              })}
              onClick={() => setSelectedOption(option.label)}
            >
              <span className='material-icons-round mr-3'>{option.icon}</span>
              <span className='text-base font-bold dark:text-white-100'>{option.label}</span>
            </div>
          ))}
          <Buttons.Generic
            color={Colors.getChainColor(activeChain)}
            size='normal'
            className='w-[344px] py-3'
            disabled={!selectedOption}
            onClick={() => onSubmitVote(selectedOption)}
          >
            <div className={'flex justify-center text-white-100 items-center'}>
              <span>Submit</span>
            </div>
          </Buttons.Generic>
        </div>
      </>
    </BottomSheet>
  )
}

export default CastVoteSheet
