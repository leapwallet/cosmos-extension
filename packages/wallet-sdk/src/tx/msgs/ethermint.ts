/* eslint-disable @typescript-eslint/no-unused-vars */
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx';
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import {
  MsgBeginRedelegate,
  MsgCancelUnbondingDelegation,
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, SignDoc, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { keccak256 } from 'ethereumjs-util';
import Long from 'long';

export const MSG_SEND_TYPES = {
  MsgValue: [
    { name: 'from_address', type: 'string' },
    { name: 'to_address', type: 'string' },
    { name: 'amount', type: 'TypeAmount[]' },
  ],
  TypeAmount: [
    { name: 'denom', type: 'string' },
    { name: 'amount', type: 'string' },
  ],
};

export const MSG_VOTE_TYPES = {
  MsgValue: [
    { name: 'proposal_id', type: 'uint64' },
    { name: 'voter', type: 'string' },
    { name: 'option', type: 'int32' },
  ],
};

export const MSG_DELEGATE_TYPES = {
  MsgValue: [
    { name: 'delegator_address', type: 'string' },
    { name: 'validator_address', type: 'string' },
    { name: 'amount', type: 'TypeAmount' },
  ],
  TypeAmount: [
    { name: 'denom', type: 'string' },
    { name: 'amount', type: 'string' },
  ],
};

export const MSG_GENERIC_AUTHORIZATION_TYPES = {
  MsgValue: [
    { name: 'granter', type: 'string' },
    { name: 'grantee', type: 'string' },
    { name: 'grant', type: 'TypeGrant' },
  ],
  TypeGrant: [
    { name: 'authorization', type: 'TypeGrantAuthorization' },
    { name: 'expiration', type: 'string' },
  ],
  TypeGrantAuthorization: [
    { name: 'type', type: 'string' },
    { name: 'value', type: 'TypeGrantAuthorizationValue' },
  ],
  TypeGrantAuthorizationValue: [{ name: 'msg', type: 'string' }],
};

export const MSG_REVOKE_GENERIC_AUTHORIZATION_TYPES = {
  MsgValue: [
    { name: 'granter', type: 'string' },
    { name: 'grantee', type: 'string' },
    { name: 'msg_type_url', type: 'string' },
  ],
};

export const MSG_UNDELEGATE_TYPES = {
  MsgValue: [
    { name: 'delegator_address', type: 'string' },
    { name: 'validator_address', type: 'string' },
    { name: 'amount', type: 'TypeAmount' },
  ],
  TypeAmount: [
    { name: 'denom', type: 'string' },
    { name: 'amount', type: 'string' },
  ],
};

export const MSG_CANCEL_UNBONDING_DELEGATION_TYPES = {
  MsgValue: [
    { name: 'delegator_address', type: 'string' },
    { name: 'validator_address', type: 'string' },
    { name: 'amount', type: 'TypeAmount' },
    { name: 'creation_height', type: 'string' },
  ],
  TypeAmount: [
    { name: 'denom', type: 'string' },
    { name: 'amount', type: 'string' },
  ],
};

export const MSG_WITHDRAW_DELEGATOR_REWARD_TYPES = {
  MsgValue: [
    { name: 'delegator_address', type: 'string' },
    { name: 'validator_address', type: 'string' },
  ],
};

export const MSG_BEGIN_REDELEGATE_TYPES = {
  MsgValue: [
    { name: 'delegator_address', type: 'string' },
    { name: 'validator_src_address', type: 'string' },
    { name: 'validator_dst_address', type: 'string' },
    { name: 'amount', type: 'TypeAmount' },
  ],
  TypeAmount: [
    { name: 'denom', type: 'string' },
    { name: 'amount', type: 'string' },
  ],
};

export const MSG_DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate';

export enum RevokeMessages {
  REVOKE_MSG_DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate',
  REVOKE_MSG_WITHDRAW_DELEGATOR_REWARDS = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
}

export enum AuthorizationType {
  AUTHORIZATION_TYPE_UNSPECIFIED = 0,
  AUTHORIZATION_TYPE_DELEGATE = 1,
  AUTHORIZATION_TYPE_UNDELEGATE = 2,
  AUTHORIZATION_TYPE_REDELEGATE = 3,
}

interface Chain {
  chainId: number;
  cosmosChainId: string;
}

interface Sender {
  accountAddress: string;
  sequence: number;
  accountNumber: number;
  pubkey: string;
}

export function generateIbcMsgTransferTypes(msg: { memo?: string }) {
  const types = {
    MsgValue: [
      { name: 'source_port', type: 'string' },
      { name: 'source_channel', type: 'string' },
      { name: 'token', type: 'TypeToken' },
      { name: 'sender', type: 'string' },
      { name: 'receiver', type: 'string' },
      { name: 'timeout_height', type: 'TypeTimeoutHeight' },
      { name: 'timeout_timestamp', type: 'uint64' },
    ],
    TypeToken: [
      { name: 'denom', type: 'string' },
      { name: 'amount', type: 'string' },
    ],
    TypeTimeoutHeight: [
      { name: 'revision_number', type: 'uint64' },
      { name: 'revision_height', type: 'uint64' },
    ],
  };
  if (msg.memo) {
    types.MsgValue.push({ name: 'memo', type: 'string' });
  }
  return types;
}

export function generateTypes(msgValues: object) {
  const types = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'string' },
      { name: 'salt', type: 'string' },
    ],
    Tx: [
      { name: 'account_number', type: 'string' },
      { name: 'chain_id', type: 'string' },
      { name: 'fee', type: 'Fee' },
      { name: 'memo', type: 'string' },
      { name: 'msgs', type: 'Msg[]' },
      { name: 'sequence', type: 'string' },
    ],
    Fee: [
      { name: 'feePayer', type: 'string' },
      { name: 'amount', type: 'Coin[]' },
      { name: 'gas', type: 'string' },
    ],
    Coin: [
      { name: 'denom', type: 'string' },
      { name: 'amount', type: 'string' },
    ],
    Msg: [
      { name: 'type', type: 'string' },
      { name: 'value', type: 'MsgValue' },
    ],
  };
  Object.assign(types, msgValues);
  return types;
}

