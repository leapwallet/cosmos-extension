import {
  cachedRemoteDataWithLastModified,
  storage,
  useActiveChain,
  useAddress,
  useGetStorageLayer,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, getSourceChainChannelId, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { DepositResult, generateDepositAddress } from 'nomic-bitcoin'

export type NomicBTCDepositConstants = {
  args: {
    relayers: string[]
    network: 'bitcoin' | 'testnet' | 'regtest'
  }
  banner: {
    chains: (SupportedChain | 'All')[]
    banner_url: string
  }
  deposit_sheet: {
    bitcoin_miner_fee: string
    estimated_arrival: string
    nomic_bridge_fee: { nomic: string; non_nomic: string }
  }
  ibcChains: string[]
}

export const getNomicBTCDepositConstants = (
  storage: storage,
): Promise<NomicBTCDepositConstants> => {
  return cachedRemoteDataWithLastModified({
    remoteUrl:
      'https://assets.leapwallet.io/cosmos-registry/v1/nomic-btc-deposit/nomic-btc-deposit-constants.json',
    storageKey: 'nomic-btc-deposit-constants',
    storage,
  })
}

export function useNomicBTCDepositConstants() {
  const storage = useGetStorageLayer()
  const chain = ChainInfos.nomic.chainRegistryPath

  return useQuery<NomicBTCDepositConstants>(
    ['query-nomic-btc-deposit-constants', chain],
    async () => {
      const res = await fetch(`https://assets.leapwallet.io/ibc-support-db/chains/${chain}.json`)
      const ibcChains = await res.json()

      const constants: NomicBTCDepositConstants = await getNomicBTCDepositConstants(storage)
      return { ...constants, ibcChains }
    },
    {
      retry: 2,
    },
  )
}

export function useGetBTCDepositInfo(forceChain?: SupportedChain) {
  const selectedChain = useActiveChain()
  const chain = forceChain ?? selectedChain
  const activeAddress = useAddress(chain)
  const { data } = useNomicBTCDepositConstants()
  const nomicChain = ChainInfos.nomic.chainRegistryPath

  return useQuery<DepositResult | undefined>(
    ['query-generate-deposit-address', data, activeAddress, chain, nomicChain],
    async () => {
      if (data) {
        const channel = await getSourceChainChannelId(nomicChain, chain)
        return await generateDepositAddress({
          ...data.args,
          channel,
          receiver: activeAddress,
        })
      }
    },
    { enabled: !!data },
  )
}
