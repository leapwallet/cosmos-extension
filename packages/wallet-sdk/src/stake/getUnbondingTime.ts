import { getChainInfo } from '../chains';
import { ChainInfo, ChainInfos, SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { ChainData } from '../types';
import { getRestUrl } from '../utils';

export const getUnbondingTime = async (
  chain: SupportedChain,
  testnet: boolean,
  lcdUrl?: string,
  chainInfos?: Record<SupportedChain, ChainInfo>,
  chainData?: ChainData,
) => {
  if (!lcdUrl) {
    if (!chainData) {
      chainData = await getChainInfo(chain, testnet);
    }

    if (!chainData) {
      return { unbonding_time: 0 };
    }

    if (chainData.params?.unbonding_time) {
      return { unbonding_time: chainData.params?.unbonding_time ?? 0 };
    }
  }

  const lcd = getRestUrl(chainInfos ?? ChainInfos, chain, testnet);
  const { data } = await axiosWrapper({
    baseURL: lcd,
    method: 'get',
    url: ['initia', 'initiaEvm'].includes(chain) ? '/initia/mstaking/v1/params' : '/cosmos/staking/v1beta1/params',
  });

  const unbonding_time = parseInt(data.params.unbonding_time, 10);

  return { unbonding_time };
};
