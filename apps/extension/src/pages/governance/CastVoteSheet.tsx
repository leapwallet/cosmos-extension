/* eslint-disable no-unused-vars */
import { useActiveChain, useSimulateVote } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, getSimulationFee, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { LoaderAnimation } from 'components/loader/Loader'
import React, { useEffect, useRef, useState } from 'react'
import { Colors } from 'theme/colors'

export enum VoteOptions {
  YES = 'Yes',
  NO = 'No',
  NO_WITH_VETO = 'No with Veto',
  ABSTAIN = 'Abstain',
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

export type CastVoteSheetProps = {
  feeDenom: NativeDenom
  gasLimit: string
  gasPrice: GasPrice
  onSubmitVote: (option: VoteOptions) => void
  setShowFeesSettingSheet: React.Dispatch<React.SetStateAction<boolean>>
  setRecommendedGasLimit: React.Dispatch<React.SetStateAction<string>>
  proposalId: string
  setGasLimit: React.Dispatch<React.SetStateAction<string>>
}

function CastVoteSheet({
  onSubmitVote,
  setShowFeesSettingSheet,
  setRecommendedGasLimit,
  proposalId,
  setGasLimit,
  feeDenom,
}: CastVoteSheetProps): React.ReactElement {
  const [selectedOption, setSelectedOption] = useState<VoteOptions | undefined>(undefined)
  const activeChain = useActiveChain()
  const simulateVote = useSimulateVote()
  const firstTime = useRef(true)
  const [simulating, setSimulating] = useState(true)

  useEffect(() => {
    let cancelled = false

    const simulate = async () => {
      try {
        const fee = getSimulationFee(feeDenom.coinMinimalDenom)
        const result = await simulateVote({
          proposalId,
          voteOption: VoteOptions.YES,
          fee,
        })

        if (result !== null && !cancelled) {
          const _estimate = result.gasUsed.toString()
          setRecommendedGasLimit(_estimate)
          if (firstTime.current) {
            setGasLimit(_estimate)
            firstTime.current = false
          }
        }
      } catch {
        //
      } finally {
        setSimulating(false)
      }
    }

    simulate().catch(captureException)

    return () => {
      cancelled = true
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId, simulateVote])

  return (
    <>
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

      {!simulating ? (
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
        disabled={!selectedOption || simulating}
        onClick={() => onSubmitVote(selectedOption as VoteOptions)}
      >
        <div className={'flex justify-center text-white-100 items-center'}>
          <span>Submit</span>
        </div>
      </Buttons.Generic>
    </>
  )
}

export default CastVoteSheet
