import { StdFee } from '@cosmjs/stargate'
import { useGasPriceStepForChain } from '@leapwallet/cosmos-wallet-hooks'
import { SeiEvmTx } from '@leapwallet/cosmos-wallet-sdk'
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
import { compassSeiEvmConfigStore } from 'stores/balance-store'
import useSWR, { SWRConfiguration, unstable_serialize } from 'swr'
import { isCompassWallet } from 'utils/isCompassWallet'

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
  routeResponse: SkipRouteResponse | LifiRouteOverallResponse | undefined,
  skipMessages: SkipMsgV2[] | SkipMsg[] | TransactionRequestType[] | undefined,
  userAddressesMap: Record<string, string> | string[] | null,
  isMainnet: boolean,
  config?: SWRConfiguration,
  enabled = true,
): UseSkipGasFeeReturnType {
  const skipGasFeeSWRResponse = useAggregatorGasFeeSWRBase(
    routeResponse?.response,
    routeResponse?.aggregator,
    skipMessages as SkipMsgV2[] | SkipMsg[] | null,
    userAddressesMap,
    isMainnet,
    config,
    enabled && routeResponse?.aggregator !== RouteAggregator.LIFI,
  )

  const defaultSeiGasPriceSteps = useGasPriceStepForChain('seiTestnet2', SWAP_NETWORK)
  const evmJsonRpc = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_EVM_RPC_URL

  const defaultSeiGasPrice = defaultSeiGasPriceSteps.low
  // @ts-expect-error bignumber.js types are not compatible with the types in the package
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
          evmJsonRpc ?? '',
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
      } as const
    },
    config,
  )

  if (routeResponse?.aggregator === RouteAggregator.LIFI) {
    return lifiGasFeeSWRResponse
  }

  return skipGasFeeSWRResponse
}
