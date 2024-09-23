import { AminoMsg } from '@cosmjs/amino';
import { EncodeObject } from '@cosmjs/proto-signing';

import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgExecuteContract,
  MsgExecuteContractCompat,
  MsgGrant,
  MsgRevoke,
  MsgSend,
  MsgTransfer,
  MsgUndelegate,
  MsgVote,
  MsgWithdrawDelegatorReward,
} from '../../proto/injective/core/modules';

export enum MsgTypes {
  GRANT = '/cosmos.authz.v1beta1.MsgGrant',
  REVOKE = '/cosmos.authz.v1beta1.MsgRevoke',
  SEND = '/cosmos.bank.v1beta1.MsgSend',
  IBCTRANSFER = '/ibc.applications.transfer.v1.MsgTransfer',
  GOV = '/cosmos.gov.v1beta1.MsgVote',
  DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate',
  UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate',
  REDELEGATE = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  WITHDRAW_REWARD = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  MSG_EXECUTE_CONTRACT = '/cosmwasm.wasm.v1.MsgExecuteContract',
}

export enum MsgTypesAmino {
  GRANT = 'cosmos-sdk/MsgGrant',
  REVOKE = 'cosmos-sdk/MsgRevoke',
  SEND = 'cosmos-sdk/MsgSend',
  IBCTRANSFER = 'cosmos-sdk/MsgTransfer',
  GOV = 'cosmos-sdk/MsgVote',
  DELEGATE = 'cosmos-sdk/MsgDelegate',
  UNDELEGATE = 'cosmos-sdk/MsgUndelegate',
  REDELEGATE = 'cosmos-sdk/MsgBeginRedelegate',
  WITHDRAW_REWARD = 'cosmos-sdk/MsgWithdrawDelegationReward',
  MSG_EXECUTE_CONTRACT = 'wasm/MsgExecuteContract',
  MSG_EXECUTE_CONTRACT_COMPAT = 'wasmx/MsgExecuteContractCompat',
}

export const formatIbcMessage = (msg: EncodeObject | AminoMsg) => {
  return {
    ...msg.value,
    timeout: '8446744073709551615',
    height: {
      revisionHeight: parseInt(msg.value.height.revisionHeight),
      revisionNumber: parseInt(msg.value.height.revisionNumber),
    },
  };
};

export const convertFundToObject = (inputString: string) => {
  // Find the index where the number ends and the string begins
  const splitIndex = inputString.search(/[^0-9]/);

  if (splitIndex === -1) {
    throw new Error('Invalid input: string must contain both a number and non-numeric characters');
  }

  const amount = inputString.slice(0, splitIndex);
  const denom = inputString.slice(splitIndex);

  return {
    amount: parseInt(amount),
    denom: denom,
  };
};

export function getInjAminoMessage(msgs: EncodeObject[]) {
  const messages = msgs.map((msg) => {
    switch (msg.typeUrl) {
      case MsgTypes.IBCTRANSFER:
        return MsgTransfer.fromJSON(formatIbcMessage(msg));
      case MsgTypes.MSG_EXECUTE_CONTRACT:
        return MsgExecuteContractCompat.fromJSON(msg.value);
      case MsgTypes.GOV:
        return MsgVote.fromJSON({ ...msg.value, proposalId: msg.value.proposalId.toInt() });
      case MsgTypes.DELEGATE:
        return MsgDelegate.fromJSON(msg.value);
      case MsgTypes.UNDELEGATE:
        return MsgUndelegate.fromJSON(msg.value);
      case MsgTypes.REDELEGATE:
        return MsgBeginRedelegate.fromJSON(msg.value);
      case MsgTypes.WITHDRAW_REWARD:
        return MsgWithdrawDelegatorReward.fromJSON(msg.value);
      case MsgTypes.GRANT:
        return MsgGrant.fromJSON(msg.value);
      case MsgTypes.REVOKE:
        return MsgRevoke.fromJSON(msg.value);
      default:
        return MsgSend.fromJSON(msg.value);
    }
  });
  return messages;
}

// this is used to create messages for generating transaction hash for dapp messages.
export function getMsgFromAmino(msgs: AminoMsg[]) {
  const messages = msgs.map((msg) => {
    switch (msg.type) {
      case MsgTypesAmino.IBCTRANSFER:
        return MsgTransfer.fromJSON({
          ...msg.value,
          amount: msg.value.token,
          port: msg.value.source_port,
          channelId: msg.value.source_channel,
          timeout: parseInt(msg.value.timeout_timestamp),
          height: {
            revisionHeight: parseInt(msg.value.timeout_height.revision_height),
            revisionNumber: parseInt(msg.value.timeout_height.revision_number),
          },
        });
      case MsgTypesAmino.MSG_EXECUTE_CONTRACT_COMPAT:
        return MsgExecuteContractCompat.fromJSON({
          ...msg.value,
          contractAddress: msg.value.contract,
          msg: JSON.parse(msg.value.msg),
          funds: [convertFundToObject(msg.value.funds)],
        });
      case MsgTypesAmino.MSG_EXECUTE_CONTRACT:
        return MsgExecuteContract.fromJSON({ ...msg.value, contractAddress: msg.value.contract });
      case MsgTypesAmino.GOV:
        return MsgVote.fromJSON({ ...msg.value, proposalId: msg.value.proposalId.toInt() });
      case MsgTypesAmino.DELEGATE:
        return MsgDelegate.fromJSON({
          ...msg.value,
          injectiveAddress: msg.value.delegator_address,
          validatorAddress: msg.value.validator_address,
        });
      case MsgTypesAmino.UNDELEGATE:
        return MsgUndelegate.fromJSON({
          ...msg.value,
          injectiveAddress: msg.value.delegator_address,
          validatorAddress: msg.value.validator_address,
        });
      case MsgTypesAmino.REDELEGATE:
        return MsgBeginRedelegate.fromJSON({
          ...msg.value,
          injectiveAddress: msg.value.delegator_address,
          srcValidatorAddress: msg.value.validator_src_address,
          dstValidatorAddress: msg.value.validator_dst_address,
        });
      case MsgTypesAmino.WITHDRAW_REWARD:
        return MsgWithdrawDelegatorReward.fromJSON({
          ...msg.value,
          validatorAddress: msg.value.validator_address,
          delegatorAddress: msg.value.delegator_address,
        });
      case MsgTypesAmino.GRANT:
        return MsgGrant.fromJSON(msg.value);
      case MsgTypesAmino.REVOKE:
        return MsgRevoke.fromJSON(msg.value);
      default:
        return MsgSend.fromJSON({
          ...msg.value,
          srcInjectiveAddress: msg.value.from_address,
          dstInjectiveAddress: msg.value.to_address,
        });
    }
  });
  return messages;
}
