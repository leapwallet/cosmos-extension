import { QueryDelegatorRewardsRequest, QueryDelegatorRewardsResponse } from '../proto/lava/query';
import { createGrpcWebClient } from '../proto/lava/rpc.query';

const BASE_URL = 'https://lava.grpc.lava.build';
const BASE_URL_TESETNET = 'https://lav1.grpc.lava.build';

export async function getProviderRewards(address: string, selectedNetwork: 'testnet' | 'mainnet') {
  const grpcClient = await createGrpcWebClient({
    endpoint: selectedNetwork === 'testnet' ? BASE_URL_TESETNET : BASE_URL,
  });

  const request: QueryDelegatorRewardsRequest = {
    delegator: address,
    provider: '',
    chainId: '',
  };
  const res: QueryDelegatorRewardsResponse = await grpcClient.lavanet.lava.dualstaking.delegatorRewards(request);

  return res;
}
