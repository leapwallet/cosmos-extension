export type SelectedAddress = {
  avatarIcon: string
  chainIcon: string
  chainName: string
  name: string
  address: string
  emoji: number
  selectionType: 'saved' | 'currentWallet' | 'notSaved'
}