export function createIBCMsgTransfer(
  receiver: string,
  sender: string,
  sourceChannel: string,
  sourcePort: string,
  revisionHeight: number,
  revisionNumber: number,
  timeoutTimestamp: string,
  amount: string,
  denom: string,
  memo?: string,
) {
  const msg = {
    type: 'cosmos-sdk/MsgTransfer',
    value: {
      receiver,
      sender,
      source_channel: sourceChannel,
      source_port: sourcePort,
      timeout_height: {
        revision_height: revisionHeight.toString(),
        revision_number: revisionNumber.toString(),
      },
      timeout_timestamp: timeoutTimestamp,
      token: {
        amount,
        denom,
      },
      memo,
    },
  };
  if (!memo) {
    delete msg.value.memo;
  }
  return msg;
}

export function generateTx(
  accountNumber: string,
  sequence: string,
  chainCosmosId: string,
  memo: string,
  fee: object,
  msgs: object[],
) {
  return {
    account_number: accountNumber,
    chain_id: chainCosmosId,
    fee,
    memo,
    msgs,
    sequence,
  };
}

export function createEIP712Tx(types: object, chainId: number, message: object) {
  return {
    types,
    primaryType: 'Tx',
    domain: {
      name: 'Cosmos Web3',
      version: '1.0.0',
      chainId,
      verifyingContract: 'cosmos',
      salt: '0',
    },
    message,
  };
}

export function createFee(fee: string, denom: string, gasLimit: number) {
  return Fee.fromPartial({
    amount: [
      Coin.fromPartial({
        denom,
        amount: fee,
      }),
    ],
    gasLimit: gasLimit,
  });
}

export function createSignerInfo(
  algo: string,
  publicKey: Uint8Array,
  sequence: number,
  mode: number,
  isMinitiaEvm: boolean,
) {
  let pubkey: any;

  if (algo === 'secp256k1') {
    pubkey = {
      value: PubKey.encode({
        key: publicKey,
      }).finish(),
      typeUrl: '/cosmos.crypto.secp256k1.PubKey',
    };
  } else {
    pubkey = {
      value: PubKey.encode({
        key: publicKey,
      }).finish(),
      typeUrl: isMinitiaEvm ? '/initia.crypto.v1beta1.ethsecp256k1.PubKey' : '/ethermint.crypto.v1.ethsecp256k1.PubKey',
    };
  }

  const signerInfo = {
    publicKey: pubkey,
    modeInfo: {
      single: {
        mode,
      },
    },
    sequence,
  };

  return signerInfo;
}

