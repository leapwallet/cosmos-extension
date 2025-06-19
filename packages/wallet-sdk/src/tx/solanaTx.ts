import { StdFee } from '@cosmjs/amino';
import { ed25519 } from '@noble/curves/ed25519';
import { base58, utf8 } from '@scure/base';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';
import { SupportedChain } from 'constants/chain-infos';
import * as sol from 'micro-sol-signer';

import { getBaseURL } from '../globals';

export type SolanaAccount = {
  readonly address: string;
  readonly pubKey: string;
  privateKey: string | Uint8Array | undefined;
  readonly signer: string | Uint8Array | undefined;
};

export class SolanaTx {
  constructor(
    private rpcUrl: string,
    private account?: SolanaAccount | undefined,
    private selectedNetwork?: string,
    private chain?: SupportedChain,
  ) {}

  static async getSolanaClient(
    rpcUrl: string,
    account?: SolanaAccount | undefined,
    selectedNetwork?: string,
    chain?: SupportedChain,
  ) {
    return new SolanaTx(rpcUrl, account, selectedNetwork, chain);
  }

  async simulateTx(tx: string) {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'simulateTransaction',
        params: [tx, { encoding: 'base64', commitment: 'confirmed', sigVerify: false }],
      }),
    });
    const json = await response.json();
    return {
      unitsConsumed: json.result.value.unitsConsumed,
    };
  }

  async simulateSendSolTransaction(fromAddress: string, toAddress: string, amount: number) {
    try {
      const { data: result } = await axios({
        url: `${getBaseURL()}/adhoc/sdk/solana/simulateTx`,
        method: 'POST',
        data: {
          sender: fromAddress,
          amount: {
            amount: amount.toString(),
            decimals: 9,
          },
          recipient: toAddress,
          selectedNetwork: this.selectedNetwork,
          feeSOL: {
            amount: [
              {
                amount: 10_000,
                decimals: 9,
              },
            ],
            gas: 20_000,
          },
          activeChain: this.chain,
        },
        timeout: 10000,
      });
      return result;
    } catch (e) {
      console.error('Error simulating send sol transaction', e);
      return {
        unitsConsumed: 0,
      };
    }
  }

  async simulateSendSplTokenTransaction(
    fromAddress: string,
    toAddress: string,
    amount: number,
    tokenMintAddress: string,
    tokenDecimals: number,
  ) {
    try {
      const BASE_URL = `${getBaseURL()}/adhoc/sdk/solana-spl`;
      const { data: result } = await axios({
        url: `${BASE_URL}/simulateTx`,
        method: 'POST',
        data: {
          sender: fromAddress,
          amount: {
            amount: amount.toString(),
            decimals: tokenDecimals,
          },
          recipient: toAddress,
          selectedNetwork: this.selectedNetwork,
          feeSOL: {
            amount: [
              {
                amount: 10_000,
                decimals: 9,
              },
            ],
            gas: 40_000,
          },
          tokenMintAddress,
          activeChain: this.chain,
        },
      });

      return result;
    } catch (e) {
      console.error('Error simulating send spl token transaction', e);
      return {
        unitsConsumed: 0,
      };
    }
  }

  async signTransaction(tx: any): Promise<{ tx: string; signature: string }> {
    if (!tx) {
      console.error('Transaction data is undefined');
      throw new Error('Transaction data is undefined');
    }
    const txData = Buffer.from(tx, 'base64');
    const vtx = VersionedTransaction.deserialize(txData);
    const derivedPublicKey = sol.getPublicKey(this.account?.privateKey as Uint8Array);
    const pvtKey = new Uint8Array([...(this.account?.privateKey as Uint8Array), ...derivedPublicKey]);
    const signer = Keypair.fromSecretKey(pvtKey);
    vtx.sign([signer]);
    return {
      tx: base58.encode(vtx.serialize()),
      signature: base58.encode(vtx.signatures[0]),
    };
  }

  async signMessage(message: string) {
    if (!message) {
      console.error('Message is undefined');
      throw new Error('Message is undefined');
    }
    const messageBytes = typeof message === 'string' ? utf8.decode(message) : message;
    const signature = ed25519.sign(messageBytes, this.account?.privateKey as Uint8Array);

    return base58.encode(signature);
  }

  async createAndSignSolTransfer(toAddress: string, amountSOL: number, feeSOL?: StdFee): Promise<string> {
    try {
      if (!this.account) {
        console.error('Account is not defined');
        return '';
      }
      if (!this.account.privateKey) {
        console.error('Something went wrong');
        return '';
      }
      const fromAddress = sol.getAddress(this.account.privateKey as Uint8Array);
      const BASE_URL = `${getBaseURL()}/adhoc/sdk/solana`;
      const { data: unsignedTx } = await axios({
        url: `${BASE_URL}/prepareTx`,
        method: 'POST',
        data: {
          sender: fromAddress,
          amount: {
            amount: amountSOL.toString(),
            decimals: 9,
          },
          recipient: toAddress,
          selectedNetwork: this.selectedNetwork,
          feeSOL,
          activeChain: this.chain,
        },
      });

      const txData = await this.signTransaction(unsignedTx);
      return txData.tx;
    } catch (e) {
      console.error('Error creating and signing sol transfer', e);
      return '';
    }
  }

  async createAndSignSplTokenTransfer(
    tokenMintAddress: string,
    recipientTokenAccount: string,
    amountTokens: number | string,
    tokenDecimals: number,
    feeSOL?: StdFee,
  ): Promise<string> {
    try {
      if (!this.account) {
        console.error('Account is not defined');
        return '';
      }
      const fromAddress = sol.getAddress(this.account.privateKey as Uint8Array);
      const BASE_URL = `${getBaseURL()}/adhoc/sdk/solana-spl`;
      const { data: unsignedTx } = await axios({
        url: `${BASE_URL}/prepareTx`,
        method: 'POST',
        data: {
          sender: fromAddress,
          amount: {
            amount: amountTokens.toString(),
            decimals: tokenDecimals,
          },
          recipient: recipientTokenAccount,
          selectedNetwork: this.selectedNetwork,
          feeSOL,
          tokenMintAddress,
          activeChain: this.chain,
        },
      });

      const txData = await this.signTransaction(unsignedTx);
      return txData.tx;
    } catch (e) {
      console.error('Error creating and signing sol transfer', e);
      return '';
    }
  }

  async broadcastTransaction(signedTxData: string, waitConfirmation: boolean = true): Promise<string> {
    try {
      const { data: signature } = await axios({
        url: `${getBaseURL()}/adhoc/sdk/solana/broadcastTx`,
        method: 'POST',
        data: {
          txBytes: signedTxData,
          selectedNetwork: this.selectedNetwork,
          waitConfirmation,
          activeChain: this.chain,
        },
      });
      return signature;
    } catch (error) {
      console.error('Error broadcasting transaction:', error);
      throw error;
    }
  }

  async sendSol(toAddress: string, amountSOL: number, feeSOL?: StdFee): Promise<string> {
    // Detect if the amount is already in lamports
    // If the number is very large (> 1 million), it's likely already in lamports

    const signedTxData = await this.createAndSignSolTransfer(toAddress, amountSOL, feeSOL);
    const txnHash = await this.broadcastTransaction(signedTxData);
    return txnHash;
  }

  async sendSplToken(
    tokenMintAddress: string,
    recipientTokenAccount: string,
    amountTokens: number | string,
    tokenDecimals: number,
    feeSOL?: StdFee,
  ): Promise<string> {
    const signedTxData = await this.createAndSignSplTokenTransfer(
      tokenMintAddress,
      recipientTokenAccount,
      amountTokens,
      tokenDecimals,
      feeSOL,
    );
    const txnHash = await this.broadcastTransaction(signedTxData);
    return txnHash;
  }

  async getGasPrice() {
    const { data } = await axios({
      url: `${getBaseURL()}/gas-fee/solana`,
      method: 'POST',
      data: {
        selectedNetwork: this.selectedNetwork,
        chain: this.chain,
      },
    });
    const gasPrice = {
      low: data.low,
      medium: data.medium,
      high: data.high,
    };
    return { gasPrice };
  }

  async getMinimumRentAmount(recipientAddress: string) {
    if (!recipientAddress) return 0;
    try {
      const { data } = await axios({
        url: `${getBaseURL()}/rent/solana`,
        method: 'POST',
        data: {
          selectedNetwork: this.selectedNetwork,
          address: recipientAddress,
          chain: this.chain,
        },
      });
      return data.minimumRentAmount;
    } catch (error) {
      console.error('Error getting minimum rent amount', error);
      return 0;
    }
  }
}
