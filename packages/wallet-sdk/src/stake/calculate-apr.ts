import axios from 'axios';
import BigNumber from 'bignumber.js';
import { isNumber } from 'lodash';

import { getChainInfo } from '../chains';
import { ChainInfo, ChainInfos, NativeDenom, SupportedChain } from '../constants';

export async function getAprCrescent() {
  const url = 'https://apigw-v3.crescent.network/stake/live';
  const aprResponse = await axios.get(url);

  return parseFloat(aprResponse.data.data.apr) / 100;
}

export async function getApr(chain: SupportedChain, testnet: boolean, chainInfos?: Record<SupportedChain, ChainInfo>) {
  const chainData = await getChainInfo(chain, testnet);
  if (!chainData) {
    return 0;
  }
  if (chain === 'crescent') return getAprCrescent();
  if (isNumber(chainData.params?.calculated_apr)) {
    return chainData.params?.calculated_apr ?? 0;
  }

  /**
   * apr formula
   *
   * new_coins_per_yr = inflation_percent * total_supply * (1 - community_tax)
   * apr = new_coins_per_yr / total_bonded_tokens
   */
  const lcd = !testnet ? (chainInfos ?? ChainInfos)[chain].apis.rest : (chainInfos ?? ChainInfos)[chain].apis.restTest;

  const denom = Object.values((chainInfos ?? ChainInfos)[chain].nativeDenoms)[0];
  return await getAprFromLcd(lcd, denom);
}
export async function getAprFromLcd(lcd: string | undefined, denom: NativeDenom) {
  try {
    const apis = {
      inflation: `${lcd}/cosmos/mint/v1beta1/inflation`,
      supplyData: `${lcd}/cosmos/bank/v1beta1/supply/${denom.coinMinimalDenom}`,
      distributionParams: `${lcd}/cosmos/distribution/v1beta1/params`,
      poolData: `${lcd}/cosmos/staking/v1beta1/pool`,
    };

    const [inflationData, supplyData, distributionParams, poolData] = await Promise.all(
      Object.values(apis).map(async (api) => {
        try {
          const res = await axios.get(api);
          return res;
        } catch (e) {
          return { data: {} };
        }
      }),
    );

    const inflationPercent = new BigNumber(inflationData.data.inflation ?? '0');
    const totalSupply = new BigNumber(supplyData.data.amount.amount ?? '0');
    const communityTax = new BigNumber(distributionParams.data.params.community_tax ?? '0');
    const bondedTokens = new BigNumber(poolData.data.pool.bonded_tokens ?? '0');

    return inflationPercent
      .multipliedBy(totalSupply)
      .multipliedBy(new BigNumber(1).minus(communityTax))
      .div(bondedTokens)
      .toNumber();
  } catch (e) {
    return 0;
  }
}
