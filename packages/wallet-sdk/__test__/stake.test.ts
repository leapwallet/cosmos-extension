import { getApr } from '../src/stake/calculate-apr';
import { GetNetwork } from '../src/stake/network';
import QueryClient from '../src/stake/queryClient';
jest.setTimeout(300000);

describe('stake', () => {
  test('should get deligations', async () => {
    const client = await QueryClient('cosmoshub', 'https://rest.cosmos.directory/theta/');
    const deligations = await client.getDelegations('cosmos1yjy5vj2wwc54y79jkfhyx2ze20ahu7544ghxuh');
    expect(deligations).toBeDefined();
  });

  test('should get delegation rewards', async () => {
    const client = await QueryClient('cosmoshub', 'https://rest.cosmos.directory/theta/');
    const { rewards, result } = await client.getRewards('cosmos1yjy5vj2wwc54y79jkfhyx2ze20ahu7544ghxuh', {});
    expect(rewards).toBeDefined();
    expect(result).toBeDefined();
  });

  test('should get networks', async () => {
    const network = await GetNetwork(false, 'injective');
    expect(network).toBeDefined();
  });
  test('should get apr', async () => {
    const apr = await getApr('injective', false);
    expect(apr).not.toBeNaN();
  });
});
