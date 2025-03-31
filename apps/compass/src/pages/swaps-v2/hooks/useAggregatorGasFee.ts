import { StdFee } from '@cosmjs/stargate'
import { useChainApis, useGasPriceStepForChain } from '@leapwallet/cosmos-wallet-hooks'
import { AptosTx, SeiEvmTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SkipMsg, SkipMsgV2, TransactionRequestType } from '@leapwallet/elements-core'
import {
  LifiRouteOverallResponse,
  RouteAggregator,
  SkipGasFeeData,
  SkipRouteResponse,
  useAggregatorGasFeeSWR as useAggregatorGasFeeSWRBase,
  UseSkipGasFeeReturnType,
} from '@leapwallet/elements-hooks'
import { BigNumber } from 'bignumber.js'
import { Wallet } from 'hooks/wallet/useWallet'
import { useState } from 'react'
import { compassSeiEvmConfigStore } from 'stores/balance-store'
import useSWR, { SWRConfiguration, unstable_serialize } from 'swr'
import { SourceChain } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

import { MosaicRouteQueryResponse } from './useMosaicRoute'
import { SWAP_NETWORK } from './useSwapsTx'

const tenMillion = new BigNumber(10).pow(6 + 1)

export const formatAmount = (
  amount: BigNumber.Value,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2,
) => {
  const x = new BigNumber(amount)
  const lowest = new BigNumber(10).pow(-maximumFractionDigits)

  if (x.isNaN()) {
    return ''
  }

  if (x.isZero()) {
    return '0'
  }

  if (x.isLessThan(lowest)) {
    return `< ${lowest}`
  }

  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: x.isGreaterThanOrEqualTo(tenMillion) ? 'compact' : 'standard',
    maximumFractionDigits,
    minimumFractionDigits,
  })
    .format(x.toNumber())
    .slice(1)
}

/**
 * React hook to get gas fee data for supported Aggregators:
 */
