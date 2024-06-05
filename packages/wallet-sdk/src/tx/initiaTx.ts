// "@initia/initia.js": "0.2.1",

// import { OfflineAminoSigner } from '@cosmjs/amino';
// import { fromBase64, toBase64 } from '@cosmjs/encoding';
// import { Coin, OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
// import { DeliverTxResponse, StdFee, TimeoutError } from '@cosmjs/stargate';
// import {
//   AuthInfo,
//   Coin as InitiaCoin,
//   Fee as InitiaFee,
//   ModeInfo,
//   MsgBeginRedelegate,
//   MsgCancelUnbondingDelegation,
//   MsgDelegate,
//   MsgUndelegate,
//   MsgWithdrawDelegatorReward,
//   SignerInfo,
//   SimplePublicKey,
//   Tx as InitiaJsTx,
//   TxBody,
// } from '@initia/initia.js';
// import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
// import Long from 'long';

// import { fetchAccountDetails } from '../accounts';
// import { axiosWrapper } from '../healthy-nodes';
// import { sleep } from '../utils';

// export class InitiaTx {
//   constructor(
//     private lcdEndpoint: string,
//     private chainId: string,
//     private wallet: OfflineSigner,
//     private isLedgerWallet: boolean = false,
//   ) {}

//   async delegate(
//     delegatorAddress: string,
//     validatorAddress: string,
//     amount: Coin,
//     fees: number | StdFee | 'auto',
//     memo?: string,
//   ) {
//     const delegateMsg = new MsgDelegate(delegatorAddress, validatorAddress, [
//       new InitiaCoin(amount.denom, amount.amount),
//     ]);

//     return await this.signAndBroadcastTx(delegatorAddress, [delegateMsg], fees as StdFee, memo);
//   }

//   async reDelegate(
//     delegatorAddress: string,
//     validatorDstAddress: string,
//     validatorSrcAddress: string,
//     amount: Coin,
//     fees: number | StdFee | 'auto',
//     memo?: string,
//   ) {
//     const redelegateMsg = new MsgBeginRedelegate(delegatorAddress, validatorSrcAddress, validatorDstAddress, [
//       new InitiaCoin(amount.denom, amount.amount),
//     ]);

//     return await this.signAndBroadcastTx(delegatorAddress, [redelegateMsg], fees as StdFee, memo);
//   }

//   async cancelUnDelegation(
//     delegatorAddress: string,
//     validatorAddress: string,
//     amount: Coin,
//     creationHeight: string,
//     fee: number | StdFee | 'auto',
//     memo?: string,
//   ) {
//     const cancelUndelegationMsg = new MsgCancelUnbondingDelegation(
//       delegatorAddress,
//       validatorAddress,
//       [new InitiaCoin(amount.denom, amount.amount)],
//       Number(creationHeight),
//     );

//     return await this.signAndBroadcastTx(delegatorAddress, [cancelUndelegationMsg], fee as StdFee, memo);
//   }

//   async unDelegate(
//     delegatorAddress: string,
//     validatorAddress: string,
//     amount: Coin,
//     fee: number | StdFee | 'auto',
//     memo?: string,
//   ) {
//     const undelegateMsg = new MsgUndelegate(delegatorAddress, validatorAddress, [
//       new InitiaCoin(amount.denom, amount.amount),
//     ]);

//     return await this.signAndBroadcastTx(delegatorAddress, [undelegateMsg], fee as StdFee, memo);
//   }

//   async withdrawRewards(
//     delegatorAddress: string,
//     validatorAddresses: string[],
//     fees: number | StdFee | 'auto',
//     memo?: string,
//   ) {
//     const withdrawRewardsMsgs = validatorAddresses.map(
//       (validatorAddress) => new MsgWithdrawDelegatorReward(delegatorAddress, validatorAddress),
//     );

//     return await this.signAndBroadcastTx(delegatorAddress, withdrawRewardsMsgs, fees as StdFee, memo);
//   }

//   async signAndBroadcastTx(
//     signerAddress: string,
//     msg:
//       | MsgDelegate[]
//       | MsgBeginRedelegate[]
//       | MsgUndelegate[]
//       | MsgWithdrawDelegatorReward[]
//       | MsgCancelUnbondingDelegation[],
//     fees: StdFee,
//     memo?: string,
//   ) {
//     const txBytesString = await this.signTx(signerAddress, msg, fees, memo);
//     return await this.broadcastTx(txBytesString);
//   }

//   async signTx(
//     signerAddress: string,
//     msg:
//       | MsgDelegate[]
//       | MsgBeginRedelegate[]
//       | MsgUndelegate[]
//       | MsgWithdrawDelegatorReward[]
//       | MsgCancelUnbondingDelegation[],
//     fees: StdFee,
//     memo?: string,
//   ) {
//     const accountDetails = await fetchAccountDetails(this.lcdEndpoint, signerAddress);

