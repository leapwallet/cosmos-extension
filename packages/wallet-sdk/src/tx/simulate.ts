/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Coin, StdFee } from '@cosmjs/stargate';
import { MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx';
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import {
  MsgBeginRedelegate,
  MsgCancelUnbondingDelegation,
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, SignerInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';

import { fetchAccountDetails } from '../accounts';
import { SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { VoteOption as VoteOptionAtomOne } from '../proto/atomone/gov/v1/gov';
import { MsgVote as MsgVoteAtomOne } from '../proto/atomone/gov/v1/tx';
import { MsgVote as MsgVoteGovGen } from '../proto/govgen/gov/v1beta1/tx';
import {
  MsgBeginRedelegate as InitiaMsgBeginRedelegate,
  MsgCancelUnbondingDelegation as InitiaMsgCancelUnbondingDelegation,
  MsgDelegate as InitiaMsgDelegate,
  MsgUndelegate as InitiaMsgUndelegate,
} from '../proto/initia/mstaking/tx';
import {
  buildGrantMsg,
  getCancelUnDelegationMsg,
  getDelegateMsg,
  getIbcTransferMsg,
  getRedelegateMsg,
  getSendTokensMsg,
  getUnDelegateMsg,
  getVoteMsg,
  getWithDrawRewardsMsg,
} from './msgs/cosmos';
import {
  getInitiaCancelUnbondingDelegationMsg,
  getInitiaDelegateMsg,
  getInitiaRedelegateMsg,
  getInitiaUndelegateMsg,
} from './msgs/initia';

export async function simulateSend(
  lcdEndpoint: string,
  fromAddress: string,
  toAddress: string,
  amount: Coin[],
  fee: Coin[],
) {
  const msg = getSendTokensMsg(fromAddress, toAddress, amount);
  const encodedMsg = {
    typeUrl: msg.typeUrl,
    value: MsgSend.encode(msg.value).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateIbcTransfer(
  lcdEndpoint: string,
  fromAddress: string,
  toAddress: string,
  amount: Coin,
  channel: string,
  port: string,
  timeoutTimestamp: number,
  timeoutHeight: Height | undefined,
  fee: Coin[],
) {
  const msg = getIbcTransferMsg(timeoutTimestamp, port, channel, fromAddress, toAddress, amount, timeoutHeight);
  const encodedMsg = {
    typeUrl: msg.typeUrl,
    value: MsgTransfer.encode(msg.value).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateDelegate(
  lcdEndpoint: string,
  fromAddress: string,
  validatorAddress: string,
  amount: Coin,
  fee: Coin[],
  chain?: SupportedChain,
) {
  let msg, encodedMsg;
  if (chain === 'initia') {
    msg = getInitiaDelegateMsg(fromAddress, validatorAddress, amount);
    encodedMsg = {
      typeUrl: msg.typeUrl,
      value: InitiaMsgDelegate.encode(msg.value).finish(),
    };
  } else {
    msg = getDelegateMsg(fromAddress, validatorAddress, amount);
    encodedMsg = {
      typeUrl: msg.typeUrl,
      value: MsgDelegate.encode(msg.value).finish(),
    };
  }
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateUndelegate(
  lcdEndpoint: string,
  fromAddress: string,
  validatorAddress: string,
  amount: Coin,
  fee: Coin[],
  chain?: SupportedChain,
) {
  let msg, encodedMsg;
  if (chain === 'initia') {
    msg = getInitiaUndelegateMsg(fromAddress, validatorAddress, amount);
    encodedMsg = {
      typeUrl: msg.typeUrl,
      value: InitiaMsgUndelegate.encode(msg.value).finish(),
    };
  } else {
    msg = getUnDelegateMsg(fromAddress, validatorAddress, amount);
    encodedMsg = {
      typeUrl: msg.typeUrl,
      value: MsgUndelegate.encode(msg.value).finish(),
    };
  }
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateCancelUndelegation(
  lcdEndpoint: string,
  fromAddress: string,
  validatorAddress: string,
  amount: Coin,
  creationHeight: string,
  fee: Coin[],
  chain?: SupportedChain,
) {
  let msg, encodedMsg;
  if (chain === 'initia') {
    msg = getInitiaCancelUnbondingDelegationMsg(fromAddress, validatorAddress, amount, creationHeight);
    encodedMsg = {
      typeUrl: msg.typeUrl,
      value: InitiaMsgCancelUnbondingDelegation.encode(msg.value).finish(),
    };
  } else {
    msg = getCancelUnDelegationMsg(fromAddress, validatorAddress, amount, creationHeight);
    encodedMsg = {
      typeUrl: msg.typeUrl,
      value: MsgCancelUnbondingDelegation.encode(msg.value).finish(),
    };
  }
  // retryCount=5 to get error on first fail
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee }, '', 5, 'cancel-undelegation');
}

export async function simulateRedelegate(
  lcdEndpoint: string,
  fromAddress: string,
  validatorDstAddress: string,
  validatorSrcAddress: string,
  amount: Coin,
  fee: Coin[],
  chain?: SupportedChain,
) {
  let msg, encodedMsg;
  if (chain === 'initia') {
    msg = getInitiaRedelegateMsg(fromAddress, validatorDstAddress, validatorSrcAddress, amount);
    encodedMsg = {
      typeUrl: msg.typeUrl,
      value: InitiaMsgBeginRedelegate.encode(msg.value).finish(),
    };
  } else {
    msg = getRedelegateMsg(fromAddress, validatorDstAddress, validatorSrcAddress, amount);
    encodedMsg = {
      typeUrl: msg.typeUrl,
      value: MsgBeginRedelegate.encode(msg.value).finish(),
    };
  }
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateGrantRestake(
  lcdEndpoint: string,
  fromAddress: string,
  {
    botAddress,
    validatorAddress,
    expiryDate,
    maxTokens,
  }: {
    botAddress: string;
    validatorAddress: string;
    expiryDate: string;
    maxTokens?: {
      denom?: string | undefined;
      amount?: string | undefined;
    };
  },
) {
  const messages = [
    buildGrantMsg(
      '/cosmos.staking.v1beta1.StakeAuthorization',
      fromAddress,
      botAddress,
      StakeAuthorization.encode(
        StakeAuthorization.fromPartial({
          allowList: { address: [validatorAddress] },
          maxTokens: maxTokens,
          authorizationType: 1,
        }),
      ).finish(),
      expiryDate,
    ),
  ];

  return await simulateTx(lcdEndpoint, fromAddress, messages);
}

export async function simulateRevokeRestake(lcdEndpoint: string, fromAddress: string, grantee: string) {
  const messages = [
    {
      typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
      value: MsgRevoke.encode(
        MsgRevoke.fromPartial({
          grantee: grantee,
          granter: fromAddress,
          msgTypeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        }),
      ).finish(),
    },
  ];

  return await simulateTx(lcdEndpoint, fromAddress, messages);
}

export async function simulateRevokeGrant(
  msgType: string,
  lcdEndpoint: string,
  fromAddress: string,
  grantee: string,
  fee: Coin[],
) {
  const messages = [
    {
      typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
      value: MsgRevoke.encode(
        MsgRevoke.fromPartial({
          grantee: grantee,
          granter: fromAddress,
          msgTypeUrl: msgType,
        }),
      ).finish(),
    },
  ];

  return await simulateTx(lcdEndpoint, fromAddress, messages, { amount: fee });
}

export async function simulateWithdrawRewards(
  lcdEndpoint: string,
  fromAddress: string,
  validatorAddresses: string[],
  fee: Coin[],
) {
  const msgs = getWithDrawRewardsMsg(validatorAddresses, fromAddress);
  const encodedMsgs = msgs.map((msg) => {
    return {
      typeUrl: msg.typeUrl,
      value: MsgUndelegate.encode(msg.value).finish(),
    };
  });
  return await simulateTx(lcdEndpoint, fromAddress, encodedMsgs, { amount: fee });
}

export async function simulateVote(
  lcdEndpoint: string,
  fromAddress: string,
  proposalId: string,
  option: VoteOption,
  fee: Coin[],
  chainId?: string,
) {
  let nonStandardTypeUrl = undefined;
  if (chainId === 'govgen-1') {
    nonStandardTypeUrl = '/govgen.gov.v1beta1.MsgVote';
  } else if (chainId === 'atomone-1') {
    nonStandardTypeUrl = '/atomone.gov.v1.MsgVote';
  }
  const msg = getVoteMsg(option, proposalId, fromAddress, nonStandardTypeUrl);
  let value = MsgVote.encode(msg.value).finish();
  if (chainId === 'govgen-1') {
    value = MsgVoteGovGen.encode(msg.value).finish();
  } else if (chainId === 'atomone-1') {
    value = MsgVoteAtomOne.encode({
      ...msg.value,
      option: msg.value.option as VoteOptionAtomOne,
      metadata: '',
    }).finish();
  }
  const encodedMsg = {
    typeUrl: msg.typeUrl,
    value,
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateClaimAndStake(
  lcdEndpoint: string,
  fromAddress: string,
  validatorsWithRewards: { validator: string; amount: Coin }[],
  fee: Coin[],
  chain?: SupportedChain,
) {
  const encodedClaimAndStakeMsgs: {
    typeUrl: string;
    value: Uint8Array;
  }[] = [];
  validatorsWithRewards.map((validatorWithReward) => {
    switch (chain) {
      case 'initia': {
        const msg = getInitiaDelegateMsg(fromAddress, validatorWithReward.validator, validatorWithReward.amount);
        const delegateMsg = {
          typeUrl: msg.typeUrl,
          value: InitiaMsgDelegate.encode(msg.value).finish(),
        };
        encodedClaimAndStakeMsgs.push(delegateMsg);
        break;
      }
      default: {
        const msg = getDelegateMsg(fromAddress, validatorWithReward.validator, validatorWithReward.amount);
        const delegateMsg = {
          typeUrl: msg.typeUrl,
          value: MsgDelegate.encode(msg.value).finish(),
        };
        encodedClaimAndStakeMsgs.push(delegateMsg);
      }
    }
  });
  return await simulateTx(lcdEndpoint, fromAddress, encodedClaimAndStakeMsgs, { amount: fee });
}

export async function simulateTx(
  lcd: string,
  signerAddress: string,
  msgs: any[],
  fee: Omit<StdFee, 'gas'> = { amount: [] },
  memo = '',
  retryCount?: number,
  callFor?: string,
) {
  const account = await fetchAccountDetails(lcd, signerAddress);

  const unsignedTx = TxRaw.encode({
    bodyBytes: TxBody.encode(
      TxBody.fromPartial({
        messages: msgs,
        memo: memo,
      }),
    ).finish(),
    authInfoBytes: AuthInfo.encode({
      signerInfos: [
        SignerInfo.fromPartial({
          // Pub key is ignored.
          // It is fine to ignore the pub key when simulating tx.
          // However, the estimated gas would be slightly smaller because tx size doesn't include pub key.
          modeInfo: {
            single: {
              mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
            },
            multi: undefined,
          },
          sequence: `${account.sequence}`,
        }),
      ],
      fee: Fee.fromPartial({
        amount: fee.amount.map((amount) => {
          return { amount: amount.amount, denom: amount.denom };
        }),
      }),
    }).finish(),
    signatures: [new Uint8Array(64)],
  }).finish();

  const result = await axiosWrapper(
    {
      baseURL: lcd,
      method: 'post',
      url: '/cosmos/tx/v1beta1/simulate',
      timeout: 20_000,
      data: {
        tx_bytes: Buffer.from(unsignedTx).toString('base64'),
      },
    },
    retryCount,
    callFor,
  );

  if (
    result &&
    // @ts-ignore
    (result.code === 'ERR_BAD_RESPONSE' || result.code === 'ERR_BAD_REQUEST') &&
    // @ts-ignore
    result.response &&
    // @ts-ignore
    result.response.data
  ) {
    // @ts-ignore
    throw new Error(result.response.data.message);
  }

  if (result.data?.error) {
    throw new Error(result.data?.error);
  }

  const gasUsed = parseInt(result.data?.gas_info?.gas_used);
  const gasWanted = parseInt(result.data?.gas_info?.gas_wanted);
  if (Number.isNaN(gasUsed)) {
    throw new Error(`Invalid integer gas: ${result.data?.gas_info?.gas_used}`);
  }
  return {
    gasUsed,
    gasWanted,
  };
}
