import nameMatcha, { allowedTopLevelDomains } from '@leapwallet/name-matcha'
import { useDebounceCallback } from 'hooks/useDebounceCallback'
import { useEffect, useState } from 'react'

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const useNameServiceResolver = (queryAddress: string, network: 'mainnet' | 'testnet') => {
  const [data, setData] = useState({})
  const [isLoading, setLoading] = useState(false)
  const { debounce } = useDebounceCallback()
  const getAllResolvedAddresses = async (queryAddress: string) => {
    try {
      setLoading(true)
      const data = await nameMatcha.resolveAll(queryAddress, allowedTopLevelDomains)
      setData(data)
      // eslint-disable-next-line no-empty
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

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
}
