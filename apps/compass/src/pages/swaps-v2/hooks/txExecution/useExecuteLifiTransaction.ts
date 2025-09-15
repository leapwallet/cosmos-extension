import { StdFee } from '@cosmjs/stargate'
import {
  CosmosTxType,
  getChainId,
  getMetaDataForSwapTx,
  getTxnLogAmountValue,
  LeapWalletApi,
  useActiveWallet,
  useChainApis,
  useGasPriceStepForChain,
  useGetChains,
  useInvalidateTokenBalances,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  CompassSeiLedgerSigner,
  LedgerError,
  NativeDenom,
  SeiEvmTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { TRANSFER_STATE, TXN_STATUS } from '@leapwallet/elements-core'
import { EthWallet } from '@leapwallet/leap-keychain'
import { TransferAssetRelease } from '@skip-go/client'
import { BigNumber } from 'bignumber.js'
import { Wallet } from 'hooks/wallet/useWallet'
import { useInvalidateSwapAssetsQueries } from 'pages/swaps-v2/hooks/txExecution/useInvalidateSwapAssetsQueries'
import { useGetChainsToShow } from 'pages/swaps-v2/hooks/useGetChainsToShow'
import { useProviderFeatureFlags } from 'pages/swaps-v2/hooks/useProviderFeatureFlags'
import { LifiRouteOverallResponse } from 'pages/swaps-v2/hooks/useRoute'
import { LifiMsgWithCustomTxHash, RoutingInfo } from 'pages/swaps-v2/hooks/useSwapsTx'
import { SWAP_NETWORK } from 'pages/swaps-v2/hooks/useSwapsTx'
import { approveTokenAllowanceIfNeeded, capitalizeFirstLetter } from 'pages/swaps-v2/utils'
import { useCallback } from 'react'
import { compassSeiEvmConfigStore } from 'stores/balance-store'
import { SourceChain, SourceToken, SwapFeeInfo, SwapTxnStatus, TransferSequence } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

import { usePollTx } from './polling/usePollTx'

export type ExecuteLifiTransactionParams = {
  setLedgerError: ((ledgerError?: string) => void) | undefined
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
  setShowLedgerPopup: (showLedgerPopup: boolean) => void
  setShowLedgerPopupText: (showLedgerPopupText: string) => void
}

export function useExecuteLifiTransaction({
  feeDenom,
  fee,
  feeAmount,
  sourceChain,
  routingInfo,
  inAmount,
  sourceToken,
  destinationToken,
  destinationChain,
  amountOut,
  handleTxError,
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
  getSwapFeeInfo,
  callbackPostTx,
  setShowLedgerPopup,
  setShowLedgerPopupText,
}: ExecuteLifiTransactionParams) {
  const defaultSeiGasPriceSteps = useGasPriceStepForChain('seiTestnet2', SWAP_NETWORK)
  const defaultSeiGasPrice = defaultSeiGasPriceSteps.low
  const { evmJsonRpc } = useChainApis((sourceChain?.key ?? '') as SupportedChain, SWAP_NETWORK)
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const activeWallet = useActiveWallet()
  const { chainsToShow } = useGetChainsToShow()
  const getWallet = Wallet.useGetWallet()
  const chainInfos = useGetChains()

  const invalidateBalances = useInvalidateTokenBalances()
  const invalidateSwapAssets = useInvalidateSwapAssetsQueries()
  const { lifiGasPriceMultiplier, lifiGasLimitMultiplier } = useProviderFeatureFlags()

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
        'lifi_api',
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
        const swapFeeInfo = await getSwapFeeInfo()
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
      getSwapFeeInfo,
      invalidateBalances,
      invalidateSwapAssets,
      refetchSourceBalances,
      refetchDestinationBalances,
      callbackPostTx,
    ],
  )

  const pollTx = usePollTx(
    setTrackingInSync,
    setUnableToTrackError,
    updateTxStatus,
    handleTxError,
    refetchSourceBalances,
    refetchDestinationBalances,
  )

  return useCallback(
    async (
      messages: LifiMsgWithCustomTxHash[] | undefined,
      route: LifiRouteOverallResponse | undefined,
    ) => {
      if (!fee && !feeAmount) return
      if (!messages || !route) {
        handleTxError(0, 'Error fetching route info', sourceChain)
        setIsLoading(false)
        return
      }

      setTimeoutError(false)
      setFirstTxnError(undefined)
      setUnableToTrackError(null)
      setLedgerError && setLedgerError(undefined)

      const messageIndex = 0

      if (!isCompassWallet()) {
        handleTxError(messageIndex, 'Lifi routes are only supported on Compass Wallet', sourceChain)
        setIsLoading(false)
        return
      }
      const message = messages[messageIndex]
      const messageObj = messages[messageIndex]
      const messageChain = chainsToShow.find((chain) => chain.key === 'seiTestnet2')
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
        let txHash: string | undefined

        txHash = message?.customTxHash

        if (!txHash) {
          let wallet = (await getWallet('seiTestnet2', true)) as unknown as EthWallet

          if (!fee) {
            handleTxError(messageIndex, 'Error calculating fee', messageChain)
            setIsLoading(false)
            return
          }
          const isLedgerTypeWallet = activeWallet?.walletType === WALLETTYPE.LEDGER

          if (isLedgerTypeWallet && activeWallet?.app !== 'sei') {
            handleTxError(
              messageIndex,
              'This route requires importing a Sei Ledger Wallet',
              messageChain,
            )
            setIsLoading(false)
            return
          }

          const gasPriceMultiplier = lifiGasPriceMultiplier?.[messageChain.chainId] ?? 1
          const gasLimitMultiplier = lifiGasLimitMultiplier?.[messageChain.chainId] ?? 1

          const gasPrice =
            message.gasPrice && !isNaN(Number(message.gasPrice))
              ? Math.ceil(Number(message.gasPrice) * gasPriceMultiplier)
              : undefined
          const gas = Number(
            new BigNumber(fee.gas)
              .multipliedBy(gasLimitMultiplier)
              .multipliedBy(defaultSeiGasPrice)
              .multipliedBy(1e12)
              .dividedBy(message.gasPrice ? message.gasPrice.toString() : 1000_000_000)
              .toFixed(0, 2),
          )

          const allowanceAmount = new BigNumber(inAmount)
            .multipliedBy(1.2)
            .multipliedBy(
              new BigNumber(10).exponentiatedBy(routingInfo?.route?.sourceAsset?.decimals ?? 18),
            )
            .toFixed(0)

          await approveTokenAllowanceIfNeeded(
            Number(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID),
            evmJsonRpc ?? '',
            wallet,
            message.from ?? '',
            message.tokenContract,
            message.to,
            allowanceAmount,
            gasPrice,
            isLedgerTypeWallet,
            setShowLedgerPopup,
            setShowLedgerPopupText,
          )

          if (isLedgerTypeWallet) {
            setShowLedgerPopup(true)
            /**
             * This is a workaround to get the wallet to reconnect to the ledger
             * after the first transaction is sent. This is because the CompassSeiLedgerSigner
             * is closing the transport after the `sendTransaction()` is called.
             * Using `getAccounts(true)`, we close the transport if `sendTransaction()` was
             * not invoked inside `approveTokenAllowanceIfNeeded`. And `getWallet()` will return
             * a new instance of the wallet with the new transport.
             */
            if (wallet instanceof CompassSeiLedgerSigner) {
              try {
                await (wallet as CompassSeiLedgerSigner).getAccounts(true)
              } catch (_) {
                //
              }
            }
            wallet = (await getWallet('seiTestnet2', true)) as unknown as EthWallet
          }

          const seiEvmTx = SeiEvmTx.GetSeiEvmClient(
            wallet,
            evmJsonRpc ?? '',
            Number(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID),
          )

          const res = await seiEvmTx.sendTransaction(
            '',
            message.to,
            new BigNumber(message.value.toString()).dividedBy(1e18).toString(),
            gas,
            gasPrice,
            message.data,
          )

          txHash = res?.hash
        }

        setShowLedgerPopup(false)

        if (!txHash) {
          setUnableToTrackError(true)
          setIsLoading(false)
          return
        }

        if (messageIndex === 0) {
          logTxToDB(txHash)
        }

        messageObj.customTxHash = txHash
        messageObj.customMessageChainId = String(messageChain.chainId)

        setIsSigningComplete(true)

        await pollTx({
          txHash,
          messageChain,
          messageIndex,
          messageChainId: messageChain.chainId,
          routingInfo,
        })

        return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e instanceof LedgerError) {
          setLedgerError && setLedgerError(e.message)
        } else {
          let errorMessage = ''
          if (e?.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = 'Insufficient funds for transaction'
          } else if (e?.reason) {
            errorMessage = capitalizeFirstLetter(e.reason)
          }
          if (!errorMessage) {
            errorMessage = (e as Error)?.message ?? 'Transaction failed'
          }
          if (e?.transactionHash) {
            errorMessage += ` - https://seitrace.com/tx/${e.transactionHash}?chain=pacific-1`
          }
          handleTxError(messageIndex, errorMessage, messageChain)
        }
        setShowLedgerPopup(false)
        setIsSigningComplete(true)
        setIsLoading(false)
        return
      }
    },
    [
      fee,
      feeAmount,
      setTimeoutError,
      setFirstTxnError,
      setUnableToTrackError,
      setLedgerError,
      chainsToShow,
      updateTxStatus,
      handleTxError,
      sourceChain,
      setIsLoading,
      setIsSigningComplete,
      pollTx,
      routingInfo,
      getWallet,
      evmJsonRpc,
      defaultSeiGasPrice,
      inAmount,
      logTxToDB,
      setShowLedgerPopup,
      setShowLedgerPopupText,
      activeWallet?.walletType,
      activeWallet?.app,
      lifiGasPriceMultiplier,
      lifiGasLimitMultiplier,
    ],
  )
}
