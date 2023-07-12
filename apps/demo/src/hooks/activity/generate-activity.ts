import type { Activity } from '@leapwallet/cosmos-wallet-hooks'
import { denoms, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'

import { ActionType } from './data'

const genTxHash = () =>
  [...Array(64)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')
    .toUpperCase()

type Address = string
type Amount = string

export type generateActivityParams = {
  action: ActionType
  fromAddress: Address
  toAddress: Address
  denomID: SupportedDenoms
  amount: Amount
  feeAmount: Amount
  title: string
  subtitle: string
}

const generateActivity = ({
  action,
  fromAddress,
  toAddress,
  denomID,
  amount,
  feeAmount,
  title,
  subtitle,
}: generateActivityParams): Activity => ({
  parsedTx: {
    action,
    fromAddress,
    toAddress,
    sentAmount: {
      denomID: denomID,
      amount: new BigNumber(amount),
    },
    isSuccess: true,
    txhash: genTxHash(),
    timestamp: new Date().toISOString(),
    fee: {
      denomID: denomID,
      amount: new BigNumber(feeAmount),
    },
  },
  content: {
    txType: action,
    title1: title,
    subtitle1: subtitle,
    sentTokenInfo: denoms[denomID],
    sentAmount: (Number(amount) / 10 ** 6).toString(),
    feeAmount: `${(Number(feeAmount) / 10 ** 6).toFixed(6)} ${denoms[denomID].coinDenom}`,
  },
})

export default generateActivity
