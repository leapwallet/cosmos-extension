import { ChainInfos, fetchAllBalancesRestApi, fetchCW20Balances } from '../src';
import { fetchAllBalances, getDenomTrace } from '../src';
import { Cw20Denoms } from '../src/constants/cw20-denoms';
import constants from './constants';

const { ADDRESSES, RPC_ENDPOINT_TEST } = constants;
jest.setTimeout(300000);

describe('bank', () => {
  test('should fetch token balances', async () => {
    const balancesJuno = await fetchAllBalances(
      ChainInfos.juno.apis.rpc,
      'juno16s96n9k9zztdgjy8q4qcxp4hn7ww98qkss2mfe',
    );

    const balancesCosmos = await fetchAllBalances(RPC_ENDPOINT_TEST.cosmoshub, ADDRESSES.cosmos);
    expect(balancesJuno).toBeDefined();
    expect(balancesCosmos).toBeDefined();
  });

  test('should fetch token balances using lcd api', async () => {
    const balancesJuno = await fetchAllBalancesRestApi(
      ChainInfos.cosmos.apis.rest,
      'cosmos19vf5mfr40awvkefw69nl6p3mmlsnacmm28xyqh',
    );
    expect(balancesJuno).toBeDefined();
  });

  test('should return correct ibc denom trace', async () => {
    const denomHash = '27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2';
    const denomTrace = await getDenomTrace(denomHash, ChainInfos.osmosis.apis.rpc);

    expect(denomTrace).toMatchObject({
      denomTrace: { denomTrace: { path: 'transfer/channel-0', baseDenom: 'uatom' } },
    });
  });

  test('should fetch cw20 token balances', async () => {
    const tokenAddresses = Object.keys(Cw20Denoms.juno);
    const balances = await fetchCW20Balances(
      ChainInfos.juno.apis.rpc,
      'juno16s96n9k9zztdgjy8q4qcxp4hn7ww98qkss2mfe',
      tokenAddresses,
    );
    expect(balances).toBeDefined();
  });
});
