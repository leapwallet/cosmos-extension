import classnames from 'classnames'
import React from 'react'

const showOrHideBalances = (balancesHidden: boolean, percentChange: number) => {
  if (balancesHidden) {
    return '••••••••'
  } else {
    return (
      <span
        className={classnames(`text-[10px] font-medium`, {
          'text-green-600': percentChange > 0,
          'text-red-300': percentChange ?? 0 <= 0,
        })}
      >{`${percentChange > 0 ? '+' : ''}${percentChange?.toFixed(2) ?? 0}%`}</span>
    )
  }
}

export default showOrHideBalances
