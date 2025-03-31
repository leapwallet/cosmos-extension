import { FeeTokenData, GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import assert from 'assert'
import BigNumber from 'bignumber.js'
import { createContext, useContext } from 'react'
import { Token } from 'types/bank'

export type DisplayFeeValue = {
  value: number
  formattedAmount: string
  fiatValue: string
}

export type GasPriceOptionValue = { option: GasOptions; gasPrice: GasPrice }

export type GasPriceOptionsContextType = {
  gasLimit: BigNumber | string
  setGasLimit: (gasLimit: number | string | BigNumber) => void
  recommendedGasLimit: string
  feeTokenData: FeeTokenData
  // eslint-disable-next-line no-unused-vars
  setFeeTokenData: (feeDenom: FeeTokenData) => void
  value: GasPriceOptionValue
  // eslint-disable-next-line no-unused-vars
  onChange: (value: GasPriceOptionValue, feeDenom: FeeTokenData) => void
  viewAdditionalOptions: boolean
  setViewAdditionalOptions: React.Dispatch<React.SetStateAction<boolean>>
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  feeTokenAsset: Token | undefined
  allTokens: Token[]
  allTokensStatus: 'loading' | 'error' | 'success'
  userHasSelectedToken: boolean
  setUserHasSelectedToken: React.Dispatch<React.SetStateAction<boolean>>
  considerGasAdjustment: boolean
  activeChain: SupportedChain
  selectedNetwork: 'mainnet' | 'testnet'
  isSeiEvmTransaction?: boolean
  chainNativeFeeTokenData?: FeeTokenData
  rootDenomsStore: RootDenomsStore
}

export const GasPriceOptionsContext = createContext<GasPriceOptionsContextType | null>(null)

export const useGasPriceContext = (): GasPriceOptionsContextType => {
  const context = useContext(GasPriceOptionsContext)
  assert(context !== null, 'useGasPriceContext must be used within GasPriceOptionsProvider')
  return context
}
