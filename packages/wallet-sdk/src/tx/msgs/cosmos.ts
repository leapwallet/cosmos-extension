import { Coin } from '@cosmjs/stargate';
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { MsgBeginRedelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import dayjs from 'dayjs';
import Long from 'long';

export function getIbcTransferMsg(
  timeoutTimestamp: number,
  sourcePort: string,
  sourceChannel: string,
  fromAddress: string,
  toAddress: string,
  transferAmount: Coin,
  timeoutHeight: Height | undefined,
  memo = '',
) {
  const timeoutTimestampNanoseconds = timeoutTimestamp
    ? Long.fromNumber(timeoutTimestamp).multiply(1_000_000_000)
    : Long.fromNumber(0);
  const transferMsg = {
    typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
    value: {
      sourcePort: sourcePort,
      sourceChannel: sourceChannel,
      sender: fromAddress,
      receiver: toAddress,
      token: transferAmount,
      timeoutHeight: timeoutHeight,
      timeoutTimestamp: timeoutTimestampNanoseconds,
      memo,
    },
  };
  return transferMsg;
}

export function getSendTokensMsg(fromAddress: string, toAddress: string, amount: Coin[]) {
  const sendMsg = {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: {
      fromAddress: fromAddress,
      toAddress: toAddress,
      amount: [...amount],
    },
  };
  return sendMsg;
}

export function getVoteMsg(option: VoteOption, proposalId: string, fromAddress: string) {
  const voteMsg = {
    typeUrl: '/cosmos.gov.v1beta1.MsgVote',
    value: {
      option: option,
      proposalId: Long.fromString(proposalId),
      voter: fromAddress,
    },
  };
  return voteMsg;
}

export function getDelegateMsg(delegatorAddress: string, validatorAddress: string, amount: Coin) {
  const delegateMsg = {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    value: {
      delegatorAddress: delegatorAddress,
      validatorAddress: validatorAddress,
      amount: amount,
    },
  };
  return delegateMsg;
}

export function getUnDelegateMsg(delegatorAddress: string, validatorAddress: string, amount: Coin) {
  const undelegateMsg = {
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
    value: {
      delegatorAddress: delegatorAddress,
      validatorAddress: validatorAddress,
      amount: amount,
    },
  };
  return undelegateMsg;
}

export function getCancelUnDelegationMsg(
  delegatorAddress: string,
  validatorAddress: string,
  amount: Coin,
  creationHeight: string,
) {
  const cancelUndelegationMsg = {
    typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
    value: {
      amount: amount,
      creationHeight: Long.fromString(creationHeight),
      delegatorAddress: delegatorAddress,
      validatorAddress: validatorAddress,
    },
  };
  return cancelUndelegationMsg;
}

export function getAminoCancelUnDelegationMsg(
  delegatorAddress: string,
  validatorAddress: string,
  amount: Coin,
  creationHeight: string,
) {
  const cancelUndelegationMsg = {
    typeUrl: 'cosmos-sdk/MsgCancelUnbondingDelegation',
    value: {
      amount: amount,
      creation_height: creationHeight,
      delegator_address: delegatorAddress,
      validator_address: validatorAddress,
    },
  };
  return cancelUndelegationMsg;
}

export function getRedelegateMsg(
  delegatorAddress: string,
  validatorDstAddress: string,
  validatorSrcAddress: string,
  amount: Coin,
) {
  const msg = {
    typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
    value: {
      delegatorAddress: delegatorAddress,
      validatorSrcAddress: validatorSrcAddress,
      validatorDstAddress: validatorDstAddress,
      amount: amount,
    } as MsgBeginRedelegate,
  };
  return msg;
}

export function getWithDrawRewardsMsg(validatorAddresses: string[], delegatorAddress: string) {
  const msg = validatorAddresses.map((validatorAddress) => {
    return {
      typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
      value: {
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
      },
    };
  });
  return msg;
}

export function buildGrantMsg(type: string, granter: string, grantee: string, authValue: any, expiryDate: any) {
  const value = {
    granter: granter,
    grantee: grantee,
    grant: {
      authorization: {
        typeUrl: type,
        value: authValue,
      },
      expiration: {
        seconds: dayjs(expiryDate).unix(),
        nanos: 0,
      },
    },
  };

  return {
    typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
    value: MsgGrant.encode(MsgGrant.fromPartial(value)).finish(),
  };
}

export function buildRevokeMsg(type: string, granter: string, grantee: string) {
  const value = {
    grantee: grantee,
    granter: granter,
    msgTypeUrl: type,
  };

  return {
    typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
    value: MsgRevoke.encode(MsgRevoke.fromPartial(value)).finish(),
  };
}
