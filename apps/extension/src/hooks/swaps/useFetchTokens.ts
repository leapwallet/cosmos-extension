import { useEffect, useState } from 'react'
import { fetchedTokenTypes } from 'types/swap'

const fetchTokenLink =
  'https://assets.leapwallet.io/CosmosContracts/junoswap-asset-list/ibc_assets.json'

const juno = {
  id: 'juno',
  name: 'JUNO',
  symbol: 'JUNO',
  chain_id: 'juno-1',
  rpc: 'https://rpc.cosmos.directory:443/juno',
  denom: 'ujuno',
  decimals: 6,
  channel: '',
  juno_channel: '',
  juno_denom: '',
  logoURI: 'https://assets.leapwallet.io/juno.png',
}

export const useFetchTokens = () => {
  const [tokens, setTokens] = useState<fetchedTokenTypes[]>([])

  useEffect(() => {
    const fetchTokens = async () => {
      const response = await fetch(`${fetchTokenLink}`)
      const data = await response.json()

      setTokens([...data.tokens, juno])
    }
    fetchTokens()
  }, [])

  return [tokens]
}
