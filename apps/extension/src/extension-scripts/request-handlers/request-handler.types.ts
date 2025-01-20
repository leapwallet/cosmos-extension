import {
  EthereumRequestMessage,
  LineType,
} from '@leapwallet/cosmos-wallet-provider/dist/provider/types'

export type RequestData = EthereumRequestMessage & {
  origin: string
  ecosystem: LineType
}
