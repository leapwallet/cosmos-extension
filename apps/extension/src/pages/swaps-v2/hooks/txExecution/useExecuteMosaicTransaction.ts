import { StdFee } from '@cosmjs/stargate'
import {
  CosmosTxType,
  getChainId,
  getMetaDataForSwapTx,
  getTxnLogAmountValue,
  LeapWalletApi,
  useActiveWallet,
  useChainApis,
  useGetChains,
  useInvalidateTokenBalances,
} from '@leapwallet/cosmos-wallet-hooks'
import { AptosTx, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { TRANSFER_STATE, TXN_STATUS } from '@leapwallet/elements-core'
import { TransferAssetRelease } from '@skip-go/client'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useCallback } from 'react'
import { SourceChain, SourceToken, SwapFeeInfo, SwapTxnStatus, TransferSequence } from 'types/swap'

import { SWAP_NETWORK } from '../../constants'
import type { RoutingInfo } from '../../types'
import { useGetChainsToShow } from '../useGetChainsToShow'
import { MosaicRouteQueryResponse } from '../useMosaicRoute'
import { usePollTx } from './polling/usePollTx'
import { useInvalidateSwapAssetsQueries } from './useInvalidateSwapAssetsQueries'

export type ExecuteMosaicTransactionParams = {
  setLedgerError?: (ledgerError?: string) => void
  setTrackingInSync: React.Dispatch<React.SetStateAction<boolean>>
  setIsSigningComplete: React.Dispatch<React.SetStateAction<boolean>>
  swapFeeInfo?: SwapFeeInfo
  fee: StdFee | undefined
  feeAmount: string | undefined
  sourceChain: SourceChain | undefined
  routingInfo: RoutingInfo
  inAmount: string
  sourceToken: SourceToken | null
  destinationToken: SourceToken | null
  destinationChain: SourceChain | undefined
  amountOut: string
  feeDenom: NativeDenom & {
    ibcDenom?: string | undefined
  }
  handleTxError: (
    messageIndex: number,
    errorMessage: string,
    chain?: SourceChain,
    transferSequence?: TransferSequence[] | undefined,
    transferAssetRelease?: TransferAssetRelease | undefined,
  ) => void
  setIsLoading: (isLoading: boolean) => void
  setTimeoutError: (timeoutError: boolean) => void
  setFirstTxnError: (firstTxnError: string | undefined) => void
  setUnableToTrackError: (unableToTrackError: boolean | null) => void
  updateTxStatus: (messageIndex: number, args: SwapTxnStatus) => void
  refetchSourceBalances?: (() => void) | undefined
  refetchDestinationBalances?: (() => void) | undefined
  getSwapFeeInfo: () => Promise<{
    feeCharged: number
    feeCollectionAddress: string | undefined
    feeAmount: number | null
  } | null>
  callbackPostTx?: (() => void) | undefined
}

