import React from 'react'

const showOrHideBalances = (balancesHidden: boolean, percentChange: number) => {
  if (balancesHidden) {
    return '••••••••'
  } else {
    return (
      <span
        className={`text-[10px] font-medium ${
          percentChange > 0 ? 'text-green-600' : 'text-red-300'
        }`}
      >{`${percentChange > 0 ? '+' : ''}${percentChange?.toFixed(2) ?? 0}%`}</span>
    )
  }
}

export default showOrHideBalances
