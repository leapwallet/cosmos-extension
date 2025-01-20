import { AllParams } from '../types';
import { NetworkData, Validator } from '../types/validators';

export interface NetworkChainData {
  params?: AllParams;
  path?: string;
}
export class Network {
  chain: NetworkChainData;
  validators: Validator[];
  networkData?: NetworkData;
  aprEnabled: boolean;
  chainApr: number;
  validatorAprs: Record<string, number>;
  minMaxApr: number[];

  constructor(chainData: NetworkChainData, validators: Validator[]) {
    this.chain = chainData;
    this.validators = validators;
    this.chainApr = this.chain.params?.calculated_apr ?? this.chain.params?.estimated_apr ?? 0;
    this.aprEnabled = !chainData?.params?.estimated_apr || chainData?.params?.estimated_apr > 0;
    this.validatorAprs = this.getApr(this.validators);
    this.aprEnabled = this.chainApr > 0;
    this.minMaxApr = Object.values(this.validatorAprs ?? {})
      .filter((v) => v !== 0)
      .reduce((acc: number[], val) => {
        acc[0] = acc[0] === undefined || val < acc[0] ? val : acc[0];
        acc[1] = acc[1] === undefined || val > acc[1] ? val : acc[1];
        return acc;
      }, []);
  }

  /**
   * @description Returns list map of validator_address : Validator
   * @param opts validator.status === opts.status
   * @returns Record<string, Validator>
   */
  getValidators(opts?: any): Record<string, Validator> {
    opts = opts || {};
    return (this.validators || [])
      .filter((validator) => {
        if (opts.status) return validator.status === opts.status;
        return validator;
      })
      .reduce((a, v) => {
        return Object.assign(a, { [v.operator_address]: v });
      }, {});
  }

  /**
   *
   * @param validators
   * @param operators
   * @returns
   */
  getApr(validators: Validator[]) {
    const chainApr = this.chainApr;
    const validatorApr: Record<string, number> = {};

    for (const [, validator] of Object.entries(validators)) {
      if (validator.jailed || validator.status !== 'BOND_STATUS_BONDED') {
        validatorApr[validator.address] = 0;
      } else {
        const commission = validator?.commission?.commission_rates.rate ?? 0;
        const realApr = chainApr * (1 - +commission);
        validatorApr[validator.address] = realApr;
      }
    }
    return validatorApr;
  }
}
