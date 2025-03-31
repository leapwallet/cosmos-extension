import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'

export const hasMnemonicWallet = (wallets: Record<string, Key> | undefined | null) => {
  return Object.values(wallets ?? {}).find(
    (wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE && !wallet?.watchWallet,
  )
}
