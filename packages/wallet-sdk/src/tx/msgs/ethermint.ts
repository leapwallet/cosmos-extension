import { makeSignDoc } from '@cosmjs/amino';
import { keccak256 } from '@cosmjs/crypto';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, SignDoc, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';

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
  msgs: [object],
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

export function createSignerInfo(algo: string, publicKey: Uint8Array, sequence: number, mode: number) {
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
      typeUrl: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
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
  const signInfoAmino = createSignerInfo(algo, pubKeyDecoded, sequence, SignMode.SIGN_MODE_LEGACY_AMINO_JSON);

  const authInfoAmino = createAuthInfo(signInfoAmino, feeMessage);

  // SignDirect
  const signInfoDirect = createSignerInfo(algo, pubKeyDecoded, sequence, SignMode.SIGN_MODE_DIRECT);

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
  );

  const signDirectDoc = SignDoc.encode(
    SignDoc.fromPartial({
      bodyBytes: TxBody.encode(TxBody.fromPartial(tx.signDirect.body)).finish(),
      authInfoBytes: AuthInfo.encode(tx.signDirect.authInfo).finish(),
      accountNumber: sender.accountNumber,
      chainId: chain.cosmosChainId,
    }),
  ).finish();

  const signBytes = keccak256(signDirectDoc);

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
