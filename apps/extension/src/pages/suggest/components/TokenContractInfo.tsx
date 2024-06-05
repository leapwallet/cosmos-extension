import { Divider, Key, Value } from 'components/dapp'
import React from 'react'

type TokenContractInfoProps = {
  name: string
  symbol: string
  decimals: number
}

export function TokenContractInfo({ name, symbol, decimals }: TokenContractInfoProps) {
  return (
    <div className='flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl p-4 w-full'>
      <Key>Coin Name</Key>
      <Value>{name}</Value>
      {Divider}

      <Key>Coin Symbol</Key>
      <Value>{symbol}</Value>
      {Divider}

      <Key>Coin Decimals</Key>
      <Value>{decimals}</Value>
    </div>
  )
}
