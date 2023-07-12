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
  apyEnabled: boolean;
  chainApr: number;
  chainApy: number;
  validatorApys: Record<string, number>;
  minMaxApy: number[];

  constructor(chainData: NetworkChainData, validators: Validator[]) {
    this.chain = chainData;
    this.validators = validators;
    this.chainApr = this.chain.params?.calculated_apr ?? this.chain.params?.estimated_apr ?? 0;
    this.chainApy = this.calculateApyFromApr(this.chainApr, 1);
    this.apyEnabled = !chainData?.params?.estimated_apr || chainData?.params?.estimated_apr > 0;
    this.validatorApys = this.getApy(this.validators);
    this.apyEnabled = this.chainApr > 0;
    this.minMaxApy = Object.values(this.validatorApys ?? {})
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
      .reduce((a, v) => ({ ...a, [v.operator_address]: v }), {});
  }

  /**
   *
   * @param validators
   * @param operators
   * @returns
   */
  getApy(validators: Validator[]) {
    const chainApr = this.chainApr;
    const validatorApy: Record<string, number> = {};

    for (const [, validator] of Object.entries(validators)) {
      if (validator.jailed || validator.status !== 'BOND_STATUS_BONDED') {
        validatorApy[validator.address] = 0;
      } else {
        const commission = validator?.commission?.commission_rates.rate ?? 0;
        const periodPerYear = 1;
        const realApr = chainApr * (1 - +commission);
        validatorApy[validator.address] = (1 + realApr / periodPerYear) ** periodPerYear - 1;
      }
    }
    return validatorApy;
  }

  /**
   *
   * @param apr
   * @param N
   * @returns
   */
  calculateApyFromApr(apr: number, N: number) {
    return (1 + apr / N) ** N - 1;
  }
}

export default Network;