export function useAggregatorGasFeeSWR(
  routeResponse:
    | SkipRouteResponse
    | LifiRouteOverallResponse
    | MosaicRouteQueryResponse
    | undefined,
  skipMessages: SkipMsgV2[] | SkipMsg[] | TransactionRequestType[] | undefined,
  userAddressesMap: Record<string, string> | string[] | null,
  sourceChain: SourceChain | undefined,
  isMainnet: boolean,
  config?: SWRConfiguration,
  enabled = true,
): UseSkipGasFeeReturnType {
  const [aptosGasDetails, setAptosGasDetails] = useState<
    { gasEstimate: string; gasUnitPrice: string } | undefined
  >()
  const getAptosSigner = Wallet.useAptosSigner()
  const skipGasFeeSWRResponse = useAggregatorGasFeeSWRBase(
    routeResponse?.response,
    routeResponse?.aggregator,
    skipMessages as SkipMsgV2[] | SkipMsg[] | null,
    userAddressesMap,
    isMainnet,
    config,
    enabled && routeResponse?.aggregator !== RouteAggregator.LIFI,
    undefined,
    undefined,
    aptosGasDetails,
  )

  const { evmJsonRpc, lcdUrl } = useChainApis(
    (sourceChain?.key ?? '') as SupportedChain,
    SWAP_NETWORK,
  )

  const isEvmTx = !!skipMessages?.[0] && 'evm_tx' in skipMessages[0]

  const skipEvmGasFeeSWR = useSWR<SkipGasFeeData>(
    enabled && !!routeResponse && routeResponse?.aggregator !== RouteAggregator.LIFI && isEvmTx
      ? unstable_serialize([
          'skip-evm-gas-fee',
          routeResponse?.response,
          routeResponse?.aggregator,
          skipMessages,
          userAddressesMap,
          isMainnet,
        ])
      : null,
    async function calculateGasFee() {
      try {
        if (!routeResponse?.response || !skipMessages || !userAddressesMap || !isMainnet) {
          throw new Error('missing data')
        }

        const message = skipMessages[0]

        if (!('evm_tx' in message)) {
          throw new Error('missing data')
        }

        const evmTx = message.evm_tx
        const address = (evmTx as any).signer_address

        const gasUsed = await SeiEvmTx.SimulateTransaction(
          evmTx.to,
          new BigNumber(evmTx.value.toString()).dividedBy(1e18).toString(),
          evmJsonRpc ?? '',
          `0x${evmTx.data}`,
          undefined,
          address,
        )

        const gasFeesAmount: StdFee[] = [
          {
            gas: new BigNumber(gasUsed).integerValue(BigNumber.ROUND_UP).toFixed(0),
            amount: [],
          },
        ]
        return {
          gasFees: [],
          gasFeesAmount,
          gasFeesError: '',
          usdGasFees: [],
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        return {
          gasFees: [],
          gasFeesAmount: [],
          gasFeesError: '',
          usdGasFees: [],
        }
      }
    },
    config,
  )

  const defaultSeiGasPriceSteps = useGasPriceStepForChain('seiTestnet2', SWAP_NETWORK)
  const seiEvmRpc = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_EVM_RPC_URL

  const defaultSeiGasPrice = defaultSeiGasPriceSteps.low
  const lifiGasFeeSWRResponse = useSWR<SkipGasFeeData>(
    isCompassWallet() &&
      !!routeResponse &&
      routeResponse?.aggregator === RouteAggregator.LIFI &&
      enabled &&
      !!defaultSeiGasPrice
      ? unstable_serialize([
          skipMessages,
          userAddressesMap,
          routeResponse?.aggregator,
          routeResponse,
          isMainnet,
        ])
      : null,
    async function calculateGasFee() {
      if (
        !isCompassWallet() ||
        !routeResponse ||
        (routeResponse && routeResponse?.aggregator !== RouteAggregator.LIFI) ||
        !defaultSeiGasPrice
      ) {
        throw new Error('missing data')
      }

      const response = routeResponse.response

      if (!response) {
        throw new Error('missing data')
      }

      const gasFees: string[] = []
      for (const step of response.steps) {
        const decimals = step.estimate?.gasCosts?.[0]?.token.decimals ?? 18
        const amount = new BigNumber(step.estimate?.gasCosts?.[0]?.amount ?? 0)
        const gasFee = amount.dividedBy(new BigNumber(10).pow(decimals)).toString()
        const formattedFee = formatAmount(gasFee, 2, 6)

        gasFees.push(`${formattedFee} ${step.estimate?.gasCosts?.[0].token.symbol}`)
      }

      const usdGasFees = response.steps.map(
        (step) => new BigNumber(step.estimate.gasCosts?.[0].amountUSD ?? '0'),
      )

      const message = (skipMessages as TransactionRequestType[])?.[0]
      let gasUsed = 0

      try {
        if (!message) {
          throw new Error('missing message')
        }
        gasUsed = await SeiEvmTx.SimulateTransaction(
          message.tokenContract,
          new BigNumber(message.value.toString()).dividedBy(1e18).toString(),
          seiEvmRpc ?? '',
          message.data,
          undefined,
          message.from,
        )
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }

      const gasLimit = Math.max(Number(message?.gasLimit), gasUsed).toString()
      const gasPrice = Number(message?.gasPrice).toString()

      const gasFeesAmount = [
        {
          amount: [
            {
              denom: routeResponse?.response?.steps?.[0]?.estimate?.gasCosts?.[0].token.address,
              amount: gasLimit,
            },
          ],
          gas:
            !!gasLimit && !!gasPrice
              ? new BigNumber(gasLimit)
                  .multipliedBy(gasPrice)
                  .dividedBy(defaultSeiGasPrice * 1e12)
                  .toFixed(0, 2)
              : undefined,
        } as StdFee,
      ]

      return {
        gasFees: gasFees,
        usdGasFees: usdGasFees,
        gasFeesAmount: gasFeesAmount,
        gasFeesError: response.steps.find((step) => !step.estimate.gasCosts)
          ? 'Cannot determine gas cost'
          : '',
      } as unknown as SkipGasFeeData
    },
    config,
  )

  useSWR(
    enabled && !!routeResponse?.response && routeResponse.aggregator === RouteAggregator.MOSAIC
      ? unstable_serialize([userAddressesMap, routeResponse?.aggregator, routeResponse, isMainnet])
      : null,
    async function calculateGasFee() {
      if (
        !routeResponse ||
        (routeResponse && routeResponse?.aggregator !== RouteAggregator.MOSAIC)
      ) {
        throw new Error('missing data')
      }

      const response = routeResponse.response

      if (!response) {
        throw new Error('missing data')
      }

      const aptosSigner = await getAptosSigner('movement')
      const aptosClient = await AptosTx.getAptosClient(lcdUrl ?? '', aptosSigner.signer)
      const simpleTransaction = await aptosClient.generateSwapTxn(response.tx)
      const data = await aptosClient.simulateGasFee(simpleTransaction)
      setAptosGasDetails(data)
    },
    config,
  )

  if (routeResponse?.aggregator === RouteAggregator.LIFI) {
    return lifiGasFeeSWRResponse
  }

  if (isEvmTx) {
    return skipEvmGasFeeSWR
  }

  return {
    ...skipGasFeeSWRResponse,
    isLoading:
      routeResponse?.aggregator === RouteAggregator.MOSAIC && !aptosGasDetails
        ? true
        : skipGasFeeSWRResponse.isLoading,
  }
}
