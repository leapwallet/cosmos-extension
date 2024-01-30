import {
  ExecuteResult,
  JsonObject,
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions,
} from '@cosmjs/cosmwasm-stargate';
import { toHex } from '@cosmjs/encoding';
import { Coin, EncodeObject, OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, coin, DeliverTxResponse, SignerData, StdFee, TimeoutError } from '@cosmjs/stargate';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { DirectTokenSwapArgs, PassThroughTokenSwapArgs, TokenInfo } from 'types/swap';

import { GasPrice, getTxData } from '../tx';
import { sleep } from '../utils/sleep';
import { createExecuteMessage, createIncreaseAllowanceMessage } from './utils/messages';
import { getDirectTokenSwapMessage, getPassthroughSwapMessage } from './utils/messages/createExecuteMessage';

export class BaseSwapTx {
  client: SigningCosmWasmClient | null;
  wallet: OfflineSigner;
  rpcEndPoint: string;
  options: SigningCosmWasmClientOptions | undefined;
  gasPrice: GasPrice;
  lcdUrl: string;

  constructor(rpcEndPoint: string, lcdUrl: string, wallet: OfflineSigner, options?: SigningCosmWasmClientOptions) {
    this.client = null;
    this.wallet = wallet;
    this.rpcEndPoint = rpcEndPoint;
    this.options = options;
    this.lcdUrl = lcdUrl;
    if (!options?.gasPrice) {
      throw new Error('options.gasPrice price is required');
    }
    this.gasPrice = options?.gasPrice;
  }

  async initClient() {
    this.client = await SigningCosmWasmClient.connectWithSigner(this.rpcEndPoint, this.wallet, {
      gasPrice: this.options?.gasPrice,
      broadcastPollIntervalMs: this.options?.broadcastPollIntervalMs ?? 2_000,
      registry: this.options?.registry,
      aminoTypes: this.options?.aminoTypes,
      broadcastTimeoutMs: this.options?.broadcastTimeoutMs ?? 60_000,
      prefix: this.options?.prefix,
    });
  }

  async pollForTx(txId: string, limit = 20, pollCount = 0): Promise<DeliverTxResponse> {
    const timedOut = pollCount >= limit;
    const timeoutMs = (this.options?.broadcastPollIntervalMs ?? 2_000) * limit;
    if (timedOut) {
      throw new TimeoutError(
        `Transaction with ID ${txId} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
          timeoutMs / 1000
        } seconds.`,
        txId,
      );
    }
    if (timedOut) {
      throw new TimeoutError(
        `Transaction with ID ${txId} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
          timeoutMs / 1000
        } seconds.`,
        txId,
      );
    }
    await sleep(this.options?.broadcastPollIntervalMs ?? 2_000);
    const result = await getTxData(txId, this.lcdUrl);

    return result
      ? {
          code: result.code,
          height: result.height,
          rawLog: result.rawLog,
          transactionHash: txId,
          gasUsed: result.gasUsed,
          gasWanted: result.gasWanted,
          events: [],
        }
      : this.pollForTx(txId, limit, pollCount + 1);
  }

  async signAndBroadcastTx(
    signerAddress: string,
    msgs: EncodeObject[],
    fee: StdFee | 'auto' | number,
    memo = '',
    signerData?: SignerData,
  ) {
    const signedTx = await this.signTx(signerAddress, msgs, fee, memo, signerData);
    if (!signedTx) {
      throw new Error('Cosmwasm client not initialised');
    }
    return await this.broadcastTx(signedTx);
  }

  async broadcastTx(txRaw: TxRaw) {
    if (this.client instanceof SigningCosmWasmClient) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const broadcasted = await this.client.forceGetTmClient().broadcastTxSync({ tx: TxRaw.encode(txRaw).finish() });
      if (broadcasted.code) {
        return Promise.reject(new Error(broadcasted.code.toString()));
      }

      return toHex(broadcasted.hash).toUpperCase();
    } else {
      throw new Error('Cosmwasm client not initialised');
    }
  }

  private async signTx(
    signerAddress: string,
    msgs: EncodeObject[],
    fee: StdFee | 'auto' | number,
    memo = '',
    explicitSignerData?: SignerData,
  ) {
    let usedFee: StdFee;
    if (fee === 'auto' || typeof fee === 'number') {
      const gasEstimation = await this.client?.simulate(signerAddress, msgs, memo);
      const multiplier = fee !== 'auto' ? fee : 1.3;
      if (!gasEstimation) {
        throw new Error('unable to get gas estimate');
      }
      usedFee = calculateFee(Math.round(gasEstimation * multiplier), this.gasPrice);
    } else {
      usedFee = fee;
    }
    return await this.client?.sign(signerAddress, msgs, usedFee, memo, explicitSignerData);
  }
}

