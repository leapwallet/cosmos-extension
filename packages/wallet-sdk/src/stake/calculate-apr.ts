import axios from 'axios';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { isNumber } from 'lodash';

import { getChainInfo } from '../chains';
import { ChainInfo, ChainInfos, NativeDenom, SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { estimateStakingAPR } from '../sei-js/core';
import { ChainData } from '../types';
import { getRestUrl } from '../utils';

export async function getAprSei(restUrl: string) {
  const apr = await estimateStakingAPR(restUrl);
  return apr;
}

export async function getAprCrescent() {
  const url = 'https://apigw-v3.crescent.network/stake/live';
  const aprResponse = await axios.get(url);

  return parseFloat(aprResponse.data.data.apr) / 100;
}

export async function getAprLava(): Promise<number> {
  const url = 'https://jsinfo.mainnet.lavanet.xyz/apr';
  const aprResponse = await axios.get(url);
  const apr = aprResponse.data.staking_apr_percentile;
  return apr;
}

export async function getAprOsmosis() {
  const start = dayjs().subtract(7, 'days').format('YYYY-MM-DD');
  const end = dayjs().format('YYYY-MM-DD');

  const url = `https://public-osmosis-api.numia.xyz/apr?start_date=${start}&end_date=${end}`;
  const aprResponse = await axios.get<{ symbol: string; apr: number }[]>(url);

  if (!aprResponse.data?.length) return 0;

  const aprData = aprResponse.data.filter((v) => v.symbol === 'total');
  const avgApr = aprData.reduce((acc: number, v) => acc + v.apr, 0) / aprData.length;

  return avgApr / 100;
}

export async function getAprMantra(lcd: string, chainInfos: Record<SupportedChain, ChainInfo>, chainData?: ChainData) {
  let apr = chainData?.params?.calculated_apr ?? 0;
  if (!isNumber(apr) || apr === 0) {
    const denom = Object.values(chainInfos.mantra.nativeDenoms)[0];
    apr = await getAprFromLcd(lcd, denom);
  }

  const taxModule = 0.6;
  return apr * taxModule;
}

export async function getApr(
  chain: SupportedChain,
  testnet: boolean,
  chainInfos?: Record<SupportedChain, ChainInfo>,
  chainData?: ChainData,
) {
  if (chain === 'crescent') {
    return getAprCrescent();
  }
  if (chain === 'osmosis') {
    return getAprOsmosis();
  }

  if (chain === 'lava') {
    return getAprLava();
  }

  if (!chainInfos) {
    chainInfos = ChainInfos;
  }

  const lcd = getRestUrl(chainInfos, chain, testnet);
  if (['seiTestnet2', 'seiDevnet'].includes(chain)) {
    return getAprSei(lcd);
  }

  if (!chainData) {
    chainData = await getChainInfo(chain, testnet);
  }

  if (chain === 'mantra') {
    return getAprMantra(lcd, chainInfos, chainData);
  }

  if (isNumber(chainData?.params?.calculated_apr)) {
    return chainData.params?.calculated_apr ?? 0;
  }

  /**
   * apr formula
   *
   * new_coins_per_yr = inflation_percent * total_supply * (1 - community_tax)
   * apr = new_coins_per_yr / total_bonded_tokens
   */

  const denom = Object.values(chainInfos[chain].nativeDenoms)[0];
  return await getAprFromLcd(lcd, denom);
}

export async function getAprFromLcd(lcd: string | undefined, denom: NativeDenom) {
  try {
    const apis = {
      inflation: '/cosmos/mint/v1beta1/inflation',
      supplyData: `/cosmos/bank/v1beta1/supply/${denom.coinMinimalDenom}`,
      distributionParams: '/cosmos/distribution/v1beta1/params',
      poolData: '/cosmos/staking/v1beta1/pool',
    };

    const [inflationData, supplyData, distributionParams, poolData] = await Promise.all(
      Object.values(apis).map(async (api) => {
        try {
          const res = await axiosWrapper({
            baseURL: lcd,
            method: 'get',
            url: api,
          });

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
