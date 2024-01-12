import { Images } from 'images'

export const IMPORT_WALLET_DATA: {
  [name: string]: {
    imgSrc: string
    title: string | undefined
    'data-testing-id': string
    mixpanelMethod: string
  }
} = {
  Keplr: {
    imgSrc: Images.Logos.Keplr,
    title: 'Keplr',
    'data-testing-id': '',
    mixpanelMethod: 'existing-keplr',
  },
  WalletIcon: {
    imgSrc: Images.Misc.WalletIcon,
    title: undefined,
    'data-testing-id': 'import-seed-phrase',
    mixpanelMethod: 'existing-seed',
  },
  PrivateKey: {
    imgSrc: Images.Misc.PkWallet,
    title: 'Using a Private key',
    'data-testing-id': 'import-private-key',
    mixpanelMethod: 'existing-pk',
  },
}