export function createAuthInfo(
  signerInfo: { publicKey: any; modeInfo: { single: { mode: number } }; sequence: number },
  fee: Fee,
) {
  return AuthInfo.fromPartial({
    signerInfos: [
      {
        publicKey: signerInfo.publicKey,
        modeInfo: signerInfo.modeInfo,
        sequence: signerInfo.sequence.toString(),
      },
    ],
    fee: {
      amount: fee.amount.map((coin) => {
        return {
          denom: coin.denom,
          amount: coin.amount.toString(),
        };
      }),
      gasLimit: fee.gasLimit.toString(),
      payer: fee.payer,
    },
  });
}

export function createSignDoc(
  bodyBytes: Uint8Array,
  authInfoBytes: Uint8Array,
  chainId: string,
  accountNumber: number,
) {
  return SignDoc.fromPartial({
    bodyBytes: bodyBytes,
    authInfoBytes: authInfoBytes,
    chainId: chainId,
    accountNumber: accountNumber,
  });
}

export function createTransactionWithMultipleMessages(
  messages: any,
  memo: string,
  fee: Fee,
  gasLimit: string,
  algo: string,
  pubKey: string,
  sequence: number,
  accountNumber: number,
  chainId: string,
  isMinitiaEvm = false,
) {
  const body = {
    messages: messages,
    memo,
    extensionOptions: [],
  };

  const feeMessage = Fee.fromPartial({
    amount: fee.amount,
    gasLimit: gasLimit,
    payer: fee.payer,
  });
  const pubKeyDecoded = Buffer.from(pubKey, 'base64');

  // AMINO
  const signInfoAmino = createSignerInfo(
    algo,
    pubKeyDecoded,
    sequence,
    SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
    isMinitiaEvm,
  );

  const authInfoAmino = createAuthInfo(signInfoAmino, feeMessage);

  // SignDirect
  const signInfoDirect = createSignerInfo(algo, pubKeyDecoded, sequence, SignMode.SIGN_MODE_DIRECT, isMinitiaEvm);

  const authInfoDirect = createAuthInfo(signInfoDirect, feeMessage);

  return {
    legacyAmino: {
      body,
      authInfo: authInfoAmino,
      accountNumber,
      chainId,
    },
    signDirect: {
      body,
      authInfo: authInfoDirect,
      accountNumber,
      chainId,
    },
  };
}

export function generateFee(amount: Coin[], gas: string, feePayer: string) {
  return {
    amount: amount,
    gas,
    feePayer,
  };
}

export function createProtoIBCMsgTransfer(
  sourcePort: string,
  sourceChannel: string,
  amount: string,
  denom: string,
  sender: string,
  receiver: string,
  revisionNumber: number,
  revisionHeight: number,
  timeoutTimestamp: string,
  memo: string,
) {
  const token = Coin.fromPartial({
    denom,
    amount,
  });

  const ibcMessage = {
    sourcePort: sourcePort,
    sourceChannel: sourceChannel,
    token,
    sender,
    receiver,
    timeoutHeight: {
      revisionNumber: revisionNumber.toString(),
      revisionHeight: revisionHeight.toString(),
    },
    timeoutTimestamp: timeoutTimestamp,
    memo,
  };

  return {
    value: MsgTransfer.encode(MsgTransfer.fromPartial(ibcMessage)).finish(),
    typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
  };
}

