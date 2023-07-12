import axios, { AxiosError } from 'axios';

import { ChainInfos, SupportedChain } from '../constants';
import { ChainData, ChainMetaData } from '../types/chains-metadata';

export async function getChainInfo(chain: string, testnet?: boolean): Promise<ChainData | undefined> {
  if (chain === 'mars') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return {
      chain_name: 'Mars',
      decimals: 6,
      denom: 'umars',
    };
  }

  if (chain === 'noble') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return {
      chain_name: 'Noble',
      decimals: 6,
      denom: 'usdc',
    };
  }

  if (chain === 'chain4energy') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return {
      chain_name: 'Chain4Energy',
      decimals: 6,
      denom: 'uc4e',
    };
  }

  let chainRegistryPath = ChainInfos[chain as SupportedChain]?.chainRegistryPath;
  const testnetChainRegistryPath =
    ChainInfos[chain as SupportedChain]?.testnetChainRegistryPath ??
    `${ChainInfos[chain as SupportedChain]?.chainRegistryPath}testnet`;

  if (testnet && chain === 'quasar') {
    chainRegistryPath = 'quasartestnet';
  }

  const baseUrl = testnet ? 'https://chains.testcosmos.directory' : 'https://chains.cosmos.directory';

  if (!chainRegistryPath) {
    return undefined;
  }

  // If testnet then get with testnetChainRegistryPath else with chainRegistryPath
  if (testnet) {
    try {
      const { data: testnetData } = await axios.get<ChainMetaData>(`${baseUrl}/${testnetChainRegistryPath}`);
      return testnetData.chain;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.warn(e.response?.data);
      } else {
        console.log('Please report this error to support@leapwallet.io');
        console.error(e);
      }
    }
  }

  // get with chainRegistryPath
  try {
    const { data } = await axios.get<ChainMetaData>(`${baseUrl}/${chainRegistryPath}`);
    return data.chain;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.warn(e.response?.data);
    } else {
      console.log('Please report this error to support@leapwallet.io');
      console.error(e);
    }
    return undefined;
  }
}
