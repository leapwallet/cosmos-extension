import { ChainData, ChainInfo, ChainInfos, getApr, getRestUrl, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';

import { getChainsAprSnapshot } from '../store';

export async function getChainsApr(
  chain: SupportedChain,
  testnet: boolean,
  chainInfos?: Record<SupportedChain, ChainInfo>,
  chainData?: ChainData,
) {
  try {
    const chainsApr = await getChainsAprSnapshot();

    if (chainsApr[ChainInfos[chain].chainId] !== undefined) {
      return chainsApr[ChainInfos[chain].chainId];
    }

    const denom = Object.values((chainInfos ?? ChainInfos)[chain].nativeDenoms)[0];
    const lcd = getRestUrl(chainInfos ?? ChainInfos, chain, testnet);
    const url = `${process.env.LEAP_WALLET_BACKEND_API_URL}/market/apr-changes`;

    const requestData = {
      testnet: false,
      denom: denom.coinMinimalDenom,
      chainRegistryPath: chainInfos?.[chain].chainRegistryPath,
      url: lcd,
    };
    const response = await axios.post(url, requestData);
    return response.data.apr;
  } catch (error) {
    return await getApr(chain, testnet, chainInfos, chainData);
  }
}
