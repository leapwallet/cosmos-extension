import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

export enum SwapSheet {
  NONE_ACTIVE = 0,
  SELECT_TOKEN = 1,
  SELECT_TARGET_TOKEN = 2,
  REVIEW_SLIPPAGE = 3,
  REVIEW_SWAP = 4,
}

export type SwapProviderProps = {
  chain: SupportedChain
} & React.PropsWithChildren
