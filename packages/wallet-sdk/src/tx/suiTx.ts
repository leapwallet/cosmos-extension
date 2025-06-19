import { StdFee } from '@cosmjs/amino';
import { blake2b } from '@noble/hashes/blake2b';
import { base64 } from '@scure/base';
import axios from 'axios';
import nacl from 'tweetnacl';

import { getBaseURL } from '../globals';

export type SuiAccount = {
  readonly address: string;
  readonly pubKey: string;
  privateKey: string;
  readonly signer: Uint8Array;
};

export class SuiTx {
  constructor(private account?: SuiAccount | undefined, private selectedNetwork?: string) {}

  static async getSuiClient(account?: SuiAccount | undefined, selectedNetwork?: string) {
    return new SuiTx(account, selectedNetwork);
  }

  async simulateTransaction(tx: Uint8Array | string, selectedNetwork: string) {
    if (typeof tx === 'string') {
      const { txBase64 } = await this.getTransaction(tx, this.account?.address ?? '');
      tx = txBase64;
    } else {
      tx = new Uint8Array(Object.values(tx));
    }

    const txData = await axios.post(`https://fullnode.${selectedNetwork}.sui.io:443`, {
      jsonrpc: '2.0',
      id: 2,
      method: 'sui_dryRunTransactionBlock',
      params: [base64.encode(tx)],
    });

    return {
      ...txData.data.result.effects.gasUsed,
      gasUnits: txData.data.result.effects.gasUsed.computationCost / txData.data.result.input.gasData.price,
    };
  }

