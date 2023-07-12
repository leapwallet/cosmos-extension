import { SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import { useSetRecoilState } from 'recoil'

import { useAddActivity } from '~/hooks/activity/use-activity'
import { Token, TransactionToken } from '~/types/bank'
import { sliceAddress } from '~/util/strings'
import { tokenWithTargetChainSpecificIbcInfo } from '~/util/tokens'

import { tokenAndPriceChanges, tokenAndUsdPrice } from './../../util/tokens'
import { tokenAndMinimalDenom } from './../../util/tokens'
import { CustomWallet } from './data'
import { activeWalletSelector } from './use-wallet'

// if own ibc address - take care of that
// generate activity for wallet
export const useSendTokensFromActiveWallet = () => {
  const setWallet = useSetRecoilState(activeWalletSelector)
  const addActivity = useAddActivity()

  const sendTokens = ({
    token,
    amount,
    fromAddress,
    toAddress,
    srcChain,
    toChain,
  }: {
    token: TransactionToken
    amount: string
    fromAddress: string
    toAddress: string
    srcChain: string
    toChain: string
  }) => {
    setWallet((wallet) => {
      // check if asset exists in the wallet for the active chain
      const assetIndex = wallet.assets[srcChain].findIndex((v) => v.symbol === token.symbol)
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

      // if the assets were transferred to the current wallet at a different address
      if (wallet.addresses[toChain] === toAddress) {
        // check if asset already exists
        const assetIndex = updatedWallet.assets[toChain].findIndex((v) => v.symbol === token.symbol)
        const targetChainAssetsArray: Token[] = Array.from(updatedWallet.assets[toChain])
        // if not there - create and attach one
        if (assetIndex === -1) {
          const tokenInfo = tokenWithTargetChainSpecificIbcInfo(srcChain, toChain, token.symbol)
          targetChainAssetsArray.push({
            amount,
            img: tokenInfo.img,
            ibcChainInfo: tokenInfo.ibcChainInfo,
            symbol: tokenInfo.symbol,
            coinMinimalDenom: tokenAndMinimalDenom[token.symbol],
            usdPrice: tokenAndUsdPrice[token.symbol],
            percentChange: tokenAndPriceChanges[token.symbol],
          })
        } else {
          // get the asset
          const asset = updatedWallet.assets[toChain][assetIndex]
          const newAmount = Number(amount) + Number(asset.amount)
          targetChainAssetsArray.splice(assetIndex, 1, {
            ...asset,
            amount: newAmount.toFixed(4),
          })
        }

        updatedWallet.assets[toChain] = targetChainAssetsArray
      }

      return updatedWallet
    })
    const amountInMinimalDenom = (Number(amount) * 10 ** 6).toString()
    addActivity({
      action: 'send',
      amount: amountInMinimalDenom,
      denomID: tokenAndMinimalDenom[token.symbol] as SupportedDenoms,
      feeAmount: '250',
      fromAddress: fromAddress,
      toAddress: toAddress,
      title: `Sent ${amount} ${token.symbol}`,
      subtitle: `To ${sliceAddress(toAddress)}`,
    })
  }

  return sendTokens
}
