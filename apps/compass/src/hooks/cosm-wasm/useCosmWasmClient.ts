import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { useRpcUrl } from 'hooks/settings/useRpcUrl'

import { cosmWasmClientRouter } from './cosmWasmClientRouter'

export const useCosmWasmClient = (chain?: SupportedChain) => {
  const chainRPC_URL = useRpcUrl(chain)

  const { data, error, status } = useQuery(
    ['@cosmwasm-client', chainRPC_URL],
    async () => cosmWasmClientRouter.connect(chainRPC_URL.rpcUrl as string),
    { enabled: Boolean(chainRPC_URL?.rpcUrl) },
  )

  return { client: data, error, status } as const
}
