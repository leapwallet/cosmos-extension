import { calculateFee } from '@cosmjs/stargate'
import {
  FeeTokenData,
  GasOptions,
  TxCallback,
  useChainApis,
  useChainCosmosSDK,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useGasPriceSteps,
  useGetFeeMarketGasPricesSteps,
  useGov,
  useHasToCalculateDynamicFee,
  useNativeFeeDenom,
  useSelectedNetwork,
  useSimulateVote,
  VoteOptions,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  CosmosSDK,
  DefaultGasEstimates,
  GasPrice,
  getOsmosisGasPriceSteps,
  getSimulationFee,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import BottomModal from 'components/new-bottom-modal'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { useTxCallBack } from 'utils/txCallback'

import { CastVoteSheet, ProposalStatusEnum, ReviewVoteCast } from './index'
import { VoteTxnSheet } from './VoteTxnSheet'

const useGetWallet = Wallet.useGetWallet

export type CastVoteProps = {
  className?: string
  proposalId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchVote: () => Promise<any>
  showCastVoteSheet: boolean
  setShowCastVoteSheet: React.Dispatch<React.SetStateAction<boolean>>
  forceChain?: SupportedChain
  forceNetwork?: 'mainnet' | 'testnet'
  isProposalInVotingPeriod: boolean
}

export const CastVote = observer(
  ({
    className,
    proposalId,
    refetchVote,
    showCastVoteSheet,
    setShowCastVoteSheet,
    isProposalInVotingPeriod,
    forceChain,
    forceNetwork,
  }: CastVoteProps) => {
    const _activeChain = useActiveChain()
    const [showTxPage, setShowTxPage] = useState(false)
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
    const _selectedNetwork = useSelectedNetwork()
    const selectedNetwork = useMemo(
      () => forceNetwork || _selectedNetwork,
      [_selectedNetwork, forceNetwork],
    )
    const denoms = rootDenomsStore.allDenoms

    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork,
    })
    const getWallet = useGetWallet()
    const txCallback = useTxCallBack()
    const defaultGasEstimates = useDefaultGasEstimates()

    const activeChainCosmosSDK = useChainCosmosSDK(activeChain)
    const {
      loading,
      vote,
      error,
      memo,
      setMemo,
      feeText,
      showLedgerPopup,
      clearError,
      ledgerError,
    } = useGov({
      denoms,
      proposalId,
      forceChain: activeChain,
      forceNetwork: selectedNetwork,
    })

    const { lcdUrl } = useChainApis(activeChain, selectedNetwork)
    const allChainsGasPriceSteps = useGasPriceSteps()
    const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork)
    const gasAdjustment = useGasAdjustmentForChain(activeChain)

    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
    const [gasError, setGasError] = useState<string | null>(null)
    const [feeDenom, setFeeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom)
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
    const simulateVote = useSimulateVote(activeChain, selectedNetwork)
    const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork)
    const getFeeMarketGasPricesSteps = useGetFeeMarketGasPricesSteps(activeChain, selectedNetwork)
    const firstTime = useRef(true)

    useEffect(() => {
      ;(async function () {
        let low: number, medium: number, high: number
        let updateGasPriceSteps = false

        if (feeDenom.coinMinimalDenom === 'uosmo' && activeChain === 'osmosis') {
          ;({ low, medium, high } = await getOsmosisGasPriceSteps(
            lcdUrl ?? '',
            allChainsGasPriceSteps,
          ))
          updateGasPriceSteps = true
        } else if (
          hasToCalculateDynamicFee &&
          feeDenom.coinMinimalDenom === nativeFeeDenom?.coinMinimalDenom
        ) {
          ;({ low, medium, high } = await getFeeMarketGasPricesSteps(feeDenom.coinMinimalDenom))
          updateGasPriceSteps = true
        }

        if (updateGasPriceSteps) {
          switch (gasPriceOption.option) {
            case GasOptions.LOW: {
              setGasPriceOption((prev) => ({
                ...prev,
                gasPrice: GasPrice.fromString(`${low}${feeDenom.coinMinimalDenom}`),
              }))
              break
            }

            case GasOptions.MEDIUM: {
              setGasPriceOption((prev) => ({
                ...prev,
                gasPrice: GasPrice.fromString(`${medium}${feeDenom.coinMinimalDenom}`),
              }))
              break
            }

            case GasOptions.HIGH: {
              setGasPriceOption((prev) => ({
                ...prev,
                gasPrice: GasPrice.fromString(`${high}${feeDenom.coinMinimalDenom}`),
              }))
              break
            }
          }
        }
      })()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      activeChain,
      gasLimit,
      feeDenom.coinMinimalDenom,
      gasPriceOption.option,
      nativeFeeDenom?.coinMinimalDenom,
    ])

    const customFee = useMemo(() => {
      const gasEstimate = Math.ceil(Number(gasLimit) * gasAdjustment)
      return calculateFee(gasEstimate, gasPriceOption.gasPrice as unknown as string)
    }, [gasAdjustment, gasLimit, gasPriceOption.gasPrice])

    const handleGasPriceOptionChange = useCallback(
      (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
        setGasPriceOption(value)
        setFeeDenom({ ...feeBaseDenom.denom, ibcDenom: feeBaseDenom.ibcDenom })
      },
      [],
    )

    const modifiedCallback: TxCallback = useCallback(
      (status) => {
        setShowTxPage(true)
      },
      [setShowTxPage],
    )

    const submitVote = useCallback(
      async (option: VoteOptions) => {
        try {
          const wallet = await getWallet(activeChain)
          const result = await vote({
            wallet,
            callback: modifiedCallback,
            voteOption: option,
            customFee: {
              stdFee: customFee,
              feeDenom,
            },
            isSimulation: false,
          })

          return !!result
        } catch (e) {
          captureException(e)
          return false
        }
      },
      [activeChain, customFee, feeDenom, getWallet, txCallback, vote],
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
          const fee = getSimulationFee(feeDenom.coinMinimalDenom)
          const result = await simulateVote({
            proposalId,
            voteOption: VoteOptions.YES,
            fee,
          })

          if (result !== null && !cancelled) {
            const _estimate = result.gasUsed.toString()
            setRecommendedGasLimit(
              String(
                Number(_estimate) * (activeChainCosmosSDK === CosmosSDK.Version_Point_47 ? 1.5 : 1),
              ),
            )
            if (firstTime.current) {
              setGasLimit(
                String(
                  Number(_estimate) *
                    (activeChainCosmosSDK === CosmosSDK.Version_Point_47 ? 1.5 : 1),
                ),
              )
              firstTime.current = false
            }
          }
        } catch (e) {
          //
        }
      }
      if (isProposalInVotingPeriod) {
        simulate().catch(captureException)
      }
      return () => {
        cancelled = true
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChainCosmosSDK, proposalId, simulateVote, isProposalInVotingPeriod])

    useEffect(() => {
      setGasPriceOption({
        option: GasOptions.LOW,
        gasPrice: defaultGasPrice.gasPrice,
      })

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

    return (
      <div className={classNames('', className)}>
        <GasPriceOptions
          recommendedGasLimit={recommendedGasLimit}
          gasLimit={gasLimit}
          setGasLimit={(value: number | string | BigNumber) => setGasLimit(value.toString())}
          gasPriceOption={gasPriceOption}
          onGasPriceOptionChange={handleGasPriceOptionChange}
          error={gasError}
          setError={setGasError}
          chain={activeChain}
          network={selectedNetwork}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        >
          <BottomModal
            isOpen={showCastVoteSheet && !showLedgerPopup}
            onClose={() => setShowCastVoteSheet(false)}
            title='Call your Vote'
            className='!pt-8 p-6'
          >
            <CastVoteSheet
              feeDenom={feeDenom}
              gasLimit={gasLimit}
              gasPrice={gasPriceOption.gasPrice}
              setShowFeesSettingSheet={setShowFeesSettingSheet}
              onSubmitVote={setSelectedVoteOption}
              setRecommendedGasLimit={setRecommendedGasLimit}
              proposalId={proposalId}
              isProposalInVotingPeriod={isProposalInVotingPeriod}
              setGasLimit={setGasLimit}
              forceChain={activeChain}
              forceNetwork={selectedNetwork}
            />
          </BottomModal>

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
            gasOption={gasPriceOption.option}
            forceChain={activeChain}
          />
          {showTxPage && (
            <VoteTxnSheet
              isOpen={showTxPage}
              onClose={() => setShowTxPage(false)}
              forceChain={forceChain}
              forceNetwork={forceNetwork}
              refetchVote={refetchVote}
            />
          )}
        </GasPriceOptions>
      </div>
    )
  },
)
