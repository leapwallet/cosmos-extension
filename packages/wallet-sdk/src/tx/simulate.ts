/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Coin, StdFee } from '@cosmjs/stargate';
import { MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx';
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, SignerInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';

import { fetchAccountDetails } from '../accounts';
import { axiosWrapper } from '../healthy-nodes';
import {
  buildGrantMsg,
  getDelegateMsg,
  getIbcTransferMsg,
  getRedelegateMsg,
  getSendTokensMsg,
  getUnDelegateMsg,
  getVoteMsg,
  getWithDrawRewardsMsg,
} from './msgs/cosmos';

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
) {
  const msg = getDelegateMsg(fromAddress, validatorAddress, amount);
  const encodedMsg = {
    typeUrl: msg.typeUrl,
    value: MsgDelegate.encode(msg.value).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateUndelegate(
  lcdEndpoint: string,
  fromAddress: string,
  validatorAddress: string,
  amount: Coin,
  fee: Coin[],
) {
  const msg = getUnDelegateMsg(fromAddress, validatorAddress, amount);
  const encodedMsg = {
    typeUrl: msg.typeUrl,
    value: MsgUndelegate.encode(msg.value).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateRedelegate(
  lcdEndpoint: string,
  fromAddress: string,
  validatorDstAddress: string,
  validatorSrcAddress: string,
  amount: Coin,
  fee: Coin[],
) {
  const msg = getRedelegateMsg(fromAddress, validatorDstAddress, validatorSrcAddress, amount);
  const encodedMsg = {
    typeUrl: msg.typeUrl,
    value: MsgBeginRedelegate.encode(msg.value).finish(),
  };
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
) {
  const msg = getVoteMsg(option, proposalId, fromAddress);
  const encodedMsg = {
    typeUrl: msg.typeUrl,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    value: MsgVote.encode(msg.value).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg], { amount: fee });
}

export async function simulateTx(
  lcd: string,
  signerAddress: string,
  msgs: any[],
  fee: Omit<StdFee, 'gas'> = { amount: [] },
  memo = '',
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

  const result = await axiosWrapper({
    baseURL: lcd,
    method: 'post',
    url: '/cosmos/tx/v1beta1/simulate',
    timeout: 20_000,
    data: {
      tx_bytes: Buffer.from(unsignedTx).toString('base64'),
    },
  });

  // @ts-ignore
  if (result && result.code === 'ERR_BAD_RESPONSE' && result.response && result.response.data) {
    // @ts-ignore
    throw new Error(result.response.data.message);
  }

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  const gasUsed = parseInt(result.data.gas_info.gas_used);
  const gasWanted = parseInt(result.data.gas_info.gas_wanted);
  if (Number.isNaN(gasUsed)) {
    throw new Error(`Invalid integer gas: ${result.data.gas_info.gas_used}`);
  }
  return {
    gasUsed,
    gasWanted,
  };
}
