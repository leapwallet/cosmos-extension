import { WALLETTYPE } from '@leapwallet/leap-keychain'
import { RequestOptions } from 'mixpanel-browser'

export const mixpanelTrackOptions: RequestOptions = {
  send_immediately: true,
  transport: 'sendBeacon',
}

export const mapWalletTypeToMixpanelWalletType = (
  walletType: WALLETTYPE,
): 'seed-phrase' | 'private-key' | 'ledger' => {
  switch (walletType) {
    case WALLETTYPE.LEDGER:
      return 'ledger'
    case WALLETTYPE.PRIVATE_KEY:
      return 'private-key'
    default:
      return 'seed-phrase'
  }
}
