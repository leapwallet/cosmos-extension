import axios from 'axios';

import { ChainInfos } from '../../constants';
import { ChainValidator } from '../../types/validators';
import { fromSmall } from '../../utils';

const VALIDATOR_LOGO_BASEURL = 'https://hub.injective.network/validators-logo';

export async function getInjectiveValidators(isTestnet: boolean) {
  const url = !isTestnet ? ChainInfos.injective.apis.rest : ChainInfos.injective.apis.restTest;
  const res = await axios.get(`${url}/cosmos/staking/v1beta1/validators`);

  const result = new ChainValidator(res.data);
  result.validators.forEach((validator) => {
    validator.tokens = fromSmall(validator?.tokens ?? '0', 18);
    validator.moniker = validator?.description?.moniker ?? '';
    validator.address = validator.operator_address;
    validator.image = `${VALIDATOR_LOGO_BASEURL}/${validator.operator_address}.png`;
  });
  return result.validators;
}

export function getInjectiveValidatorLogo(validatorAddress: string) {
  return `${VALIDATOR_LOGO_BASEURL}/${validatorAddress}.png`;
}
