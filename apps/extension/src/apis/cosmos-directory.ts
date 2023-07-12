/* eslint-disable @typescript-eslint/no-namespace */
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'

export namespace CosmosDirectory {
  const baseUrl = 'https://chains.cosmos.directory'
  export async function fetchAssetList(chain: SupportedChain) {
    const url = `${baseUrl}/${chain}/assetlist`
    const res = await fetch(url)
    const json = await res.json()
    return json
  }
}
