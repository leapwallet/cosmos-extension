import { ChainInfo, ChainInfos, SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { ChainValidator } from '../types/validators';
import { fromSmall, getRestUrl } from '../utils';
import { getInjectiveValidatorLogo } from './injective/getInjectiveValidators';

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

  const res = await axiosWrapper({
    baseURL,
    method: 'get',
    url: queryURL,
  });

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
