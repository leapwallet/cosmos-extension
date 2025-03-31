import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { COMPASS_CHAINS } from 'config/config'

export function generateAddresses(address: string) {
  try {
    const chainsArray = Object.values(ChainInfos).filter((chain) =>
      COMPASS_CHAINS.includes(chain.key),
    )

    const obj: Record<string, string> = {}
    chainsArray.forEach((value) => {
      obj[value.key] = address
    })
    return obj as Record<SupportedChain, string>
  } catch (error) {
    return {} as Record<SupportedChain, string>
  }
}
