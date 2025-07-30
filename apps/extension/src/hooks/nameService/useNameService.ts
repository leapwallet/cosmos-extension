import { Token } from '@leapwallet/cosmos-wallet-store'
import type { NameServiceResolveResult } from '@leapwallet/name-matcha'
import { allowedTopLevelDomains, registry } from '@leapwallet/name-matcha'
import { useDebounceCallback } from 'hooks/useDebounceCallback'
import { useSendContext } from 'pages/send/context'
import { useCallback, useEffect, useRef, useState } from 'react'

export type { NameServiceResolveResult }

const getSpaceIdEcosystemFromToken = (token: Token | null) => {
  if (!token) return undefined
  if (token.chain === 'bitcoin' || token.chain === 'bitcoinSignet') return 'btc'
  if (token.isEvm) return 'evm'
  if (token.isAptos) return 'aptos'
  if (token.isSolana) return 'sol'
  if (token.isSui) return 'sui'
  return undefined
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const useNameServiceResolver = (queryAddress: string, network: 'mainnet' | 'testnet') => {
  const [data, setData] = useState<Record<string, NameServiceResolveResult | null>>({})
  const [isLoading, setLoading] = useState(true)
  const { debounce } = useDebounceCallback()
  const latestQueryRef = useRef('')
  const { selectedToken } = useSendContext()

  const getAllResolvedAddresses = useCallback(
    async (queryAddress: string) => {
      latestQueryRef.current = queryAddress
      try {
        setLoading(true)
        registry.setNetwork(network)
        const data = await registry.resolveAll(queryAddress, {
          allowedTopLevelDomains,
          paymentIdEcosystem: queryAddress.includes('@')
            ? getSpaceIdEcosystemFromToken(selectedToken)
            : undefined,
        })
        if (latestQueryRef.current === queryAddress) {
          setData(data)
        }
        // eslint-disable-next-line no-empty
      } catch (err) {
      } finally {
        if (latestQueryRef.current === queryAddress) {
          setLoading(false)
        }
      }
    },
    [network, selectedToken],
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
  nibId: 'Nib ID',
  degeNS: 'DegeNS',
  bdd: 'BDD',
  celestialsId: 'Celestials ID',
}
