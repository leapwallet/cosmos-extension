import { calculateFee } from '@cosmjs/stargate'
import {
  getTxnLogAmountValue,
  useGasAdjustmentForChain,
  useGasRateQuery,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import { DenomsRecord, LedgerError, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { TRANSFER_STATE, TXN_STATUS } from '@leapwallet/elements-core'
import { RouteAggregator } from '@leapwallet/elements-hooks'
import { TransferAssetRelease } from '@skip-go/client'
import { TxPageProps } from 'pages/swaps-v2/components'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SourceChain, SwapFeeInfo, SwapTxnStatus, TransferSequence } from 'types/swap'

import { useExecuteLifiTransaction } from './useExecuteLifiTransaction'
import { useExecuteSkipTransaction } from './useExecuteSkipTransaction'

type ExecuteTxParams = Omit<TxPageProps, 'onClose' | 'rootDenomsStore' | 'rootCW20DenomsStore'> & {
  setShowLedgerPopup: React.Dispatch<React.SetStateAction<boolean>>
  setShowLedgerPopupText: React.Dispatch<React.SetStateAction<string>>
  setLedgerError?: (ledgerError?: string) => void
  setFeeAmount: React.Dispatch<React.SetStateAction<string>>
  setTrackingInSync: React.Dispatch<React.SetStateAction<boolean>>
  setIsSigningComplete: React.Dispatch<React.SetStateAction<boolean>>
  denoms: DenomsRecord
  cw20Denoms: DenomsRecord
  swapFeeInfo?: SwapFeeInfo
}

export function useExecuteTx({
  setShowLedgerPopup,
  setShowLedgerPopupText,
  setLedgerError,
  routingInfo,
  sourceChain,
  feeDenom,
  gasEstimate,
  gasOption,
  userPreferredGasLimit,
  userPreferredGasPrice,
  setFeeAmount,
  feeAmount,
  setIsSigningComplete,
  denoms,
  swapFeeInfo,
  ...props
}: ExecuteTxParams) {
  const chainInfos = useGetChains()

  const [isLoading, setIsLoading] = useState(true)
  const [timeoutError, setTimeoutError] = useState(false)
  const [firstTxnError, setFirstTxnError] = useState<string>()
  const [unableToTrackError, setUnableToTrackError] = useState<boolean | null>(null)

  const [txStatus, setTxStatus] = useState<SwapTxnStatus[]>(() =>
    Array.from({ length: routingInfo?.route?.transactionCount || 1 }, () => ({
      status: TXN_STATUS.INIT,
      responses: [],
      isComplete: false,
    })),
  )

  const gasAdjustment = useGasAdjustmentForChain(sourceChain?.key ?? '')
  const gasPrices = useGasRateQuery(denoms, (sourceChain?.key ?? '') as SupportedChain)
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom]

  const fee = useMemo(() => {
    if (feeAmount) {
      return
    }

    const _gasLimit = userPreferredGasLimit ?? gasEstimate
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption]
    if (!_gasPrice) return

    const gasAdjustmentValue = gasAdjustment

    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gasPriceOptions,
    gasOption,
    gasEstimate,
    userPreferredGasLimit,
    userPreferredGasPrice,
    sourceChain,
    feeDenom,
  ])

  useEffect(() => {
    if (fee) {
      setFeeAmount(fee.amount[0].amount)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee])

  const updateTxStatus = useCallback(
    (messageIndex: number, args: SwapTxnStatus) => {
      setTxStatus((prevTxStatus) => {
        const newTxStatus = [...prevTxStatus]
        newTxStatus.splice(messageIndex, 1, args)
        return newTxStatus
      })
    },
    [setTxStatus],
  )

  const getSwapFeeInfo = useCallback(async () => {
    if (!swapFeeInfo) return null
    const { feeCharged, feeAmountValue, feeCollectionAddress, swapFeeDenomInfo } = swapFeeInfo

    const amountValue = feeAmountValue
      ? (await getTxnLogAmountValue(feeAmountValue.toString(), {
          chainId: swapFeeDenomInfo?.originChainId,
          chain: Object.values(chainInfos).find(
            (chain) => chain.chainId === swapFeeDenomInfo?.originChainId,
          )?.key as SupportedChain,
          coinGeckoId: swapFeeDenomInfo?.coingeckoId ?? '',
          coinMinimalDenom: swapFeeDenomInfo?.originDenom,
        })) ?? null
      : null

    return {
      feeCharged,
      feeCollectionAddress,
      feeAmount: amountValue,
    }
  }, [chainInfos, swapFeeInfo])

  const handleTxError = useCallback(
    (
      messageIndex: number,
      errorMessage: string,
      chain?: SourceChain,
      transferSequence?: TransferSequence[] | undefined,
      transferAssetRelease?: TransferAssetRelease | undefined,
    ) => {
      setFirstTxnError(errorMessage)
      updateTxStatus(messageIndex, {
        status: TXN_STATUS.FAILED,
        responses: transferSequence ?? [
          {
            state: TRANSFER_STATE.TRANSFER_FAILURE,
            error: { message: errorMessage },
            type: 'ibcTransfer',
            destChainID: '',
            srcChainID: chain?.chainId || '',
            packetTxs: { sendTx: null, receiveTx: null, acknowledgeTx: null, timeoutTx: null },
            originalState: TRANSFER_STATE.TRANSFER_FAILURE,
          },
        ],
        transferAssetRelease,
        isComplete: true,
      })
    },
    [setFirstTxnError, updateTxStatus],
  )

  const executeSkipTx = useExecuteSkipTransaction({
    fee,
    feeAmount,
    handleTxError,
    sourceChain,
    setIsLoading,
    setTimeoutError,
    setFirstTxnError,
    setUnableToTrackError,
    setLedgerError,
    routingInfo,
    updateTxStatus,
    setIsSigningComplete,
    feeDenom,
    getSwapFeeInfo,
    setShowLedgerPopup,
    setShowLedgerPopupText,
    userPreferredGasLimit,
    userPreferredGasPrice,
    gasEstimate,
    gasOption,
    denoms,
    ...props,
  })

  const executeLifiTx = useExecuteLifiTransaction({
    fee,
    feeAmount,
    handleTxError,
    sourceChain,
    setIsLoading,
    setTimeoutError,
    setFirstTxnError,
    setUnableToTrackError,
    setLedgerError,
    routingInfo,
    updateTxStatus,
    setIsSigningComplete,
    feeDenom,
    getSwapFeeInfo,
    ...props,
  })

  const executeTx = useCallback(async () => {
    if (routingInfo?.aggregator === RouteAggregator.LIFI) {
      await executeLifiTx(routingInfo.messages, routingInfo.route)
      return
    }

    if (routingInfo?.aggregator === RouteAggregator.SKIP) {
      await executeSkipTx(routingInfo?.messages, routingInfo?.route)
      return
    }

    return
  }, [
    routingInfo?.aggregator,
    routingInfo.messages,
    routingInfo.route,
    executeSkipTx,
    executeLifiTx,
  ])

  const callExecuteTx = useCallback(async () => {
    try {
      setIsLoading(true)
      await executeTx()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err instanceof LedgerError) {
        setLedgerError && setLedgerError(err.message)
      } else {
        setTxStatus(
          Array.from({ length: routingInfo?.route?.transactionCount ?? 1 }, () => ({
            status: TXN_STATUS.INIT,
            responses: [],
            isComplete: false,
          })),
        )
      }
    } finally {
      setShowLedgerPopup(false)
      setIsLoading(false)
      setIsSigningComplete(true)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeTx, setIsSigningComplete, routingInfo?.route])

  return {
    callExecuteTx,
    txStatus,
    timeoutError,
    firstTxnError,
    unableToTrackError,
    isLoading,
  }
}
