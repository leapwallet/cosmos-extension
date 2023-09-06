/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getToken1ForToken2Price,
  getToken2ForToken1Price,
  getTokenForTokenPrice,
} from '@leapwallet/cosmos-wallet-sdk'
import { useEffect, useState } from 'react'
import { TokenToTokenPriceQueryArgs } from 'types/swap'

import { convertDenomToMicroDenom, convertMicroDenomToDenom } from './utils/conversionUtils'

export const useTokenToTokenPrice = async () => {
  const [tokenToTokenPrice, setTokenToTokenPrice] = useState<{ [key: string]: number }>({})
  useEffect(() => {
    getTokenForTokenPrice({}).then((res) => {
      setTokenToTokenPrice(res)
    })
  })
  return [tokenToTokenPrice]
}

export async function tokenToTokenPriceQuery({
  baseToken,
  fromTokenInfo,
  toTokenInfo,
  amount,
  client,
}: any): Promise<number | undefined> {
  const formatPrice = (price: number) => convertMicroDenomToDenom(price, toTokenInfo.decimals)

  const convertedTokenAmount = convertDenomToMicroDenom(amount, fromTokenInfo.decimals)

  if (fromTokenInfo.symbol === toTokenInfo.symbol) {
    return 1
  }

  const shouldQueryBaseTokenForTokenB =
    fromTokenInfo.symbol === baseToken.symbol && toTokenInfo.swap_address

  const shouldQueryTokenBForBaseToken =
    toTokenInfo.symbol === baseToken.symbol && fromTokenInfo.swap_address

  if (shouldQueryBaseTokenForTokenB) {
    const resp = await getToken1ForToken2Price({
      nativeAmount: convertedTokenAmount,
      swapAddress: toTokenInfo.swap_address,
      client,
    })

    return formatPrice(resp)
  } else if (shouldQueryTokenBForBaseToken) {
    return formatPrice(
      await getToken2ForToken1Price({
        tokenAmount: convertedTokenAmount,
        swapAddress: fromTokenInfo.swap_address,
        client,
      }),
    )
  }

  return formatPrice(
    await getTokenForTokenPrice({
      tokenAmount: convertedTokenAmount,
      swapAddress: fromTokenInfo.swap_address,
      outputSwapAddress: toTokenInfo.swap_address,
      client,
    }),
  )
}

export async function tokenToTokenPriceQueryWithPools({
  matchingPools,
  tokenA,
  tokenB,
  amount,
  client,
}: TokenToTokenPriceQueryArgs): Promise<number | undefined> {
  if (tokenA.symbol === tokenB.symbol) {
    return 1
  }

  const formatPrice = (price: number | string) => convertMicroDenomToDenom(price, tokenB.decimals)

  const convertedTokenAmount = convertDenomToMicroDenom(amount, tokenA.decimals)

  const { streamlinePoolAB, streamlinePoolBA, baseTokenAPool, baseTokenBPool } = matchingPools

  if (streamlinePoolAB) {
    return formatPrice(
      await getToken1ForToken2Price({
        nativeAmount: convertedTokenAmount,
        swapAddress: streamlinePoolAB.swap_address,
        client,
      }),
    )
  }
  if (streamlinePoolBA) {
    return formatPrice(
      await getToken2ForToken1Price({
        tokenAmount: convertedTokenAmount,
        swapAddress: streamlinePoolBA.swap_address,
        client,
      }),
    )
  }

  return formatPrice(
    await getTokenForTokenPrice({
      tokenAmount: convertedTokenAmount,
      swapAddress: baseTokenAPool?.swap_address,
      outputSwapAddress: baseTokenBPool?.swap_address,
      client,
    }),
  )
}
