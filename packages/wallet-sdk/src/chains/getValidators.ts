import qs from 'qs';

import { ChainInfo, ChainInfos, SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { ChainValidator } from '../types/validators';
import { fromSmall, getRestUrl } from '../utils';
import { getInjectiveValidatorLogo } from './injective/getInjectiveValidators';

async function fetchAllValidators(baseURL: string, urlPath: string, chain: SupportedChain, paginationKey?: string) {
  if (chain !== 'initia') {
    return await axiosWrapper({
      baseURL,
      method: 'get',
      url: urlPath,
    });
  }

  const params = {
    'pagination.limit': 500,
    'pagination.key': paginationKey,
  };
  const query = qs.stringify(params);

  const res = await axiosWrapper({
    baseURL,
    method: 'get',
    url: `${urlPath}?${query}`,
  });

  if (res.data?.pagination?.next_key) {
    const nextRes = await fetchAllValidators(baseURL, urlPath, chain, res.data.pagination.next_key);
    res.data.validators = res.data.validators.concat(nextRes.data.validators);
  }

  return res;
}

export async function getValidatorsList(
  chain: SupportedChain,
  isTestnet: boolean,
  lcdUrl?: string,
  chainInfos?: Record<SupportedChain, ChainInfo>,
) {
  const baseURL = lcdUrl ?? getRestUrl(chainInfos ?? ChainInfos, chain, isTestnet);
  let queryURL = `/cosmos/staking/v1beta1/validators?pagination.limit=500`;

  if (chain === 'nibiru') {
    queryURL = `${queryURL}&status=BOND_STATUS_BONDED`;
  }

  if (chain === 'initia') {
    queryURL = `initia/mstaking/v1/validators`;
  }

  const res = await fetchAllValidators(baseURL, queryURL, chain);
  const decimals = Object.values((chainInfos ?? ChainInfos)[chain].nativeDenoms)[0].coinDecimals;

  const result = new ChainValidator(res?.data);
  result?.validators.forEach((validator) => {
    if (chain === 'injective') {
      validator.image = getInjectiveValidatorLogo(validator.operator_address);
    } else {
      validator.image = '';
    }
    validator.tokens = fromSmall(validator?.tokens ?? '0', decimals ?? 18);
    validator.moniker = validator?.description?.moniker ?? '';
    validator.address = validator?.operator_address;
  });
  return result.validators;
}
