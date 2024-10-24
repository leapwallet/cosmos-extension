import { Coin } from '@cosmjs/stargate';
import { MsgBeginRedelegate, MsgCancelUnbondingDelegation, MsgDelegate, MsgUndelegate } from 'proto/initia/mstaking/tx';

export function getInitiaDelegateMsg(delegatorAddress: string, validatorAddress: string, amount: Coin) {
  const delegateMsg: {
    typeUrl: string;
    value: MsgDelegate;
  } = {
    typeUrl: '/initia.mstaking.v1.MsgDelegate',
    value: {
      delegatorAddress: delegatorAddress,
      validatorAddress: validatorAddress,
      amount: [amount],
    },
  };
  return delegateMsg;
}

export function getInitiaUndelegateMsg(delegatorAddress: string, validatorAddress: string, amount: Coin) {
  const undelegateMsg: {
    typeUrl: string;
    value: MsgUndelegate;
  } = {
    typeUrl: '/initia.mstaking.v1.MsgUndelegate',
    value: {
      delegatorAddress: delegatorAddress,
      validatorAddress: validatorAddress,
      amount: [amount],
    },
  };
  return undelegateMsg;
}

export function getInitiaCancelUnbondingDelegationMsg(
  delegatorAddress: string,
  validatorAddress: string,
  amount: Coin,
  creationHeight: string,
) {
  const cancelUnbondingDelegationMsg: {
    typeUrl: string;
    value: MsgCancelUnbondingDelegation;
  } = {
    typeUrl: '/initia.mstaking.v1.MsgCancelUnbondingDelegation',
    value: {
      delegatorAddress: delegatorAddress,
      validatorAddress: validatorAddress,
      amount: [amount],
      creationHeight: BigInt(creationHeight),
    },
  };
  return cancelUnbondingDelegationMsg;
}

export function getInitiaRedelegateMsg(
  delegatorAddress: string,
  validatorDstAddress: string,
  validatorSrcAddress: string,
  amount: Coin,
) {
  const redelegateMsg: {
    typeUrl: string;
    value: MsgBeginRedelegate;
  } = {
    typeUrl: '/initia.mstaking.v1.MsgBeginRedelegate',
    value: {
      delegatorAddress: delegatorAddress,
      validatorSrcAddress: validatorSrcAddress,
      validatorDstAddress: validatorDstAddress,
      amount: [amount],
    },
  };
  return redelegateMsg;
}

export function getInitiaClaimAndStakeMsg(
  delegatorAddress: string,
  validatorsWithRewards: { validator: string; amount: Coin }[],
) {
  const claimAndStakeMsgs: {
    typeUrl: string;
    value: { delegatorAddress: string; validatorAddress: string; amount: Coin[] };
  }[] = [];
  validatorsWithRewards.forEach((validatorWithReward) => {
    const claimAndStakeMsg = getInitiaDelegateMsg(
      delegatorAddress,
      validatorWithReward.validator,
      validatorWithReward.amount,
    );
    claimAndStakeMsgs.push(claimAndStakeMsg);
  });
  return claimAndStakeMsgs;
}