export function useExecuteMosaicTransaction({
  handleTxError,
  inAmount,
  amountOut,
  destinationChain,
  sourceToken,
  sourceChain,
  destinationToken,
  setIsLoading,
  setTimeoutError,
  setFirstTxnError,
  setUnableToTrackError,
  setLedgerError,
  updateTxStatus,
  setIsSigningComplete,
  setTrackingInSync,
  refetchSourceBalances,
  refetchDestinationBalances,
  routingInfo,
  fee,
  feeAmount,
  feeDenom,
  callbackPostTx,
  swapFeeInfo,
}: ExecuteMosaicTransactionParams) {
  const { chainsToShow } = useGetChainsToShow()
  const { lcdUrl } = useChainApis('movement', 'mainnet')
  const getAptosSigner = Wallet.useAptosSigner()
  const chainInfos = useGetChains()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const invalidateBalances = useInvalidateTokenBalances()
  const invalidateSwapAssets = useInvalidateSwapAssetsQueries()
  const activeWallet = useActiveWallet()

  const pollTx = usePollTx(
    setTrackingInSync,
    setUnableToTrackError,
    updateTxStatus,
    handleTxError,
    refetchSourceBalances,
    refetchDestinationBalances,
  )

  const logTxToDB = useCallback(
    async (txHash: string) => {
      const sourceDenomChainInfo = chainInfos[(sourceToken?.chain ?? '') as SupportedChain]
      const destinationDenomChainInfo =
        chainInfos[(destinationToken?.chain ?? '') as SupportedChain]

      const txnLogAmountValue = await getTxnLogAmountValue(
        inAmount,
        {
          coinGeckoId: sourceToken?.coinGeckoId ?? '',
          coinMinimalDenom: sourceToken?.coinMinimalDenom ?? '',
          chainId:
            getChainId(sourceDenomChainInfo, SWAP_NETWORK) ?? String(sourceChain?.chainId ?? ''),
          chain: (sourceToken?.chain ?? '') as SupportedChain,
        },
        amountOut,
        {
          coinGeckoId: destinationToken?.coinGeckoId ?? '',
          coinMinimalDenom: destinationToken?.coinMinimalDenom ?? '',
          chainId:
            getChainId(destinationDenomChainInfo, SWAP_NETWORK) ??
            String(destinationChain?.chainId ?? ''),
          chain: (destinationToken?.chain ?? '') as SupportedChain,
        },
      )

      let metadata
      metadata = getMetaDataForSwapTx(
        'mosaic_api',
        {
          denom: sourceToken?.coinMinimalDenom ?? '',
          amount: Number(inAmount) * 10 ** Number(sourceToken?.coinDecimals ?? 0),
        },
        {
          denom: destinationToken?.coinMinimalDenom ?? '',
          amount: Number(amountOut) * 10 ** Number(destinationToken?.coinDecimals ?? 0),
        },
      )

      try {
        if (swapFeeInfo) {
          metadata = {
            ...metadata,
            ...swapFeeInfo,
          }
        }
      } catch (_) {
        //
      }

      txPostToDB({
        txHash,
        txType: CosmosTxType.Swap,
        amount: txnLogAmountValue,
        metadata,
        feeDenomination: feeDenom.coinMinimalDenom,
        feeQuantity: feeAmount ?? fee?.amount[0].amount,
        forceWalletAddress:
          activeWallet?.addresses?.[(sourceChain?.key as SupportedChain) ?? 'cosmos'],
        forceChain: String(sourceChain?.key ?? ''),
        forceNetwork: SWAP_NETWORK,
      })

      const timerId = setTimeout(() => {
        invalidateBalances((sourceChain?.key as SupportedChain) ?? 'cosmos')
        invalidateBalances(destinationChain?.key as SupportedChain)

        try {
          refetchSourceBalances && refetchSourceBalances()
          refetchDestinationBalances && refetchDestinationBalances()
        } catch (_) {
          //
        }

        try {
          callbackPostTx && callbackPostTx()
        } catch (_) {
          //
        }

        invalidateSwapAssets((sourceChain?.key as SupportedChain) ?? 'cosmos')
        invalidateSwapAssets(destinationChain?.key as SupportedChain)

        clearTimeout(timerId)
      }, 2000)
    },
    [
      chainInfos,
      sourceToken?.chain,
      sourceToken?.coinGeckoId,
      sourceToken?.coinMinimalDenom,
      sourceToken?.coinDecimals,
      destinationToken?.chain,
      destinationToken?.coinGeckoId,
      destinationToken?.coinMinimalDenom,
      destinationToken?.coinDecimals,
      inAmount,
      sourceChain?.chainId,
      sourceChain?.key,
      amountOut,
      destinationChain?.chainId,
      destinationChain?.key,
      txPostToDB,
      feeDenom.coinMinimalDenom,
      feeAmount,
      fee?.amount,
      activeWallet?.addresses,
      swapFeeInfo,
      invalidateBalances,
      invalidateSwapAssets,
      refetchSourceBalances,
      refetchDestinationBalances,
      callbackPostTx,
    ],
  )

  return useCallback(
    async (route?: MosaicRouteQueryResponse) => {
      if (!route) {
        handleTxError(0, 'Error fetching route info', sourceChain)
        setIsLoading(false)
        return
      }

      setTimeoutError(false)
      setFirstTxnError(undefined)
      setUnableToTrackError(null)
      setLedgerError && setLedgerError(undefined)

      const messageIndex = 0

      const messageChain = chainsToShow.find((chain) => chain.key === 'movement')
      const messageObj = routingInfo.messages?.[messageIndex]
      let txHash = messageObj?.customTxHash
      if (!messageChain) {
        handleTxError(messageIndex, 'Transaction failed as chain is not found', messageChain)
        setIsLoading(false)
        return
      }

      updateTxStatus(messageIndex, {
        status: TXN_STATUS.PENDING,
        responses: [
          {
            state: TRANSFER_STATE.TRANSFER_PENDING,
            type: 'ibcTransfer',
            destChainID: '',
            srcChainID: messageChain.chainId,
            packetTxs: { sendTx: null, receiveTx: null, acknowledgeTx: null, timeoutTx: null },
            originalState: TRANSFER_STATE.TRANSFER_PENDING,
          },
        ],
        isComplete: false,
      })

      try {
        if (!txHash) {
          const aptosSigner = await getAptosSigner('movement')
          const aptosClient = await AptosTx.getAptosClient(lcdUrl ?? '', aptosSigner.signer)
          const simpleTransaction = await aptosClient.generateSwapTxn(route.response.tx)
          const simulation = await aptosClient.simulateGasFee(simpleTransaction)
          const swapTx = await aptosClient.generateSwapTxn(
            route.response.tx,
            parseInt(simulation.gasUnitPrice),
            parseInt(simulation.gasEstimate),
          )
          const pendingTransactionResponse = await aptosClient.signAndBroadcastTransaction(swapTx)
          txHash = pendingTransactionResponse.hash
          routingInfo.messages = [
            {
              customTxHash: txHash,
              customMessageChainId: routingInfo.route?.sourceAssetChain.chainId ?? '',
            },
          ]
        }

        if (!txHash) {
          setUnableToTrackError(true)
          setIsLoading(false)
          return
        }

        if (messageIndex === 0) {
          logTxToDB(txHash)
        }

        setIsSigningComplete(true)

        await pollTx({
          txHash,
          messageChain,
          messageIndex,
          messageChainId: messageChain.chainId,
          routingInfo,
        })

        return
      } catch (e: any) {
        handleTxError(messageIndex, (e as Error)?.message ?? 'Transaction failed', messageChain)
        setIsSigningComplete(true)
        setIsLoading(false)
        return
      }
    },
    [
      chainsToShow,
      getAptosSigner,
      handleTxError,
      lcdUrl,
      logTxToDB,
      pollTx,
      routingInfo,
      setFirstTxnError,
      setIsLoading,
      setIsSigningComplete,
      setLedgerError,
      setTimeoutError,
      setUnableToTrackError,
      sourceChain,
      updateTxStatus,
    ],
  )
}
