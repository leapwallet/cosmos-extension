import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
export type Keystore = Record<string, Key>
export const hasMnemonicWallet = (wallets: Keystore | undefined | null) => {
  return Object.values(wallets ?? {}).find((wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE)
}
