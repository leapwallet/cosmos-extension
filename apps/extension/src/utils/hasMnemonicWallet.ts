import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { Keystore } from '@leapwallet/leap-keychain'

export const hasMnemonicWallet = (wallets: Keystore<string> | undefined | null) => {
  return Object.values(wallets ?? {}).find((wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE)
}
