import qs from 'qs';

import { ChainInfo, ChainInfos, SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { ChainValidator } from '../types/validators';
import { fromSmall, getRestUrl } from '../utils';
import { getInjectiveValidatorLogo } from './injective/getInjectiveValidators';

async function fetchAllValidators(baseURL: string, urlPath: string, chain: SupportedChain, paginationKey?: string) {
  const timeout = 15000;
  if (!['initia', 'initiaEvm'].includes(chain)) {
    return await axiosWrapper({
      baseURL,
      method: 'get',
      timeout,
      url: urlPath,
    });
  }

  const params = {
    'pagination.limit': 500,
    'pagination.key': paginationKey,
    status: 'BOND_STATUS_BONDED',
  };
  const query = qs.stringify(params);

  const res = await axiosWrapper({
    baseURL,
    method: 'get',
    timeout,
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
  const queryParams: Record<string, string | number> = {
    'pagination.limit': 1000,
  };

  if (chain === 'nibiru') {
    queryParams['status'] = 'BOND_STATUS_BONDED';
  }

  let queryURL = `/cosmos/staking/v1beta1/validators?${qs.stringify(queryParams)}`;

  if (['initia', 'initiaEvm'].includes(chain)) {
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
    try {
      if (['initia', 'initiaEvm'].includes(chain)) {
        const token = (validator?.delegator_shares as any)?.find(
          (item: { denom: string; amount: string }) => item.denom === 'uinit',
        );
        if (token) {
          validator.tokens = fromSmall(token?.amount ?? '0', decimals ?? 18);
        }
      }
    } catch (error) {
      //
    }
    validator.moniker = validator?.description?.moniker ?? '';
    validator.address = validator?.operator_address;
    validator.active = validator?.status === 'BOND_STATUS_BONDED';
  });
  return result.validators;
}
