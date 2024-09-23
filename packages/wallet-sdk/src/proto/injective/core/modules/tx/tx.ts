import { DirectSignResponse } from '@cosmjs/proto-signing';
import { keccak256 } from 'ethereumjs-util';

import { CosmosTxV1Beta1Tx } from '../../../core-proto-ts';
import { DEFAULT_STD_FEE, getStdFeeFromString } from '../../../utils';
import { CreateTransactionArgs, CreateTransactionResult, CreateTransactionWithSignersArgs } from './types/tx';
import { SIGN_DIRECT } from './utils/constants';
import { createAuthInfo, createBody, createFee, createSignDoc, createSigners } from './utils/tx';

/**
 * @typedef {Object} CreateTransactionWithSignersArgs
 * @param {CreateTransactionWithSignersArgs} params
 * @property {Msg | Msg[]} message - the Cosmos messages to wrap them in a transaction
 * @property {string} memo - the memo to attach to the transaction
 * @property {StdFee} fee - the fee to attach to the transaction
 * @property {SignerDetails} signers - the signers of the transaction
 * @property {number} number - the account number to attach to the transaction
 * @property {number} chainId - the chain-id to attach to the transaction
 * @property {string} pubKey - the account pubKey to attach to the transaction (in base64)
 *
 * @typedef {Object} CreateTransactionResult
 * @property {TxRaw} txRaw  - the Tx raw that was created
 * @property {SignDoc} signDoc  - the SignDoc that was created - used for signing of the transaction
 * @property {SignerDetails} signers  - the signers of the transaction
 * @property {Uint8Array} bodyBytes  - the body bytes of the transaction
 * @property {Uint8Array} authInfoBytes  - the auth info bytes of the transaction
 * @property {Uint8Array} signBytes  - the sign bytes of the transaction (SignDoc serialized to binary)
 * @property {Uint8Array} signHashedBytes  - the sign bytes of the transaction (SignDoc serialized to binary) and hashed using keccak256
 * @returns {CreateTransactionResult} result
 */
export const createTransactionWithSigners = ({
  signers,
  chainId,
  message,
  timeoutHeight,
  memo = '',
  fee = DEFAULT_STD_FEE,
  signMode = SIGN_DIRECT,
}: CreateTransactionWithSignersArgs): CreateTransactionResult => {
  const actualSigners = Array.isArray(signers) ? signers : [signers];
  const [signer] = actualSigners;

  const body = createBody({ message, memo, timeoutHeight });
  const actualFee = typeof fee === 'string' ? getStdFeeFromString(fee) : fee;
  const feeMessage = createFee({
    fee: actualFee.amount[0],
    payer: actualFee.payer,
    granter: actualFee.granter,
    gasLimit: parseInt(actualFee.gas, 10),
  });

  const signInfo = createSigners({
    chainId,
    mode: signMode,
    signers: actualSigners,
  });

  const authInfo = createAuthInfo({
    signerInfo: signInfo,
    fee: feeMessage,
  });

  const bodyBytes = CosmosTxV1Beta1Tx.TxBody.encode(body).finish();
  const authInfoBytes = CosmosTxV1Beta1Tx.AuthInfo.encode(authInfo).finish();

  const signDoc = createSignDoc({
    chainId,
    bodyBytes: bodyBytes,
    authInfoBytes: authInfoBytes,
    accountNumber: signer.accountNumber,
  });

  const signDocBytes = CosmosTxV1Beta1Tx.SignDoc.encode(signDoc).finish();

  const toSignBytes = Buffer.from(signDocBytes);
  const toSignHash = keccak256(Buffer.from(signDocBytes));

  const txRaw = CosmosTxV1Beta1Tx.TxRaw.fromPartial({});
  txRaw.authInfoBytes = authInfoBytes;
  txRaw.bodyBytes = bodyBytes;

  return {
    txRaw,
    signDoc,
    signers,
    signer,
    signBytes: toSignBytes,
    signHashedBytes: toSignHash,
    bodyBytes: bodyBytes,
    authInfoBytes: authInfoBytes,
  };
};

/**
 * @typedef {Object} CreateTransactionArgs
 * @param {CreateTransactionArgs} params
 * @property {MsgArg | MsgArg[]} message - the Cosmos messages to wrap them in a transaction
 * @property {string} memo - the memo to attach to the transaction
 * @property {StdFee} fee - the fee to attach to the transaction
 * @property {string} sequence - the account sequence to attach to the transaction
 * @property {number} number - the account number to attach to the transaction
 * @property {number} chainId - the chain-id to attach to the transaction
 * @property {string} pubKey - the account pubKey to attach to the transaction (in base64)
 *
 * @typedef {Object} CreateTransactionResult
 * @property {TxRaw} txRaw  // the Tx raw that was created
 * @property {SignDoc} signDoc  // the SignDoc that was created - used for signing of the transaction
 * @property {number} accountNumber  // the account number of the signer of the transaction
 * @property {Uint8Array} bodyBytes  // the body bytes of the transaction
 * @property {Uint8Array} authInfoBytes  // the auth info bytes of the transaction
 * @property {Uint8Array} signBytes  // the sign bytes of the transaction (SignDoc serialized to binary)
 * @property {Uint8Array} signHashedBytes  // the sign bytes of the transaction (SignDoc serialized to binary) and hashed using keccak256
 * @returns {CreateTransactionResult} result
 */
export const createTransaction = (args: CreateTransactionArgs): CreateTransactionResult => {
  return createTransactionWithSigners({
    ...args,
    signers: {
      pubKey: args.pubKey,
      accountNumber: args.accountNumber,
      sequence: args.sequence,
    },
  });
};

export const createTxRawFromSigResponse = (response: CosmosTxV1Beta1Tx.TxRaw | DirectSignResponse) => {
  if ((response as DirectSignResponse).signed === undefined) {
    return response as CosmosTxV1Beta1Tx.TxRaw;
  }

  const directSignResponse = response as DirectSignResponse;

  const txRaw = CosmosTxV1Beta1Tx.TxRaw.fromPartial({});
  txRaw.authInfoBytes = directSignResponse.signed.authInfoBytes;
  txRaw.bodyBytes = directSignResponse.signed.bodyBytes;
  txRaw.signatures = [Buffer.from(directSignResponse.signature.signature, 'base64')];

  return txRaw;
};
