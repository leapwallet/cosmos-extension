export type Amount = {
  denom: string;
  amount: string;
  formatted_amount?: string;
  currenyAmount?: string;
  tokenInfo?: any;
  denomFiatValue?: string;
};

export type Reward = {
  validator_address: string;
  reward: Amount[];
};

export type RewardsResponse = {
  rewards: Reward[];
  total: Amount[];
};

export type Delegation = {
  delegation: {
    delegator_address: string;
    validator_address: string;
    shares: string;
  };
  balance: Amount;
};

export type DelegationResponse = {
  delegation_responses: Delegation[];
  pagination: {
    next_key: any;
    total: string;
  };
};

export type UnbondingDelegationEntry = {
  creation_height: string; // '11267187';
  completion_time: string; // '2022-07-22T07:31:15.210252326Z';
  initial_balance: string; // '100000';
  balance: string; // '100000';
  currencyBalance?: string; // To be processed
  formattedBalance?: string; // To be processed
};

export type UnbondingDelegation = {
  delegator_address: string; // 'cosmos1yjy5vj2wwc54y79jkfhyx2ze20ahu7544ghxuh';
  validator_address: string; // 'cosmosvaloper1s5jrzpfjc3xe2f2rd0dmkf0clatq785yv9txul';
  entries: UnbondingDelegationEntry[];
};

export type UnbondingDelegationResponse = {
  unbonding_responses: UnbondingDelegation[];
  pagination: {
    next_key: null;
    total: '1';
  };
};
