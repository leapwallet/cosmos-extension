import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'

export const mapWalletTypeToMixpanelWalletType = (walletType: WALLETTYPE): string => {
  switch (walletType) {
    case WALLETTYPE.LEDGER:
      return 'ledger'
    case WALLETTYPE.PRIVATE_KEY:
      return 'privateKey'
    case WALLETTYPE.SEED_PHRASE:
      return 'seedPhrase'
    default:
      return 'unknown'
  }
}

export const mixpanelTrackOptions = {
  transport: 'sendBeacon',
}
