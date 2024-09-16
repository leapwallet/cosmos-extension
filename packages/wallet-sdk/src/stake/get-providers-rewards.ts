import { QueryDelegatorRewardsRequest, QueryDelegatorRewardsResponse } from '../proto/lava/query';
import { createGrpcWebClient } from '../proto/lava/rpc.query';

const BASE_URL = 'https://lav1.grpc.lava.build';

export async function getProviderRewards(address: string) {
  const grpcClient = await createGrpcWebClient({ endpoint: BASE_URL });

  const request: QueryDelegatorRewardsRequest = {
    delegator: address,
    provider: '',
    chainId: '',
  };
  const res: QueryDelegatorRewardsResponse = await grpcClient.lavanet.lava.dualstaking.delegatorRewards(request);

  return res;
}
