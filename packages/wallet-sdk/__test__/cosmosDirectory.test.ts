import CosmosDirectory from '../src/chains/cosmosDirectory';
import { Operators } from '../src/types/validators';
import { Chain } from './../src/types/chains-directory';

describe('directory', () => {
  test('should generate correct wallet address', async () => {
    const dir = CosmosDirectory(false);
    const vals = await dir.getValidators('osmosis');
    const opr = (await dir.getOperatorAddresses()) as Operators;
    const chains = (await dir.getChains()) as Record<string, Chain>;
    expect(vals).toBeDefined();
    expect(opr).toBeDefined();
    expect(chains).toBeDefined();
  });
});
