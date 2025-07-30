import { StdFee } from '@cosmjs/stargate'
import { useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { AptosTx, SeiEvmTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SkipMsg, SkipMsgV2, TransactionRequestType } from '@leapwallet/elements-core'
import {
  RouteAggregator,
  SkipGasFeeData,
  SkipRouteResponse,
  useAggregatorGasFeeSWR as useAggregatorGasFeeSWRBase,
  UseSkipGasFeeReturnType,
} from '@leapwallet/elements-hooks'
import { BigNumber } from 'bignumber.js'
import { Wallet } from 'hooks/wallet/useWallet'
import { useState } from 'react'
import useSWR, { SWRConfiguration, unstable_serialize } from 'swr'
import { SourceChain } from 'types/swap'

import { SWAP_NETWORK } from '../constants'
import { MosaicRouteQueryResponse } from './useMosaicRoute'

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
  routeResponse: SkipRouteResponse | MosaicRouteQueryResponse | undefined,
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
    enabled,
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
    enabled && !!routeResponse && isEvmTx
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
