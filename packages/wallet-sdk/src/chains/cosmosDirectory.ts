import axios from 'axios';

import { ChainInfo, NativeDenom, SupportedChain } from '../constants';
import { ChainValidator } from '../types/validators';
import { Validator } from '../types/validators';
import { fromSmall } from '../utils';
import { getValidatorsList } from './getValidators';

function CosmosDirectory(testnet: boolean) {
  const protocol = 'https';
  const mainnetDomain = 'cosmos.directory';
  const testnetDomain = 'testcosmos.directory';
  const domain = testnet ? testnetDomain : mainnetDomain;
  const rpcBase = `${protocol}://rpc.${domain}`;
  const restBase = `${protocol}://rest.${domain}`;
  const chainsUrl = `${protocol}://chains.${domain}`;
  const validatorsUrl = `${protocol}://validators.${domain}`;

  function rpcUrl(name: string) {
    return rpcBase + '/' + name;
  }

  function restUrl(name: string) {
    return restBase + '/' + name;
  }

  async function getChains() {
    const res = await axios.get(chainsUrl);
    const data = res.data;
    const data_1 = Array.isArray(data) ? data : data.chains;
    return data_1.reduce((a: any, v: any) => ({ ...a, [v.path]: v }), {});
  }

  async function getChainData(name: string) {
    const res = await axios.get([chainsUrl, name].join('/'));
    return res.data.chain;
  }

  async function getTokenData(name: string) {
    return axios.get([chainsUrl, name, 'assetlist'].join('/')).then((res) => res.data);
  }

  /**
   * @description Fetch validators from CosmosDirectoryUrl, if not found then
   * fetch using Using chain endpoints
   * @param chainName
   * @returns Promise<Validator[]>
   */
  async function getValidators(
    chainName: SupportedChain,
    lcdUrl?: string,
    denom?: NativeDenom,
    chainInfos?: Record<SupportedChain, ChainInfo>,
  ): Promise<Validator[]> {
    let res;

    try {
      const chainRegistryPath = chainInfos?.[chainName].chainRegistryPath ?? chainName;
      const testnetChainRegistryPath =
        chainInfos?.[chainName].testnetChainRegistryPath ?? `${chainInfos?.[chainName].chainRegistryPath}testnet`;

      // Fetch validators from CosmosDirectoryUrl
      res = await axios.get(validatorsUrl + '/chains/' + (testnet ? testnetChainRegistryPath : chainRegistryPath));
    } catch {
      //
    }

    const result = new ChainValidator(res?.data);
    result?.validators.forEach((r) => {
      r.tokens = fromSmall(r?.tokens ?? '0', denom?.coinDecimals ?? 6);
    });

    // Filter on testnets or on no validator found
    let validators: Validator[] = [];
    if (testnet || !result?.validators || result?.validators?.length === 0) {
      try {
        // Using chain endpoints
        validators = await getValidatorsList(chainName, testnet, lcdUrl, chainInfos);
      } catch {
        //
      }

      // Merge validator from directoryUrl and ChainUrl
      validators = validators?.map((v) => {
        const data = (result?.validators.find((r) => r?.address === v?.address) ?? {}) as Validator;
        return { ...data, ...v };
      });

      if (validators.length > 0) return validators ?? [];
    }

    return result.validators ?? [];
  }

  /**
   * @deprecated
   * Get addresses of all Operators who runs validator node, for all chains
   * @param chainId
   * @returns
   */
  async function getOperatorAddresses(chainId?: string) {
    if (chainId === 'atlantic') {
      const res = await axios.get(validatorsUrl + '/chains/' + chainId);
      const result = new ChainValidator(res.data);
      return result.validators.reduce((sum: any) => {
        sum['atlantic'] = {};
        return sum;
      }, {});
    }
    const res = await axios.get(validatorsUrl);
    const data = res.data;
    const data_1 = Array.isArray(data) ? data : data.validators;

    return data_1.reduce((sum: any, validator: any) => {
      validator.chains.forEach((chain: any) => {
        sum[chain.name] = sum[chain.name] || {};
        if (chain.restake) {
          sum[chain.name][chain.address] = chain.restake;
        }
      }, {});
      return sum;
    }, {});
  }

  return {
    testnet,
    domain,
    rpcUrl,
    restUrl,
    getChains,
    getChainData,
    getTokenData,
    getValidators,
    getOperatorAddresses,
  };
}

export default CosmosDirectory;
