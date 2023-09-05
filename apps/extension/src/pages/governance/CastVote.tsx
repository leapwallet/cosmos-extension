import { calculateFee } from '@cosmjs/stargate'
import {
  FeeTokenData,
  GasOptions,
  useDefaultGasEstimates,
  useGasAdjustment,
  useGov,
  useNativeFeeDenom,
  useSimulateVote,
  VoteOptions,
} from '@leapwallet/cosmos-wallet-hooks'
import { DefaultGasEstimates, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTxCallBack } from 'utils/txCallback'

import CastVoteSheet from './CastVoteSheet'
import ReviewVoteCast from './ReviewVoteCast'

const useGetWallet = Wallet.useGetWallet

type CastVoteProps = {
  className?: string
  proposalId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchVote: () => Promise<any>
  showCastVoteSheet: boolean
  setShowCastVoteSheet: React.Dispatch<React.SetStateAction<boolean>>
}

export const CastVote: React.FC<CastVoteProps> = ({
  className,
  proposalId,
  refetchVote,
  showCastVoteSheet,
  setShowCastVoteSheet,
}) => {
  const activeChain = useActiveChain()
  const defaultGasPrice = useDefaultGasPrice()
  const getWallet = useGetWallet()
  const txCallback = useTxCallBack()
  const firstTime = useRef(true)
  const defaultGasEstimates = useDefaultGasEstimates()

  const [simulating, setSimulating] = useState(true)

  const simulateVote = useSimulateVote()
  const { loading, vote, error, memo, setMemo, feeText, showLedgerPopup, clearError, ledgerError } =
    useGov({
      proposalId,
    })
  const nativeFeeDenom = useNativeFeeDenom()
  const gasAdjustment = useGasAdjustment()

  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
  const [gasError, setGasError] = useState<string | null>(null)
  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom)
  const [selectedVoteOption, setSelectedVoteOption] = useState<VoteOptions | undefined>(undefined)
  const [recommendedGasLimit, setRecommendedGasLimit] = useState(
    defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER?.toString() ??
      DefaultGasEstimates.DEFAULT_GAS_TRANSFER.toString(),
  )
  const [gasLimit, setGasLimit] = useState<string>(recommendedGasLimit)
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: GasOptions.LOW,
    gasPrice: defaultGasPrice.gasPrice,
  })

  const customFee = useMemo(() => {
    const gasEstimate = Math.ceil(Number(gasLimit) * gasAdjustment)
    return calculateFee(gasEstimate, gasPriceOption.gasPrice)
  }, [gasAdjustment, gasLimit, gasPriceOption.gasPrice])

  const handleGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
      setGasPriceOption(value)
      setFeeDenom(feeBaseDenom.denom)
    },
    [],
  )

  const submitVote = useCallback(
    async (option: VoteOptions) => {
      try {
        const wallet = await getWallet()
        const result = await vote({
          wallet,
          callback: txCallback,
          voteOption: option,
          customFee: {
            stdFee: customFee,
            feeDenom,
          },
          isSimulation: false,
        })
        return !!result
      } catch (e) {
        return false
      }
    },
    [customFee, feeDenom, getWallet, txCallback, vote],
  )

  const handleCloseReviewVoteCastSheet = useCallback(() => {
    setSelectedVoteOption(undefined)
    setShowCastVoteSheet(false)
    clearError()
  }, [clearError, setShowCastVoteSheet])

  const handleCloseFeeSettingSheet = useCallback(() => {
    setShowFeesSettingSheet(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    const simulate = async () => {
      try {
        const result = await simulateVote({
          proposalId,
          voteOption: VoteOptions.YES,
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
  }, [proposalId, simulateVote])

  useEffect(() => {
    setGasPriceOption({
      option: GasOptions.LOW,
      gasPrice: defaultGasPrice.gasPrice,
    })
  }, [defaultGasPrice])

  return (
    <div className={classNames('', className)}>
      <GasPriceOptions
        recommendedGasLimit={recommendedGasLimit}
        gasLimit={gasLimit}
        setGasLimit={(value) => setGasLimit(value.toString())}
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={handleGasPriceOptionChange}
        error={gasError}
        setError={setGasError}
      >
        <CastVoteSheet
          isOpen={showCastVoteSheet && !showLedgerPopup}
          feeDenom={feeDenom}
          gasLimit={gasLimit}
          gasPrice={gasPriceOption.gasPrice}
          setShowFeesSettingSheet={setShowFeesSettingSheet}
          onCloseHandler={() => setShowCastVoteSheet(false)}
          onSubmitVote={setSelectedVoteOption}
          loadingFees={simulating}
        />
        <FeesSettingsSheet
          showFeesSettingSheet={showFeesSettingSheet}
          onClose={handleCloseFeeSettingSheet}
          gasError={gasError}
        />
        <ReviewVoteCast
          isOpen={selectedVoteOption !== undefined}
          proposalId={proposalId}
          error={error}
          ledgerError={ledgerError}
          loading={loading}
          feeText={feeText}
          memo={memo}
          setMemo={setMemo}
          selectedVote={selectedVoteOption}
          onSubmitVote={submitVote}
          refetchCurrVote={refetchVote}
          onCloseHandler={handleCloseReviewVoteCastSheet}
          showLedgerPopup={showLedgerPopup}
        />
      </GasPriceOptions>
    </div>
  )
}