export function createTxIBCMsgTransfer(
  chain: {
    chainId: number;
    cosmosChainId: string;
  },
  sender: {
    accountAddress: string;
    sequence: number;
    accountNumber: number;
    pubkey: string;
  },
  fee: Fee,
  memo: string,
  params: {
    sourcePort: string;
    sourceChannel: string;
    amount: string;
    denom: string;
    receiver: string;
    revisionNumber: number;
    revisionHeight: number;
    timeoutTimestamp: string;
    memo: string;
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msg = createIBCMsgTransfer(
    params.receiver,
    sender.accountAddress,
    params.sourceChannel,
    params.sourcePort,
    params.revisionHeight,
    params.revisionNumber,
    params.timeoutTimestamp,
    params.amount,
    params.denom,
    params.memo,
  );

  const eip712Types = generateTypes(generateIbcMsgTransferTypes(msg.value));

  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [msg],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);

  // Cosmos
  const msgCosmos = createProtoIBCMsgTransfer(
    params.sourcePort,
    params.sourceChannel,
    params.amount,
    params.denom,
    sender.accountAddress,
    params.receiver,
    params.revisionNumber,
    params.revisionHeight,
    params.timeoutTimestamp,
    params.memo,
  );

  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );

  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));

  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createTxRawEIP712(body: TxBody, authInfo: AuthInfo) {
  return TxRaw.encode(
    TxRaw.fromPartial({
      bodyBytes: TxBody.encode(body).finish(),
      authInfoBytes: AuthInfo.encode(authInfo).finish(),
      signatures: [new Uint8Array(0)],
    }),
  ).finish();
}

export function createProtoMsgSend(fromAddress: string, toAddress: string, amount: string, denom: string) {
  const value = Coin.fromPartial({
    denom,
    amount,
  });

  const message: MsgSend = {
    fromAddress,
    toAddress,
    amount: [value],
  };

  return {
    value: MsgSend.encode(MsgSend.fromPartial(message)).finish(),
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  };
}

export function createMsgSend(amount: string, denom: string, fromAddress: string, toAddress: string) {
  return {
    type: 'cosmos-sdk/MsgSend',
    value: {
      amount: [
        {
          amount,
          denom,
        },
      ],
      from_address: fromAddress,
      to_address: toAddress,
    },
  };
}

