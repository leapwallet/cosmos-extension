import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export type QueryOptions<T> = Omit<UseQueryOptions<T, unknown>, 'queryFn' | 'queryKey'>;

export const defaultQueryOptions: QueryOptions<any> = {
  retry: 2,
  retryDelay: 0,
  networkMode: 'always',
};

export class CosmWasmClientHandler {
  private static clients = new Map<string, CosmWasmClient>();
  static getClient = async (rpcUrl: string) => {
    if (!this.clients.has(rpcUrl)) {
      this.clients.set(rpcUrl, await CosmWasmClient.connect(rpcUrl));
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.clients.get(rpcUrl)!;
  };
}

/**
 * Create a use a cosm-wasm client
 *
 * @param rpcUrl URL for the rpc endpoint
 * @param options options for query
 */
export const useCosmWasmClient = (rpcUrl: string, options: QueryOptions<CosmWasmClient> = defaultQueryOptions) => {
  const queryResult = useQuery<CosmWasmClient>({
    queryKey: [rpcUrl],
    queryFn: () => CosmWasmClientHandler.getClient(rpcUrl),
    ...options,
  });

  return {
    client: queryResult.data,
    error: queryResult.error,
    status: queryResult.status,
  } as const;
};
