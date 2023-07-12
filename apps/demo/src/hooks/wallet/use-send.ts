import { getBlockChainFromAddress } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import { useCallback, useMemo, useState } from 'react'

import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { usePreferredCurrency } from '~/hooks/settings/use-currency'
import { useFormatCurrency } from '~/hooks/settings/use-currency'
import { TransactionToken } from '~/types/bank'
import addressPrefixes from '~/util/address-prefixes'
import { convertFromUsdToRegional } from '~/util/currency-conversion'
import { tokenWithTargetChainSpecificIbcInfo } from '~/util/tokens'

import { useActiveWallet } from './use-wallet'
import { useSendTokensFromActiveWallet } from './use-wallet-transaction'

const getChainFromAddress = (address: string) => addressPrefixes[getBlockChainFromAddress(address)]

const fee = 0.0025

const useSend = (toAddress: string) => {
  const wallet = useActiveWallet()
  const formatCurrency = useFormatCurrency()
  const chain = useActiveChain()
  const currency = usePreferredCurrency()
  const toChain = getChainFromAddress(toAddress)

  const [inputAmount, setInputAmount] = useState<string>('')
  const [memo, setMemo] = useState<string>('')
  const [selectedDenom, setSelectedDenom] = useState(
    tokenWithTargetChainSpecificIbcInfo(chain, toChain),
  )

  const inputPreferredCurrencyValue = formatCurrency(
    convertFromUsdToRegional(new BigNumber(inputAmount).multipliedBy(12.19), currency),
  )
  const feePreferredCurrencyValue = convertFromUsdToRegional(fee, currency)
  const address = wallet.addresses[chain]
  const balances = wallet.assets[chain]
  const currentDenomBalance = balances.find((b) => b.symbol === selectedDenom.symbol)?.amount ?? 0

  const sendTokens = useSendTokensFromActiveWallet()

  const send = useCallback(
    (denom: TransactionToken, amount: string) => {
      try {
        sendTokens({
          token: denom,
          amount: amount,
          fromAddress: address,
          toAddress: toAddress,
          srcChain: chain,
          toChain: toChain,
        })
      } catch (error) {
        alert((error as Error).message)
      }
    },
    [address, chain, sendTokens, toAddress, toChain],
  )

  return useMemo(
    () => ({
      address,
      currentDenomBalance,
      balances,
      memo,
      setMemo,
      selectedDenom,
      setSelectedDenom,
      inputAmount,
      setInputAmount,
      inputPreferredCurrencyValue,
      fee,
      feePreferredCurrencyValue,
      send,
    }),
    [
      address,
      balances,
      currentDenomBalance,
      feePreferredCurrencyValue,
      inputAmount,
      inputPreferredCurrencyValue,
      memo,
      selectedDenom,
      send,
    ],
  )
}

export default useSend
