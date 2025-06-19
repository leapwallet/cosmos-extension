import type { NameServiceResolveResult } from '@leapwallet/name-matcha'
import { allowedTopLevelDomains, registry } from '@leapwallet/name-matcha'
import { useDebounceCallback } from 'hooks/useDebounceCallback'
import { useCallback, useEffect, useState } from 'react'

export type { NameServiceResolveResult }

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const useNameServiceResolver = (queryAddress: string, network: 'mainnet' | 'testnet') => {
  const [data, setData] = useState<Record<string, NameServiceResolveResult | null>>({})

  const [isLoading, setLoading] = useState(false)
  const { debounce } = useDebounceCallback()
  const getAllResolvedAddresses = useCallback(
    async (queryAddress: string) => {
      try {
        setLoading(true)
        registry.setNetwork(network)
        const options = {
          allowedTopLevelDomains,
        }

        const data = await registry.resolveAll(queryAddress, options)
        setData(data)
        // eslint-disable-next-line no-empty
      } catch (err) {
      } finally {
        setLoading(false)
      }
    },
    [network],
  )

  const debounceResolver = debounce(getAllResolvedAddresses, 200)

  useEffect(() => {
    if (queryAddress) {
      debounceResolver(queryAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryAddress])

  return [isLoading, data]
}

export const nameServices: Record<string, string> = {
  ibcDomains: 'IBC Domains',
  icns: 'Interchain Name Service',
  stargazeNames: 'Stargaze Names',
  archIds: 'Arch ID',
  spaceIds: 'Space ID',
  sns: 'SNS',
  degeNS: 'DegeNS',
  bdd: 'BDD',
  celestialsId: 'Celestials ID',
}