  async simulateSendSuiTransaction(fromAddress: string, toAddress: string, amount: number) {
    try {
      const { data: result } = await axios({
        url: `${getBaseURL()}/adhoc/sdk/sui-native/simulateTx`,
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
                amount: 1_000_000,
                decimals: 9,
              },
            ],
            gas: 1_000,
          },
        },
      });
      return result;
    } catch (e) {
      console.error('Error simulating send sui transaction', e);
      return {
        unitsConsumed: 0,
      };
    }
  }

  async simulateSendNonNativeTokenTransaction(
    fromAddress: string,
    toAddress: string,
    amount: number,
    tokenMintAddress: string,
    tokenDecimals: number,
  ) {
    try {
      const { data: result } = await axios({
        url: `${getBaseURL()}/adhoc/sdk/sui-non-native/simulateTx`,
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
                amount: 1_000_000,
                decimals: 9,
              },
            ],
            gas: 1_000,
          },
          tokenMintAddress,
        },
      });

      return result;
    } catch (e) {
      console.error('Error simulating send sui non native token transaction', e);
      return {
        unitsConsumed: 0,
      };
    }
  }

  async signTransaction(
    tx: Uint8Array | string,
  ): Promise<{ txnBytes: Uint8Array; signature: Uint8Array; txHash: string }> {
    let txDigest = '';
    if (typeof tx === 'string') {
      const { txBase64, txHash: txHashData } = await this.getTransaction(tx, this.account?.address ?? '');
      tx = txBase64;
      txDigest = txHashData;
    } else if (typeof tx === 'object') {
      tx = new Uint8Array(Object.values(tx));
    }
    if (!tx) {
      console.error('Transaction data is undefined');
      throw new Error('Transaction data is undefined');
    }
    const INTENT_BYTES = new Uint8Array([0, 0, 0]);
    const FLAG_ED25519 = 0x00;
    const intentMessage = new Uint8Array(INTENT_BYTES.length + tx.length);
    intentMessage.set(INTENT_BYTES, 0);
    intentMessage.set(tx, INTENT_BYTES.length);

    const digest = blake2b(intentMessage, { dkLen: 32 });

    if (!this.account?.signer) {
      throw new Error('Account is not defined');
    }

    if (this.account.signer.length !== 64) {
      throw new Error('Invalid signer length. Expected 64 bytes for Ed25519 key pair');
    }

    const sig = nacl.sign.detached(digest, this.account.signer);

    const pubKey = this.account.signer.slice(32);

    if (!pubKey || pubKey.length !== 32) {
      throw new Error(`Invalid public key length: ${pubKey?.length}. Expected 32 bytes`);
    }

    const totalLength = 1 + sig.length + pubKey.length;
    const serializedSignature = new Uint8Array(totalLength);

    try {
      serializedSignature.set([FLAG_ED25519], 0);
      serializedSignature.set(sig, 1);
      serializedSignature.set(pubKey, 1 + sig.length);
    } catch (e) {
      console.error('Error signing transaction', e);
      throw e;
    }
    return {
      txHash: txDigest,
      txnBytes: tx,
      signature: serializedSignature,
    };
  }

  async createAndSignSuiTransfer(
    fromAddress: string,
    toAddress: string,
    amountSui: number,
    feeSui?: StdFee,
  ): Promise<[any, Uint8Array]> {
    try {
      if (!this.account) {
        throw new Error('Account is not defined');
      }

      // Validate required parameters
      if (!fromAddress || !toAddress) {
        throw new Error('Invalid address parameters');
      }

      if (typeof amountSui !== 'number' || amountSui <= 0) {
        throw new Error('Invalid amount');
      }

      const { data: unsignedTx } = await axios({
        url: `${getBaseURL()}/adhoc/sdk/sui-native/prepareTx`,
        method: 'POST',
        data: {
          sender: fromAddress,
          amount: {
            amount: amountSui.toString(),
            decimals: 9,
          },
          recipient: toAddress,
          selectedNetwork: this.selectedNetwork,
          feeSui,
        },
      });

      if (!unsignedTx) {
        throw new Error('Failed to prepare transaction');
      }

      const signature = await this.signTransaction(new Uint8Array(Object.values(unsignedTx)));
      return [unsignedTx, signature.signature];
    } catch (e) {
      console.error('Error creating and signing sui transfer:', e);
      throw e;
    }
  }

  async createAndSignNonNativeTokenTransfer(
    tokenMintAddress: string,
    recipientTokenAccount: string,
    amountTokens: number | string,
    tokenDecimals: number,
    feeSOL?: StdFee,
  ): Promise<[Uint8Array, Uint8Array]> {
    try {
      if (!this.account) {
        console.error('Account is not defined');
        throw new Error('Account is not defined');
      }
      const { data: unsignedTx } = await axios({
        url: `${getBaseURL()}/adhoc/sdk/sui-non-native/prepareTx`,
        method: 'POST',
        data: {
          sender: this.account.address,
          amount: {
            amount: amountTokens.toString(),
            decimals: tokenDecimals,
          },
          recipient: recipientTokenAccount,
          selectedNetwork: this.selectedNetwork,
          feeSOL,
          tokenMintAddress,
        },
      });

      const { signature } = await this.signTransaction(new Uint8Array(Object.values(unsignedTx)));
      return [unsignedTx, signature];
    } catch (e) {
      console.error('Error creating and signing sol transfer', e);
      throw new Error('Something went wrong');
    }
  }

  async broadcastTransaction(
    unsignedTx: Uint8Array,
    signature: Uint8Array,
    waitConfirmation: boolean = true,
  ): Promise<any> {
    try {
      const data = await axios({
        url: `${getBaseURL()}/adhoc/sdk/sui-native/broadcastTx`,
        method: 'POST',
        data: {
          txBytes: unsignedTx,
          signature,
          selectedNetwork: this.selectedNetwork,
          waitConfirmation,
        },
      });
      return data.data;
    } catch (error) {
      console.error('Error broadcasting transaction:', error);
      throw error;
    }
  }

  async sendSui(
    fromAddress: string,
    toAddress: string,
    amountSui: number,
    feeSui?: StdFee,
  ): Promise<{ digest: string; effects: any }> {
    const [unsignedTx, signature] = await this.createAndSignSuiTransfer(fromAddress, toAddress, amountSui, feeSui);

    const txBytes = new Uint8Array(Object.values(unsignedTx));

    const { digest, effects } = await this.broadcastTransaction(txBytes, signature);
    return { digest, effects };
  }

  async sendNonNativeToken(
    tokenMintAddress: string,
    recipientTokenAccount: string,
    amountTokens: number | string,
    tokenDecimals: number,
    feeSOL?: StdFee,
  ): Promise<{ digest: string; effects: any }> {
    const [txBytes, signature] = await this.createAndSignNonNativeTokenTransfer(
      tokenMintAddress,
      recipientTokenAccount,
      amountTokens,
      tokenDecimals,
      feeSOL,
    );
    const { digest, effects } = await this.broadcastTransaction(new Uint8Array(Object.values(txBytes)), signature);
    return { digest, effects };
  }

  async getGasPrice() {
    const { data } = await axios({
      url: `${getBaseURL()}/gas-fee/sui`,
      method: 'POST',
      data: {
        selectedNetwork: this.selectedNetwork,
      },
    });
    const gasPrice = {
      low: data.low,
      medium: data.medium,
      high: data.high,
    };
    return { gasPrice };
  }

  async getTransaction(txHash: string, sender: string): Promise<{ txBase64: Uint8Array; txHash: string }> {
    const data = await axios({
      url: `${getBaseURL()}/adhoc/sdk/sui-native/getTransaction`,
      method: 'POST',
      data: {
        txHash,
        selectedNetwork: this.selectedNetwork,
        sender,
      },
    });

    return { txBase64: new Uint8Array(Object.values(data.data.txBase64)), txHash: data.data.txDigest };
  }
}
