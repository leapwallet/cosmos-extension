export enum AuthorizationType {
  AUTHORIZATION_TYPE_REDELEGATE = 'AUTHORIZATION_TYPE_REDELEGATE',
  AUTHORIZATION_TYPE_DELEGATE = 'AUTHORIZATION_TYPE_DELEGATE',
  AUTHORIZATION_TYPE_UNDELEGATE = 'AUTHORIZATION_TYPE_UNDELEGATE',
}

export type Grant = {
  granter: string;
  expiration?: string;
  authorization: {
    '@type': string;
    msg?: string;
    spend_limit?: string;
    authorization_type?: AuthorizationType;
    allow_list?: { address: string[] };
    deny_list?: { address: string[] };
    max_tokens?: { denom: string; amount: string } | null;
  };
  grantee: string;
};

export const SendAuthzMessageType = '/cosmos.bank.v1beta1.SendAuthorization';
export const GenericAuthzMessageType = '/cosmos.authz.v1beta1.GenericAuthorization';
export const StakeAuthzMessageType = '/cosmos.staking.v1beta1.StakeAuthorization';

export const MsgWithdrawDelegatorRewardType = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward';
export const MsgDepositType = '/cosmos.gov.v1beta1.MsgDeposit';
export const MsgVoteType = '/cosmos.gov.v1beta1.MsgVote';

export const MsgSendType = '/cosmos.bank.v1beta1.MsgSend';

export const MsgDelegateType = '/cosmos.staking.v1beta1.MsgDelegate';
export const MsgBeginRedelegateType = '/cosmos.staking.v1beta1.MsgBeginRedelegate';
export const MsgUndelegateType = '/cosmos.staking.v1beta1.MsgUndelegate';

export enum TypeOfAuthzGrant {
  Send = 'Send',
  Vote = 'Vote',
  Deposit = 'Deposit',
  WithdrawReward = 'Withdraw Reward',
  Custom = 'Custom',
  Delegate = 'Delegate',
  Redelegate = 'Redelegate',
  Undelegate = 'Undelegate',
}

export const AuthZtypeToMsgTypeMap = {
  [TypeOfAuthzGrant.Send]: MsgSendType,
  [TypeOfAuthzGrant.Vote]: MsgVoteType,
  [TypeOfAuthzGrant.Deposit]: MsgDepositType,
  [TypeOfAuthzGrant.WithdrawReward]: MsgWithdrawDelegatorRewardType,
  [TypeOfAuthzGrant.Delegate]: MsgDelegateType,
  [TypeOfAuthzGrant.Redelegate]: MsgBeginRedelegateType,
  [TypeOfAuthzGrant.Undelegate]: MsgUndelegateType,
};

export function typeOfAuthzGrant(grant: Grant) {
  if (grant.authorization['@type'] === GenericAuthzMessageType) {
    switch (grant.authorization.msg) {
      case MsgVoteType:
        return TypeOfAuthzGrant.Vote;

      case MsgDepositType:
        return TypeOfAuthzGrant.Deposit;

      case MsgWithdrawDelegatorRewardType:
        return TypeOfAuthzGrant.WithdrawReward;

      case MsgSendType:
        return TypeOfAuthzGrant.Send;

      case MsgDelegateType:
        return TypeOfAuthzGrant.Delegate;

      case MsgUndelegateType:
        return TypeOfAuthzGrant.Undelegate;

      case MsgBeginRedelegateType:
        return TypeOfAuthzGrant.Redelegate;
    }
  }

  if (grant.authorization['@type'] === SendAuthzMessageType) {
    return TypeOfAuthzGrant.Send;
  }

  if (grant.authorization['@type'] === StakeAuthzMessageType) {
    switch (grant.authorization.authorization_type) {
      case AuthorizationType.AUTHORIZATION_TYPE_DELEGATE:
        return TypeOfAuthzGrant.Delegate;

      case AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE:
        return TypeOfAuthzGrant.Undelegate;

      case AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE:
        return TypeOfAuthzGrant.Redelegate;
    }
  }

  return TypeOfAuthzGrant.Custom;
}
