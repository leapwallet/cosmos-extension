import type { GasPrice } from '@leapwallet/cosmos-wallet-sdk'
import { EstimatedFee, RouteAggregator } from '@leapwallet/elements-hooks'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { Token } from 'types/bank'
import type { SourceChain, SourceToken } from 'types/swap'

import type { MosaicRouteQueryResponse } from './useMosaicRoute'
import type { SkipRouteResponse } from './useRoute'

/**
 * We can add this check for EVM source transactions (assuming bridge fees are always in native tokens and only source bridge fees are considered):
    1. Calculate total required per token:
      - Start with required_amounts = {}.
      - Add the full input_amount to required_amounts[input_token].
      - Loop through all bridge_fees:
        - If the fee behaviour is additional, add fee.amount to required_amounts[fee.origin_asset.denom].
        - (Note: If the fee is deducted, it comes out of the input_amount, so no need to add it again.)
      - Add the estimated gas fee to required_amounts[native_token].
    2. Validate each token balance:
      - For each token in required_amounts, check if the user's balance is sufficient.
      - If any required_amounts[token] exceeds user_balance[token], return an insufficient_balance_error.
 */

/**
 * Check if user has sufficient funds for the transaction. This is currently only for:
 * - EVM source transactions
 * - Skip transactions
 * @param aggregatedTokens - The aggregated tokens
 * @returns The bridge fee error
 */
export const useBridgeFeesCheck = (
  routeResponse: SkipRouteResponse | MosaicRouteQueryResponse | undefined,
  aggregatedTokens: Token[],
  inputAmount: string,
  sourceToken: SourceToken | null,
  sourceChain: SourceChain | undefined,
  gasLimit: number,
  gasPrice: GasPrice | undefined,
) => {
  return useMemo(() => {
    if (
      !inputAmount ||
      !routeResponse ||
      !sourceToken ||
      !sourceChain ||
      sourceChain?.chainType !== 'evm' ||
      !aggregatedTokens?.length ||
      routeResponse?.aggregator !== RouteAggregator.SKIP
    ) {
      return null
    }

    try {
      /**
       * This will be a map of token address to the amount required
       * Note: amounts will always be in minimal denoms. eg. 1000000000000000000 for 1 ETH
       */
      const requiredAmounts: Record<string, BigNumber> = {}

      // Add the full input_amount to required_amounts[input_token]
      let inputToken = sourceToken.skipAsset?.denom
      if (inputToken === 'ethereum-native') {
        inputToken = 'wei'
      }
      requiredAmounts[inputToken] = new BigNumber(inputAmount).multipliedBy(
        sourceToken.skipAsset?.decimals ? 10 ** sourceToken.skipAsset?.decimals : 1,
      )

      // Loop through all bridge_fees
      for (const bridgeFee of (routeResponse?.response?.estimated_fees ?? []) as (EstimatedFee & {
        fee_behavior: 'FEE_BEHAVIOR_DEDUCTED' | 'FEE_BEHAVIOR_ADDITIONAL'
      })[]) {
        const bridgeFeeChainId = bridgeFee.chain_id
        /**
         * We only check bridge fees for the source chain currently
         */
        if (bridgeFeeChainId !== sourceChain.chainId) {
          continue
        }

        let bridgeFeeToken = bridgeFee.origin_asset?.denom
        if (bridgeFeeToken === 'ethereum-native') {
          bridgeFeeToken = 'wei'
        }

        if (!bridgeFeeToken) {
          continue
        }

        const bridgeFeeAmount = new BigNumber(bridgeFee.amount.toString())

        if (bridgeFeeToken === inputToken && bridgeFee.fee_behavior === 'FEE_BEHAVIOR_DEDUCTED') {
          // If the fee is deducted, and fee token is the input token, do nothing.
          continue
        }

        requiredAmounts[bridgeFeeToken] = requiredAmounts[bridgeFeeToken]
          ? requiredAmounts[bridgeFeeToken].plus(bridgeFeeAmount)
          : bridgeFeeAmount
      }

      const gasFeeToken = gasPrice?.denom ?? sourceChain?.nativeToken?.address
      let gasFeeAmount: BigNumber | undefined
      if (gasPrice && gasFeeToken) {
        gasFeeAmount = new BigNumber(gasPrice.amount.toString()).multipliedBy(gasLimit)
        if (gasFeeAmount) {
          requiredAmounts[gasFeeToken] = requiredAmounts[gasFeeToken]
            ? requiredAmounts[gasFeeToken].plus(gasFeeAmount)
            : gasFeeAmount
        }
      }

      const userHasSufficientBalances = Object.keys(requiredAmounts).every((requiredDenom) => {
        const balance = aggregatedTokens?.find((t) => {
          const denom = t?.ibcDenom ?? t?.coinMinimalDenom
          return denom === requiredDenom
        })
        if (!balance?.amount) {
          return false
        }
        const balanceBN = new BigNumber(balance.amount)?.multipliedBy(
          balance.coinDecimals ? 10 ** balance.coinDecimals : 1,
        )
        return !balanceBN.isNaN() && balanceBN.gte(requiredAmounts[requiredDenom])
      })

      return !userHasSufficientBalances ? 'Insufficient balance for the transaction' : null
    } catch (error) {
      return null
    }
    // Intentially left out gasPrice as it is updating every 5/10 seconds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeResponse, aggregatedTokens, inputAmount, sourceToken, sourceChain, gasLimit])
}
