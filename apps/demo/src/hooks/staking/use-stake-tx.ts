import { ChainInfos, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import { bech32 } from 'bech32'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { useSetRecoilState } from 'recoil'

import { useAddActivity } from '~/hooks/activity/use-activity'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useFormatCurrency } from '~/hooks/settings/use-currency'
import { activeWalletSelector, CustomWallet, useActiveWallet } from '~/hooks/wallet/use-wallet'
import { Token } from '~/types/bank'
import { formatTokenAmount, sliceAddress } from '~/util/strings'
import { tokenAndMinimalDenom, tokenAndUsdPrice, tokensByChain } from '~/util/tokens'

import { delegationsSelector } from './use-staking'

const fees = '0.00025'

const words = bech32.toWords(Buffer.from('curlfootsequencenature', 'utf-8'))

export function useStakeTx() {
  const activeChain = useActiveChain()
  const formatCurrency = useFormatCurrency()
  const { addresses } = useActiveWallet()
  const setWallet = useSetRecoilState(activeWalletSelector)
  const addActivity = useAddActivity()
  const setDelegations = useSetRecoilState(delegationsSelector)

  const { symbol } = tokensByChain[activeChain]

  const [memo, setMemo] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const currencyFees = formatCurrency(
    new BigNumber(tokenAndUsdPrice[tokensByChain[activeChain].symbol]).multipliedBy(Number(fees)),
  )

  const displayFeeText = `Transaction fee: ${formatTokenAmount(fees, '', 5)} ${
    ChainInfos[activeChain].denom
  } (${formatCurrency(new BigNumber(currencyFees ?? '0'))})`

  const sendTokens = ({
    amount,
    fromAddress,
    toAddress,
    srcChain,
  }: {
    amount: string
    fromAddress: string
    toAddress: string
    srcChain: string
  }) => {
    setWallet((wallet) => {
      // check if asset exists in the wallet for the active chain
      const assetIndex = wallet.assets[srcChain].findIndex((v) => v.symbol === symbol)
      if (assetIndex === -1) throw new Error('asset not owned')
      // get the asset
      const asset = wallet.assets[srcChain][assetIndex]
      // check the asset value and the asked value
      const assetValue = Number(asset.amount)
      const askedValue = Number(amount)
      // if the asked value is greater than asset value, transaction is not possible
      const difference = assetValue - askedValue
      if (difference < 0) throw new Error('insufficient funds')
      // clone and create an updated assets array
      const assetsArray: Token[] = Array.from(wallet.assets[srcChain])
      assetsArray.splice(assetIndex, 1, {
        ...asset,
        amount: difference.toFixed(4),
      })

      // clone the wallet
      const updatedWallet: CustomWallet = JSON.parse(JSON.stringify(wallet))
      // update the assets array
      updatedWallet.assets[srcChain] = assetsArray

      return updatedWallet
    })
    const amountInMinimalDenom = (Number(amount) * 10 ** 6).toString()
    addActivity({
      action: 'delegate',
      amount: amountInMinimalDenom,
      denomID: tokenAndMinimalDenom[symbol] as SupportedDenoms,
      feeAmount: '250',
      fromAddress: fromAddress,
      toAddress: toAddress,
      title: `Delegation`,
      subtitle: `${sliceAddress(toAddress)}`,
    })
  }

  const onDelegate = (validatorAddress: string) => {
    // edit delegation data structure
    setDelegations((delegations) => {
      const cloned = JSON.parse(JSON.stringify(delegations))
      cloned[validatorAddress] = {
        delegation: {
          delegator_address: bech32.encode(ChainInfos[activeChain].addressPrefix, words),
          validator_address: validatorAddress,
        },
        balance: {
          amount,
        },
      }
      return cloned
    })
    // send amt to validator
    sendTokens({
      amount,
      fromAddress: addresses[activeChain],
      srcChain: activeChain,
      toAddress: validatorAddress,
    })
  }

  return {
    error: null as null,
    isLoading: false,
    memo,
    fees: `0.00025`,
    currencyFees,
    amount,
    displayFeeText,
    setAmount,
    setMemo,
    onDelegate,
  }
}
