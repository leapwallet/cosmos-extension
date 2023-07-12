import { SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { useSetRecoilState } from 'recoil'

import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { CustomWallet } from '~/hooks/wallet/use-wallet'
import { Token } from '~/types/bank'

import { activeWalletSelector } from '../wallet/use-wallet'
import { tokenAndMinimalDenom, tokensByChain } from './../../util/tokens'
import { useAddActivity } from './../activity/use-activity'

export const useClaimRewards = () => {
  const activeChain = useActiveChain()
  const addActivity = useAddActivity()
  const setWallet = useSetRecoilState(activeWalletSelector)

  const claimRewards = useCallback(() => {
    const { symbol } = tokensByChain[activeChain]

    let rewardsValue = 0
    let walletAddress = ''

    setWallet((wallet) => {
      rewardsValue = wallet.rewards[activeChain]
      walletAddress = wallet.addresses[activeChain]
      // clone the wallet
      const updatedWallet: CustomWallet = JSON.parse(JSON.stringify(wallet))
      updatedWallet.rewards[activeChain] = 0
      const assetIndex = wallet.assets[activeChain].findIndex((v) => v.symbol === symbol)
      const asset = wallet.assets[activeChain][assetIndex]
      // clone and create an updated assets array
      const assetsArray: Token[] = Array.from(wallet.assets[activeChain])
      assetsArray.splice(assetIndex, 1, {
        ...asset,
        amount: new BigNumber(asset.amount).plus(rewardsValue).toString(),
      })
      updatedWallet.assets[activeChain] = assetsArray
      return updatedWallet
    })

    if (rewardsValue === 0) return

    addActivity({
      action: 'receive',
      amount: (rewardsValue * 10 ** 6).toString(),
      denomID: tokenAndMinimalDenom[symbol] as SupportedDenoms,
      feeAmount: '250',
      fromAddress: '...',
      toAddress: walletAddress,
      title: `Received ${rewardsValue} ${symbol}`,
      subtitle: `Claimed Staking Rewards`,
    })
    // get currently staked assets
    // transfer them to wallet
    // generate activity for the same
  }, [activeChain, addActivity, setWallet])

  return claimRewards
}
