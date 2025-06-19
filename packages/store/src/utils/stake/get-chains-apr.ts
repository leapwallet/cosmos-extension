import {
  ChainData,
  ChainInfo,
  ChainInfos,
  getApr,
  getChainInfo,
  getRestUrl,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';

import { getBaseURL } from '../../globals/config';
import { ChainsAprData } from '../../types';

export async function getChainsApr(
  chainsApr: ChainsAprData,
  chain: SupportedChain,
  testnet: boolean,
  chainInfos?: Record<SupportedChain, ChainInfo>,
  chainData?: ChainData,
) {
  try {
    if (chainsApr[ChainInfos[chain].chainId] !== undefined) {
      return chainsApr[ChainInfos[chain].chainId];
    }

    const denom = Object.values((chainInfos ?? ChainInfos)[chain].nativeDenoms)[0];
    const lcd = getRestUrl(chainInfos ?? ChainInfos, chain, testnet);
    const url = `${getBaseURL()}/market/apr-changes`;

    const requestData = {
      testnet: false,
      denom: denom.coinMinimalDenom,
      chainRegistryPath: chainInfos?.[chain].chainRegistryPath,
      url: lcd,
    };
    const response = await axios.post(url, requestData);
    return response.data.apr;
  } catch (error) {
    const chainData = await getChainInfo(chain, testnet);
    return await getApr(chain, testnet, chainInfos, chainData);
  }
}
