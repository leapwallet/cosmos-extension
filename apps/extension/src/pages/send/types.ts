import { Dict } from 'types/utility'

export type SelectedAddress = {
  avatarIcon: string | undefined
  chainIcon: string | undefined
  chainName: string
  name: string
  address: string | undefined
  emoji: number | undefined
  selectionType: 'saved' | 'currentWallet' | 'notSaved' | 'nameService'
  information?: Dict
}
