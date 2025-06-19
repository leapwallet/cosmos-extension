import { Key } from '@leapwallet/cosmos-wallet-hooks'

export const getWalletName = (wallets: Key[], prefix = 'Wallet') => {
  let currentWalletCount = wallets.length
  let walletName = `${prefix} ${currentWalletCount + 1}`

  while (wallets.find((wallet) => wallet.name.toLowerCase() === walletName.toLowerCase())) {
    currentWalletCount++
    walletName = `${prefix} ${currentWalletCount + 1}`
  }

  return walletName
}
