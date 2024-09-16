import { OfflineSigner } from '@cosmjs/proto-signing'
import {
  FeeTokenData,
  GasOptions,
  useActiveChain,
  useNtrnGov,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { Prohibit, ThumbsDown, ThumbsUp } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { LoaderAnimation } from 'components/loader/Loader'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { useTxCallBack } from 'utils/txCallback'

import { CastVoteProps } from '../components'
import { NtrnReviewVoteCast } from './index'
import { VoteOptions } from './utils'

const useGetWallet = Wallet.useGetWallet

const VoteOptionsList = [
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
  {
    label: VoteOptions.ABSTAIN,
    icon: <Prohibit size={20} />,
    selectedCSS: 'text-white-100 bg-yellow-600',
  },
]

type CastVoteSheetProps = {
  proposalId: string
  isProposalInVotingPeriod: boolean
  // eslint-disable-next-line no-unused-vars
  onSubmitVote: (option: VoteOptions) => void
  setShowFeesSettingSheet: React.Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
  onCloseHandler: () => void
  showFeesSettingSheet: boolean
  gasError: string
  forceChain?: SupportedChain
  simulateNtrnVote: (
    wallet: OfflineSigner,
    proposalId: number,
    option: VoteOptions,
  ) => Promise<void>
}

function CastVoteSheet({
  proposalId,
  isProposalInVotingPeriod,
  isOpen,
  setShowFeesSettingSheet,
  onCloseHandler,
  onSubmitVote,
  showFeesSettingSheet,
  gasError,
  forceChain,
  simulateNtrnVote,
}: CastVoteSheetProps) {
  const [selectedOption, setSelectedOption] = useState<VoteOptions | undefined>(undefined)

  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
  const getWallet = useGetWallet(forceChain)
  const [simulateError, setSimulateError] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    if (proposalId && selectedOption && isProposalInVotingPeriod) {
      ;(async () => {
        try {
          setIsSimulating(true)
          const wallet = await getWallet()
          await simulateNtrnVote(wallet, Number(proposalId), selectedOption as VoteOptions)
        } catch (_error) {
          const error = _error as Error
          setSimulateError(error.message)
        } finally {
          setIsSimulating(false)
        }
      })()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId, selectedOption, isProposalInVotingPeriod])

  useCaptureTxError(simulateError)

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onCloseHandler}
      title='Cast your Vote'
      closeOnBackdropClick={true}
    >
      <div className='flex flex-col items-center gap-4'>
        {VoteOptionsList.map((option) => (
          <button
            key={option.label}
            onClick={() => setSelectedOption(option.label)}
            className={classNames('flex items-center w-[344px] p-4 rounded-2xl cursor-pointer', {
              'dark:text-gray-200 dark:bg-gray-900 text-gray-600 bg-white-100':
                selectedOption !== option.label,
              [option.selectedCSS]: selectedOption === option.label,
            })}
          >
            <span className='mr-3'>{option.icon}</span>
            <span className='text-base font-bold dark:text-white-100'>{option.label}</span>
          </button>
        ))}
      </div>

      <DisplayFee className='mt-4' setShowFeesSettingSheet={setShowFeesSettingSheet} />

      {gasError && !showFeesSettingSheet ? (
        <p className='text-red-300 text-sm font-medium mt-2 text-center'>{gasError}</p>
      ) : null}

      <Buttons.Generic
        color={Colors.getChainColor(activeChain)}
        size='normal'
        className='w-[344px] py-3 mt-4'
        disabled={!selectedOption || !!gasError || isSimulating}
        onClick={() => onSubmitVote(selectedOption as VoteOptions)}
      >
        {isSimulating ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
      </Buttons.Generic>
    </BottomModal>
  )
}

