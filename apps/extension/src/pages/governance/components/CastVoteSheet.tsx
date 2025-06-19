/* eslint-disable no-unused-vars */
import {
  useActiveChain,
  useChainInfo,
  useSelectedNetwork,
  useSimulateVote,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  GasPrice,
  getSimulationFee,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { Prohibit, ThumbsDown, ThumbsUp } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { LoaderAnimation } from 'components/loader/Loader'
import { Button } from 'components/ui/button'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { cn } from 'utils/cn'

import { ProposalStatusEnum } from './ProposalStatus'

export enum VoteOptions {
  YES = 'Yes',
  NO = 'No',
  NO_WITH_VETO = 'No with Veto',
  ABSTAIN = 'Abstain',
}

export type CastVoteSheetProps = {
  feeDenom: NativeDenom
  gasLimit: string
  gasPrice: GasPrice
  onSubmitVote: (option: VoteOptions) => void
  setShowFeesSettingSheet: React.Dispatch<React.SetStateAction<boolean>>
  setRecommendedGasLimit: React.Dispatch<React.SetStateAction<string>>
  proposalId: string
  setGasLimit: React.Dispatch<React.SetStateAction<string>>
  forceChain?: SupportedChain
  forceNetwork?: 'mainnet' | 'testnet'
  isProposalInVotingPeriod: boolean
}

export function CastVoteSheet({
  onSubmitVote,
  setShowFeesSettingSheet,
  setRecommendedGasLimit,
  proposalId,
  isProposalInVotingPeriod,
  setGasLimit,
  feeDenom,
  forceChain,
  forceNetwork,
}: CastVoteSheetProps): React.ReactElement {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
  const activeChainInfo = useChainInfo(activeChain)
  const _selectedNetwork = useSelectedNetwork()
  const selectedNetwork = useMemo(
    () => forceNetwork || _selectedNetwork,
    [_selectedNetwork, forceNetwork],
  )
  const simulateVote = useSimulateVote(activeChain, selectedNetwork)
  const firstTime = useRef(true)
  const [simulating, setSimulating] = useState(true)
  const [selectedOption, setSelectedOption] = useState<VoteOptions | undefined>(undefined)

  const VoteOptionsList = useMemo(() => {
    const data = [
      {
        label: VoteOptions.YES,
        icon: <ThumbsUp size={20} />,
        selectedCSS: 'text-white-100 bg-green-600',
      },
      {
        label: VoteOptions.NO,
        icon: <ThumbsDown size={20} />,
        selectedCSS: 'text-white-100 bg-red-300',
      },
    ]
    if (activeChainInfo.chainId !== 'atomone-1') {
      data.push({
        label: VoteOptions.NO_WITH_VETO,
        icon: <ThumbsDown size={20} />,
        selectedCSS: 'text-white-100 bg-indigo-300',
      })
    }
    data.push({
      label: VoteOptions.ABSTAIN,
      icon: <Prohibit size={20} />,
      selectedCSS: 'text-white-100 bg-yellow-600',
    })
    return data
  }, [activeChainInfo.chainId])

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

    if (isProposalInVotingPeriod) {
      simulate().catch(captureException)
    }
    return () => {
      cancelled = true
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeDenom.coinMinimalDenom, proposalId, simulateVote, isProposalInVotingPeriod])

  return (
    <>
      <div className='flex flex-col items-center gap-3'>
        {VoteOptionsList.map((option) => (
          <button
            key={option.label}
            onClick={() => setSelectedOption(option.label)}
            className={classNames(
              'flex items-center w-full px-5 py-4 rounded-xl cursor-pointer border',
              {
                'bg-secondary-100 text-foreground hover:bg-secondary-200 border-transparent':
                  selectedOption !== option.label,
                'text-green-600 bg-green-500/10 border-green-600': selectedOption === option.label,
              },
            )}
          >
            <span className='mr-3'>{option.icon}</span>
            <span
              className={cn('text-base font-bold', {
                'text-foreground': selectedOption !== option.label,
                'text-green-600': selectedOption === option.label,
              })}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {!simulating ? (
        <DisplayFee className='mt-4' setShowFeesSettingSheet={setShowFeesSettingSheet} />
      ) : (
        <div className='flex justify-center'>
          <LoaderAnimation color={Colors.green600} />
        </div>
      )}

      <Button
        className='w-full mt-6'
        disabled={!selectedOption || simulating}
        onClick={() => onSubmitVote(selectedOption as VoteOptions)}
      >
        Submit
      </Button>
    </>
  )
}