export function createMessageSend(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    destinationAddress: string;
    amount: string;
    denom: string;
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msg = createMsgSend(params.amount, params.denom, sender.accountAddress, params.destinationAddress);

  const eip712Types = generateTypes(MSG_SEND_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [msg],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);
  const msgCosmos = createProtoMsgSend(sender.accountAddress, params.destinationAddress, params.amount, params.denom);
  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createMsgVote(proposalId: number, option: number, sender: string) {
  return {
    type: 'cosmos-sdk/MsgVote',
    value: {
      proposal_id: proposalId,
      voter: sender,
      option,
    },
  };
}

export function createProtoMsgVote(proposalId: number, option: number, sender: string) {
  const message = {
    proposalId,
    voter: sender,
    option,
  };

  return {
    value: MsgVote.encode(MsgVote.fromPartial(message)).finish(),
    typeUrl: '/cosmos.gov.v1beta1.MsgVote',
  };
}

export function createTxMsgVote(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    proposalId: number;
    option: number;
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msg = createMsgVote(params.proposalId, params.option, sender.accountAddress);

  const eip712Types = generateTypes(MSG_VOTE_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [msg],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);
  const msgCosmos = createProtoMsgVote(params.proposalId, params.option, sender.accountAddress);
  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createMsgDelegate(
  delegatorAddress: string,
  validatorAddress: string,
  amount: string,
  denom: string,
  isMinitiaEvm = false,
) {
  return {
    type: isMinitiaEvm ? 'mstaking/MsgDelegate' : 'cosmos-sdk/MsgDelegate',
    value: {
      amount: {
        amount,
        denom,
      },
      delegator_address: delegatorAddress,
      validator_address: validatorAddress,
    },
  };
}

export function createProtoMsgDelegate(
  delegatorAddress: string,
  validatorAddress: string,
  amount: string,
  denom: string,
  isMinitiaEvm = false,
) {
  const value = Coin.fromPartial({
    denom,
    amount,
  });

  const message: MsgDelegate = {
    delegatorAddress,
    validatorAddress,
    amount: value,
  };

  return {
    value: MsgDelegate.encode(MsgDelegate.fromPartial(message)).finish(),
    typeUrl: isMinitiaEvm ? '/initia.mstaking.v1.MsgDelegate' : '/cosmos.staking.v1beta1.MsgDelegate',
  };
}

export function createTxMsgDelegate(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: { validatorAddress: string; amount: string; denom: string },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msg = createMsgDelegate(
    sender.accountAddress,
    params.validatorAddress,
    params.amount,
    params.denom,
    isMinitiaEvm,
  );

  const eip712Types = generateTypes(MSG_DELEGATE_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [msg],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);
  const msgCosmos = createProtoMsgDelegate(
    sender.accountAddress,
    params.validatorAddress,
    params.amount,
    params.denom,
    isMinitiaEvm,
  );
  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createMsgGrant(
  granter: string,
  grantee: string,
  grantMessage: { value: Uint8Array; typeUrl: string },
  seconds: number,
) {
  const message = {
    granter,
    grantee,
    grant: {
      authorization: grantMessage,
      expiration: {
        seconds,
      },
    },
  };
  return {
    value: MsgGrant.encode(MsgGrant.fromPartial(message)).finish(),
    typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
  };
}

export function createStakeAuthorization(
  allowAddress: string,
  denom: string,
  maxTokens: string | undefined,
  authorizationType: AuthorizationType,
) {
  const message: StakeAuthorization = {
    maxTokens: maxTokens ? { denom, amount: maxTokens } : undefined,
    allowList: {
      address: [allowAddress],
    },
    authorizationType,
  };

  return {
    value: StakeAuthorization.encode(StakeAuthorization.fromPartial(message)).finish(),
    typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization',
  };
}

export function createTxMsgStakeAuthorization(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    bot_address: string;
    validator_address: string;
    denom: string;
    maxTokens: string | undefined;
    duration_in_seconds: number;
  },
  isMinitiaEvm = false,
) {
  const msgStakeGrant = createStakeAuthorization(
    params.validator_address,
    params.denom,
    params.maxTokens,
    AuthorizationType.AUTHORIZATION_TYPE_DELEGATE,
  );

  const msgCosmos = createMsgGrant(
    sender.accountAddress,
    params.bot_address,
    msgStakeGrant,
    params.duration_in_seconds,
  );

  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
  };
}

export function createMsgRevoke(granter: string, grantee: string, type: string) {
  const message: MsgRevoke = {
    granter,
    grantee,
    msgTypeUrl: type,
  };

  return {
    value: MsgRevoke.encode(MsgRevoke.fromPartial(message)).finish(),
    typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
  };
}

export function createTxMsgStakeRevokeAuthorization(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    bot_address: string;
  },
  isMinitiaEvm = false,
) {
  const msgCosmos = createMsgRevoke(sender.accountAddress, params.bot_address, RevokeMessages.REVOKE_MSG_DELEGATE);

  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
  };
}

export function createMsgRevokeGenericAuthorization(sender: string, botAddress: string, typeUrl: string) {
  return {
    type: 'cosmos-sdk/MsgRevoke',
    value: {
      msg_type_url: typeUrl,
      grantee: botAddress,
      granter: sender,
    },
  };
}

