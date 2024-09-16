import BigNumber from 'bignumber.js'
import React from 'react'

import { GeneralHome } from './index'

export function AggregatedHome() {
  return (
    <>
      <GeneralHome
        _allAssets={[]}
        _allAssetsCurrencyInFiat={new BigNumber(0)}
        isAggregateLoading={false}
      />
    </>
  )
}