export const NtrnCastVote = observer(
  ({
    isProposalInVotingPeriod,
    proposalId,
    refetchVote,
    showCastVoteSheet,
    setShowCastVoteSheet,
    className,
    forceChain,
    forceNetwork,
  }: CastVoteProps) => {
    const getWallet = useGetWallet(forceChain)
    const denoms = rootDenomsStore.allDenoms
    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain: forceChain,
      selectedNetwork: forceNetwork,
    })
    const txCallback = useTxCallBack()

    const {
      setFeeDenom,
      userPreferredGasPrice,
      userPreferredGasLimit,
      setGasOption,
      gasOption,
      gasEstimate,
      setUserPreferredGasLimit,
      setUserPreferredGasPrice,
      clearTxError,
      txError,
      memo,
      setMemo,
      isVoting,
      handleVote,
      simulateNtrnVote,
    } = useNtrnGov(denoms, forceChain, forceNetwork)

    const [selectedVoteOption, setSelectedVoteOption] = useState<VoteOptions | undefined>(undefined)
    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
    const [gasError, setGasError] = useState<string | null>(null)
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: GasOptions.LOW,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    })

    const handleGasPriceOptionChange = useCallback(
      (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
        setGasPriceOption(value)
        setFeeDenom(feeBaseDenom.denom)
      },
      [setFeeDenom],
    )

    // initialize gasPriceOption with correct defaultGasPrice.gasPrice
    useEffect(() => {
      setGasPriceOption({
        option: gasOption,
        gasPrice: defaultGasPrice.gasPrice,
      })

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultGasPrice.gasPrice])

    useEffect(() => {
      setGasOption(gasPriceOption.option)
      setUserPreferredGasPrice(gasPriceOption.gasPrice)
    }, [gasPriceOption, setGasOption, setUserPreferredGasPrice])

    const handleCloseReviewVoteCastSheet = useCallback(() => {
      setSelectedVoteOption(undefined)
      setShowCastVoteSheet(false)
      clearTxError()
    }, [clearTxError, setShowCastVoteSheet])

    const submitVote = async () => {
      clearTxError()

      try {
        const wallet = await getWallet()
        await handleVote({
          wallet,
          callback: txCallback,
          voteOption: selectedVoteOption as VoteOptions,
          proposalId: Number(proposalId),
        })
        return true
      } catch (err: unknown) {
        return false
      }
    }

    return (
      <div className={classNames('', className)}>
        <GasPriceOptions
          recommendedGasLimit={gasEstimate.toString()}
          gasLimit={userPreferredGasLimit?.toString() ?? gasEstimate.toString()}
          setGasLimit={(gasLimit: number | string | BigNumber) =>
            setUserPreferredGasLimit(Number(gasLimit.toString()))
          }
          gasPriceOption={gasPriceOption}
          onGasPriceOptionChange={handleGasPriceOptionChange}
          error={gasError}
          setError={setGasError}
          chain={forceChain}
          network={forceNetwork}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        >
          <CastVoteSheet
            proposalId={proposalId}
            isProposalInVotingPeriod={isProposalInVotingPeriod}
            isOpen={showCastVoteSheet}
            setShowFeesSettingSheet={setShowFeesSettingSheet}
            onCloseHandler={() => setShowCastVoteSheet(false)}
            onSubmitVote={setSelectedVoteOption}
            showFeesSettingSheet={showFeesSettingSheet}
            gasError={gasError ?? ''}
            simulateNtrnVote={simulateNtrnVote}
            forceChain={forceChain}
          />

          <FeesSettingsSheet
            showFeesSettingSheet={showFeesSettingSheet}
            onClose={() => setShowFeesSettingSheet(false)}
            gasError={gasError}
          />

          <NtrnReviewVoteCast
            isOpen={selectedVoteOption !== undefined}
            proposalId={proposalId}
            error={txError}
            loading={isVoting}
            memo={memo}
            setMemo={setMemo}
            selectedVote={selectedVoteOption}
            onSubmitVote={submitVote}
            refetchCurrVote={refetchVote}
            onCloseHandler={handleCloseReviewVoteCastSheet}
            gasOption={gasPriceOption.option}
            forceChain={forceChain}
          />
        </GasPriceOptions>
      </div>
    )
  },
)