export function createTxMsgGenericRevoke(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    botAddress: string;
    typeUrl: string;
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msg = createMsgRevokeGenericAuthorization(sender.accountAddress, params.botAddress, params.typeUrl);

  const eip712Types = generateTypes(MSG_REVOKE_GENERIC_AUTHORIZATION_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [msg],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);
  const msgCosmos = createMsgRevoke(sender.accountAddress, params.botAddress, params.typeUrl);
  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createMsgUndelegate(
  delegatorAddress: string,
  validatorAddress: string,
  amount: string,
  denom: string,
  isMinitiaEvm = false,
) {
  return {
    type: isMinitiaEvm ? 'mstaking/MsgUndelegate' : 'cosmos-sdk/MsgUndelegate',
    value: {
      amount: {
        amount,
        denom,
      },
      delegator_address: delegatorAddress,
      validator_address: validatorAddress,
    },
  };
}

export function createProtoMsgUndelegate(
  delegatorAddress: string,
  validatorAddress: string,
  amount: string,
  denom: string,
  isMinitiaEvm = false,
) {
  const message: MsgUndelegate = {
    delegatorAddress,
    validatorAddress,
    amount: Coin.fromPartial({
      amount,
      denom,
    }),
  };

  return {
    value: MsgUndelegate.encode(MsgUndelegate.fromPartial(message)).finish(),
    typeUrl: isMinitiaEvm ? '/initia.mstaking.v1.MsgUndelegate' : '/cosmos.staking.v1beta1.MsgUndelegate',
  };
}

export function createTxMsgUndelegate(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    validatorAddress: string;
    amount: string;
    denom: string;
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msg = createMsgUndelegate(
    sender.accountAddress,
    params.validatorAddress,
    params.amount,
    params.denom,
    isMinitiaEvm,
  );

  const eip712Types = generateTypes(MSG_UNDELEGATE_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [msg],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);
  const msgCosmos = createProtoMsgUndelegate(
    sender.accountAddress,
    params.validatorAddress,
    params.amount,
    params.denom,
    isMinitiaEvm,
  );
  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createMsgCancelUnbondingDelegation(
  delegatorAddress: string,
  validatorAddress: string,
  amount: string,
  denom: string,
  creationHeight: string,
  isMinitiaEvm = false,
) {
  return {
    type: isMinitiaEvm ? 'mstaking/MsgCancelUnbondingDelegation' : 'cosmos-sdk/MsgCancelUnbondingDelegation',
    value: {
      amount: {
        amount,
        denom,
      },
      delegator_address: delegatorAddress,
      validator_address: validatorAddress,
      creation_height: Long.fromString(creationHeight),
    },
  };
}

export function createProtoMsgCancelUnbondingDelegation(
  delegatorAddress: string,
  validatorAddress: string,
  amount: string,
  denom: string,
  creationHeight: string,
  isMinitiaEvm = false,
) {
  const message: MsgCancelUnbondingDelegation = {
    delegatorAddress,
    validatorAddress,
    amount: Coin.fromPartial({
      amount,
      denom,
    }),
    creationHeight: Long.fromString(creationHeight),
  };

  return {
    // @ts-expect-error - LONG type mismatch
    value: MsgCancelUnbondingDelegation.encode(MsgCancelUnbondingDelegation.fromPartial(message)).finish(),
    typeUrl: isMinitiaEvm
      ? '/initia.mstaking.v1.MsgCancelUnbondingDelegation'
      : '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
  };
}

export function createTxMsgCancelUnbondingDelegation(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    validatorAddress: string;
    amount: string;
    denom: string;
    creationHeight: string;
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msg = createMsgCancelUnbondingDelegation(
    sender.accountAddress,
    params.validatorAddress,
    params.amount,
    params.denom,
    params.creationHeight,
    isMinitiaEvm,
  );

  const eip712Types = generateTypes(MSG_CANCEL_UNBONDING_DELEGATION_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [msg],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);
  const msgCosmos = createProtoMsgCancelUnbondingDelegation(
    sender.accountAddress,
    params.validatorAddress,
    params.amount,
    params.denom,
    params.creationHeight,
    isMinitiaEvm,
  );
  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createMsgWithdrawDelegatorReward(delegatorAddress: string, validatorAddress: string) {
  return {
    type: 'cosmos-sdk/MsgWithdrawDelegationReward',
    value: {
      delegator_address: delegatorAddress,
      validator_address: validatorAddress,
    },
  };
}

export function createProtoMsgWithdrawDelegatorReward(delegatorAddress: string, validatorAddress: string) {
  const message: MsgWithdrawDelegatorReward = {
    delegatorAddress,
    validatorAddress,
  };

  return {
    value: MsgWithdrawDelegatorReward.encode(MsgWithdrawDelegatorReward.fromPartial(message)).finish(),
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  };
}

export function createTxMsgMultipleWithdrawDelegatorReward(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    validatorAddresses: string[];
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msgs: object[] = [];
  const msgsCosmos: object[] = [];

  params.validatorAddresses.forEach((validator) => {
    msgs.push(createMsgWithdrawDelegatorReward(sender.accountAddress, validator));
    msgsCosmos.push(createProtoMsgWithdrawDelegatorReward(sender.accountAddress, validator));
  });

  const eip712Types = generateTypes(MSG_WITHDRAW_DELEGATOR_REWARD_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [...msgs],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);
  const tx = createTransactionWithMultipleMessages(
    [...msgsCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createMsgBeginRedelegate(
  delegatorAddress: string,
  validatorSrcAddress: string,
  validatorDstAddress: string,
  amount: string,
  denom: string,
  isMinitiaEvm = false,
) {
  return {
    type: isMinitiaEvm ? 'mstaking/MsgBeginRedelegate' : 'cosmos-sdk/MsgBeginRedelegate',
    value: {
      amount: {
        amount,
        denom,
      },
      delegator_address: delegatorAddress,
      validator_src_address: validatorSrcAddress,
      validator_dst_address: validatorDstAddress,
    },
  };
}

export function createProtoMsgBeginRedelegate(
  delegatorAddress: string,
  validatorSrcAddress: string,
  validatorDstAddress: string,
  amount: string,
  denom: string,
  isMinitiaEvm = false,
) {
  const message: MsgBeginRedelegate = {
    delegatorAddress,
    validatorDstAddress,
    validatorSrcAddress,
    amount: {
      amount,
      denom,
    },
  };
  return {
    value: MsgBeginRedelegate.encode(MsgBeginRedelegate.fromPartial(message)).finish(),
    typeUrl: isMinitiaEvm ? '/initia.mstaking.v1.MsgBeginRedelegate' : '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  };
}

export function createTxMsgBeginRedelegate(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    validatorSrcAddress: string;
    validatorDstAddress: string;
    amount: string;
    denom: string;
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msg = createMsgBeginRedelegate(
    sender.accountAddress,
    params.validatorSrcAddress,
    params.validatorDstAddress,
    params.amount,
    params.denom,
    isMinitiaEvm,
  );

  const eip712Types = generateTypes(MSG_BEGIN_REDELEGATE_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [msg],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);
  const msgCosmos = createProtoMsgBeginRedelegate(
    sender.accountAddress,
    params.validatorSrcAddress,
    params.validatorDstAddress,
    params.amount,
    params.denom,
    isMinitiaEvm,
  );
  const tx = createTransactionWithMultipleMessages(
    [msgCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export interface MsgDelegateParams {
  validatorAddress: string;
  amount: string;
  denom: string;
}

export function createTxMsgMultipleDelegate(
  chain: Chain,
  sender: Sender,
  fee: Fee,
  memo: string,
  params: {
    values: MsgDelegateParams[];
  },
  isMinitiaEvm = false,
) {
  const feeObject = generateFee(fee.amount, fee.gasLimit.toString(), sender.accountAddress);

  const msgs: object[] = [];
  const msgsCosmos: object[] = [];
  params.values.forEach((msgDelegate) => {
    msgs.push(
      createMsgDelegate(
        sender.accountAddress,
        msgDelegate.validatorAddress,
        msgDelegate.amount,
        msgDelegate.denom,
        isMinitiaEvm,
      ),
    );
    msgsCosmos.push(
      createProtoMsgDelegate(
        sender.accountAddress,
        msgDelegate.validatorAddress,
        msgDelegate.amount,
        msgDelegate.denom,
        isMinitiaEvm,
      ),
    );
  });
  const eip712Types = generateTypes(MSG_DELEGATE_TYPES);
  const messages = generateTx(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    [...msgs],
  );
  const eipToSign = createEIP712Tx(eip712Types, chain.chainId, messages);

  const tx = createTransactionWithMultipleMessages(
    [...msgsCosmos],
    memo,
    fee,
    fee.gasLimit.toString(),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
    isMinitiaEvm,
  );
  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(Buffer.from(signDirectDoc));
  return {
    signDirect: {
      authInfo: {
        ...tx.signDirect.authInfo,
        serializeBinary: () => AuthInfo.encode(tx.signDirect.authInfo).finish(),
      },
      body: {
        ...tx.signDirect.body,
        serializeBinary: () => TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      },
      signBytes,
    },
    legacyAmino: tx.legacyAmino,
    eipToSign,
  };
}

export function createTxRaw(bodyBytes: Uint8Array, authInfoBytes: Uint8Array, signatures: Uint8Array[]) {
  const message: TxRaw = {
    bodyBytes,
    authInfoBytes,
    signatures,
  };
  return {
    value: TxRaw.encode(TxRaw.fromPartial(message)).finish(),
    typeUrl: '/cosmos.tx.v1beta1.TxRaw',
  };
}