//     if (this.isLedgerWallet) {
//       const msgs = msg.map((m) => m.toAmino());
//       const timeoutHeight = (Date.now() + 1_000_000).toString();
//       const signDoc = {
//         chain_id: this.chainId,
//         account_number: accountDetails.accountNumber,
//         sequence: accountDetails.sequence,
//         fee: fees,
//         memo: memo ?? 'via Leap Cosmos Wallet',
//         msgs: msgs,
//         timeout_height: timeoutHeight,
//       };

//       const signedDoc = await (this.wallet as OfflineAminoSigner).signAmino(signerAddress, signDoc);

//       const tx = InitiaJsTx.fromAmino({
//         type: 'cosmos-sdk/StdTx',
//         value: {
//           msg: signDoc.msgs,
//           fee: {
//             gas: fees.gas,
//             amount: [new InitiaCoin(fees.amount[0].denom, fees.amount[0].amount)],
//           },
//           memo: signedDoc.signed.memo,
//           signatures: [
//             {
//               signature: signedDoc.signature.signature,
//               pub_key: signedDoc.signature.pub_key.value,
//             },
//           ],
//           timeout_height: timeoutHeight,
//         },
//       });

//       tx.auth_info.signer_infos = [
//         new SignerInfo(
//           new SimplePublicKey(accountDetails.pubKey.key),
//           Number(accountDetails.sequence),
//           new ModeInfo(new ModeInfo.Single(ModeInfo.SignMode.SIGN_MODE_LEGACY_AMINO_JSON)),
//         ),
//       ];

//       const txBytesString = toBase64(tx.toBytes());

//       return txBytesString;
//     }

//     const tx = InitiaJsTx.fromData({
//       body: new TxBody(msg, memo).toData(),
//       auth_info: new AuthInfo(
//         [
//           new SignerInfo(
//             new SimplePublicKey(accountDetails.pubKey.key),
//             Number(accountDetails.sequence),
//             new ModeInfo(new ModeInfo.Single(1)),
//           ),
//         ],
//         new InitiaFee(
//           Number(fees.gas),
//           [new InitiaCoin(fees.amount[0].denom, fees.amount[0].amount)],
//           fees.payer,
//           fees.granter,
//         ),
//       ).toData(),
//       signatures: [],
//     });

//     const signDoc = {
//       bodyBytes: tx.body.toBytes(),
//       authInfoBytes: tx.auth_info.toBytes(),
//       chainId: this.chainId,
//       accountNumber: Long.fromString(accountDetails.accountNumber),
//     };

//     const signedDoc = await (this.wallet as OfflineDirectSigner).signDirect(signerAddress, signDoc);
//     const txRaw = TxRaw.fromPartial({
//       bodyBytes: signedDoc.signed.bodyBytes,
//       authInfoBytes: signedDoc.signed.authInfoBytes,
//       signatures: [fromBase64(signedDoc.signature.signature)],
//     });

//     const txBytes = TxRaw.encode(txRaw).finish();
//     const txBytesString = toBase64(txBytes);
//     return txBytesString;
//   }

//   async broadcastTx(signedTx: string): Promise<string> {
//     const baseURL = this.lcdEndpoint;
//     const { data: result } = await axiosWrapper({
//       baseURL,
//       method: 'post',
//       url: '/cosmos/tx/v1beta1/txs',
//       data: JSON.stringify({
//         tx_bytes: signedTx,
//         mode: 'BROADCAST_MODE_SYNC',
//       }),
//     });

//     const txResponse = result.tx_response;
//     if (txResponse?.code) {
//       throw new Error(txResponse.raw_log);
//     }
//     return txResponse.txhash;
//   }

//   async pollForTx(txHash: string, timeout = 40000, pollcount = 0): Promise<DeliverTxResponse> {
//     const limit = 20;
//     const timedOut = pollcount > limit;
//     if (timedOut) {
//       throw new TimeoutError(
//         `Transaction with ID ${txHash} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
//           timeout / 1000
//         } seconds.`,
//         txHash,
//       );
//     }
//     const baseURL = this.lcdEndpoint;
//     await sleep(2000);
//     let result;

//     try {
//       const { data } = await axiosWrapper({ baseURL, method: 'get', url: `/cosmos/tx/v1beta1/txs/${txHash}` });
//       result = data;
//     } catch (_) {
//       return this.pollForTx(txHash, timeout, pollcount + 1);
//     }

//     const txResponse = result?.tx_response;
//     if (txResponse?.code) {
//       return this.pollForTx(txHash, timeout, pollcount + 1);
//     }
//     return {
//       code: result?.code,
//       height: result?.height,
//       rawLog: result?.rawLog,
//       transactionHash: txHash,
//       gasUsed: result?.gasUsed,
//       gasWanted: result?.gasWanted,
//       events: result?.events,
//     };
//   }
// }
