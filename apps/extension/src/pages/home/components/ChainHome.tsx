import { useGetTokenBalances } from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'

import { GeneralHome } from './index'

export function ChainHome() {
  const {
    allAssets,
    totalCurrencyInPreferredFiatValue,
    isWalletHasFunds,
    s3IbcTokensStatus,
    nonS3IbcTokensStatus,
    nativeTokensStatus,
    cw20TokensStatus,
    erc20TokensStatus,
    refetchBalances,
  } = useGetTokenBalances()

  return (
    <GeneralHome
      _allAssets={allAssets}
      _allAssetsCurrencyInFiat={totalCurrencyInPreferredFiatValue}
      isWalletHasFunds={isWalletHasFunds}
      s3IbcTokensStatus={s3IbcTokensStatus}
      nonS3IbcTokensStatus={nonS3IbcTokensStatus}
      nativeTokensStatus={nativeTokensStatus}
      cw20TokensStatus={cw20TokensStatus}
      erc20TokensStatus={erc20TokensStatus}
      refetchBalances={refetchBalances}
    />
  )
}