export class CWTx extends BaseSwapTx {
  constructor(rpcEndPoint: string, lcdUrl: string, wallet: OfflineSigner, options?: SigningCosmWasmClientOptions) {
    const cwOptions = {
      ...(options ?? {}),
    };
    if (!cwOptions.gasPrice) {
      cwOptions.gasPrice = GasPrice.fromString('0.01ujuno');
    }
    super(rpcEndPoint, lcdUrl, wallet, cwOptions);
  }

  async directTokenSwap({
    tokenA,
    swapDirection,
    swapAddress,
    senderAddress,
    slippage,
    price,
    tokenAmount,
    fee = 'auto',
  }: DirectTokenSwapArgs): Promise<string> {
    const swapMessage = getDirectTokenSwapMessage(price, slippage, swapDirection, tokenAmount);
    return await this.executeSwap(senderAddress, swapAddress, tokenA, tokenAmount, swapMessage, fee);
  }

  async simulateDirectTokenSwap({
    tokenA,
    swapDirection,
    swapAddress,
    senderAddress,
    slippage,
    price,
    tokenAmount,
  }: DirectTokenSwapArgs): Promise<number | undefined> {
    const swapMessage = getDirectTokenSwapMessage(price, slippage, swapDirection, tokenAmount);
    return await this.simulateSwap({ senderAddress, swapAddress, tokenA, tokenAmount, swapMessage });
  }

  async passThroughTokenSwap({
    tokenAmount,
    tokenA,
    outputSwapAddress,
    swapAddress,
    senderAddress,
    slippage,
    price,
    fee = 'auto',
  }: PassThroughTokenSwapArgs): Promise<string> {
    const swapMessage = getPassthroughSwapMessage(price, slippage, tokenAmount, outputSwapAddress);
    return await this.executeSwap(senderAddress, swapAddress, tokenA, tokenAmount, swapMessage, fee);
  }

  async simulatePassThroughTokenSwap({
    tokenAmount,
    tokenA,
    outputSwapAddress,
    swapAddress,
    senderAddress,
    slippage,
    price,
  }: PassThroughTokenSwapArgs): Promise<number | undefined> {
    const swapMessage = getPassthroughSwapMessage(price, slippage, tokenAmount, outputSwapAddress);
    return await this.simulateSwap({ senderAddress, swapAddress, tokenA, tokenAmount, swapMessage });
  }

  async execute(
    senderAddress: string,
    contractAddress: string,
    message: JsonObject,
    fee: StdFee | 'auto' | number,
    memo: string = '',
    funds?: Coin[],
  ) {
    const executeMessage = createExecuteMessage({
      senderAddress,
      contractAddress,
      message,
      funds,
    });

    return this.signAndBroadcastTx(senderAddress, [executeMessage], fee, memo);
  }

  async executeSwap(
    senderAddress: string,
    swapAddress: string,
    tokenA: TokenInfo,
    tokenAmount: number,
    swapMessage: Record<string, Record<string, string>>,
    fee: StdFee | 'auto' | number,
  ) {
    const executeMessage = createExecuteMessage({
      senderAddress,
      contractAddress: swapAddress,
      message: swapMessage,
      funds: tokenA.native ? [coin(tokenAmount, tokenA.denom)] : [],
    });

    if (!tokenA.native) {
      const increaseAllowanceMessage = createIncreaseAllowanceMessage({
        senderAddress,
        tokenAmount,
        tokenAddress: tokenA.token_address,
        swapAddress,
      });

      return await this.signAndBroadcastTx(senderAddress, [increaseAllowanceMessage, executeMessage], fee);
    }

    return await this.signAndBroadcastTx(senderAddress, [executeMessage], fee);
  }

  async validateTx(tx: ExecuteResult) {
    const result = await this.client?.getTx(tx.transactionHash);
    return result?.code === 0;
  }

  async simulateSwap({
    senderAddress,
    swapAddress,
    tokenA,
    tokenAmount,
    swapMessage,
  }: {
    senderAddress: string;
    swapAddress: string;
    tokenA: TokenInfo;
    tokenAmount: number;
    swapMessage: Record<string, Record<string, string>>;
  }) {
    const executeMessage = createExecuteMessage({
      senderAddress,
      contractAddress: swapAddress,
      message: swapMessage,
      funds: tokenA.native ? [coin(tokenAmount, tokenA.denom)] : [],
    });

    if (!tokenA.native) {
      const increaseAllowanceMessage = createIncreaseAllowanceMessage({
        senderAddress,
        tokenAmount,
        tokenAddress: tokenA.token_address,
        swapAddress,
      });

      return await this.client?.simulate(senderAddress, [increaseAllowanceMessage, executeMessage], '');
    }

    return await this.client?.simulate(senderAddress, [executeMessage], '');
  }
}
