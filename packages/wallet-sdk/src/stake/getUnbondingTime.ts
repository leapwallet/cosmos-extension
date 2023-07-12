import axios from 'axios';

import { getChainInfo } from '../chains';
import { ChainInfo, ChainInfos, SupportedChain } from '../constants';

export const getUnbondingTime = async (
  chain: SupportedChain,
  testnet: boolean,
  lcdUrl?: string,
  chainInfos?: Record<SupportedChain, ChainInfo>,
) => {
  if (!lcdUrl) {
    const chainData = await getChainInfo(chain, testnet);
    if (!chainData) {
      return { unbonding_time: 0 };
    }
    if (chainData.params?.unbonding_time) {
      return { unbonding_time: chainData.params?.unbonding_time ?? 0 };
    }
  }

  const lcd = !testnet ? (chainInfos ?? ChainInfos)[chain].apis.rest : (chainInfos ?? ChainInfos)[chain].apis.restTest;
  const { data } = await axios.get(`${lcdUrl ?? lcd}/cosmos/staking/v1beta1/params`);
  const unbonding_time = parseInt(data.params.unbonding_time, 10);

  return { unbonding_time };
};
