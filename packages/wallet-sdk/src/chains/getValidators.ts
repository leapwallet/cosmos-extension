import axios from 'axios';

import { ChainInfo, ChainInfos, SupportedChain } from '../constants';
import { ChainValidator } from '../types/validators';
import { fromSmall } from '../utils';
import { getInjectiveValidatorLogo } from './injective/getInjectiveValidators';

export const getRestUrl =
  (chainInfos: Record<SupportedChain, ChainInfo>) => (chain: SupportedChain) => (isTestnet: boolean) =>
    !isTestnet ? chainInfos[chain].apis.rest : chainInfos[chain].apis.restTest;

export async function getValidatorsList(
  chain: SupportedChain,
  isTestnet: boolean,
  lcdUrl?: string,
  chainInfos?: Record<SupportedChain, ChainInfo>,
) {
  const url = lcdUrl ?? getRestUrl(chainInfos ?? ChainInfos)(chain)(isTestnet);
  let queryURL = `${url}/cosmos/staking/v1beta1/validators?pagination.limit=500`;
  if (chain === 'nibiru') {
    queryURL = `${queryURL}&status=BOND_STATUS_BONDED`;
  }

  const res = await axios.get(queryURL);

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
