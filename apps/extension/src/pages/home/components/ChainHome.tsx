import BigNumber from 'bignumber.js'
import React from 'react'

import { GeneralHome } from './index'

export function ChainHome() {
  return (
    <GeneralHome
      _allAssets={[]}
      _allAssetsCurrencyInFiat={new BigNumber(0)}
      isAggregateLoading={false}
    />
  )
}
