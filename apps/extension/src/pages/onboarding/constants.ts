import { Images } from 'images'

export const IMPORT_WALLET_DATA: {
  [name: string]: {
    imgSrc: string
    title: string | undefined
    'data-testing-id': string
  }
} = {
  Keplr: {
    imgSrc: Images.Logos.Keplr,
    title: 'Keplr',
    'data-testing-id': '',
  },
  WalletIcon: {
    imgSrc: Images.Misc.WalletIcon,
    title: undefined,
    'data-testing-id': 'import-seed-phrase',
  },
  PrivateKey: {
    imgSrc: Images.Misc.PkWallet,
    title: 'Using a Private key',
    'data-testing-id': 'import-private-key',
  },
}
