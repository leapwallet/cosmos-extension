import {
  ChainInfo,
  ChainInfos,
  getBech32Address,
  isEthAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { bech32 } from 'bech32'
import { COMPASS_CHAINS } from 'config/config'
import { isCompassWallet } from 'utils/isCompassWallet'

export function generateAddresses(_address: string) {
  try {
    let address = _address
    if (isEthAddress(address) && !isCompassWallet()) {
      address = getBech32Address('ethereum', address)
    }
    const chainsArray = isCompassWallet()
      ? Object.values(ChainInfos).filter((chain) => COMPASS_CHAINS.includes(chain.key))
      : Object.values(ChainInfos)

    if (isCompassWallet()) {
      const obj: Record<string, string> = {}
      chainsArray.forEach((value) => {
        obj[value.key] = address
      })
      return obj as Record<SupportedChain, string>
    }

    if (address.startsWith('bc1q')) {
      const chain = chainsArray.find((chain) => chain.addressPrefix === 'bc1q') as ChainInfo
      if (!chain) throw new Error()
      return { [chain.chainRegistryPath]: address } as Record<SupportedChain, string>
    } else if (address.startsWith('tb1q')) {
      const chain = chainsArray.find((chain) => chain.addressPrefix === 'tb1q') as ChainInfo
      if (!chain) throw new Error()
      return { [chain.chainRegistryPath]: address } as Record<SupportedChain, string>
    } else {
      const { words, prefix } = bech32.decode(address)

      const coinType = chainsArray.find((chain) => chain.addressPrefix === prefix)?.bip44.coinType

      const obj: Record<string, string> = {}
      chainsArray.forEach((value) => {
        if (value.bip44.coinType === coinType) {
          const generatedAddress = bech32.encode(value.addressPrefix, words)
          obj[value.key] = generatedAddress
        }
      })
      return obj as Record<SupportedChain, string>
    }
  } catch (error) {
    return {} as Record<SupportedChain, string>
  }
}
