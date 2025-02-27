import {
  Account,
  AccountAuthenticator,
  Aptos,
  APTOS_COIN,
  AptosConfig,
  HexInput,
  PublicKey,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';
import { Coin } from '@cosmjs/proto-signing';

export class AptosTx {
  constructor(private aptos: Aptos, private account?: Account) {}

  static async getAptosClient(lcdUrl: string, account?: Account) {
    const config = new AptosConfig({
      fullnode: lcdUrl,
      faucet: 'https://fund.testnet.porto.movementlabs.xyz/',
    });
    const aptos = new Aptos(config);
    return new AptosTx(aptos, account);
  }

  static sanitizeTokenDenom(denom: string) {
    return ['movement-native', 'aptos-native'].includes(denom)
      ? APTOS_COIN
      : denom.replace('0x1::coin::CoinStore<', '').replace('>', '');
  }

  async generateSendTokensTx(
    fromAddress: string,
    toAddress: string,
    amount: Coin[],
    gasPrice?: number,
    gasLimit?: number,
    memo?: string,
  ) {
    if (!memo) {
      memo = '';
    }
    const denom = AptosTx.sanitizeTokenDenom(amount[0].denom);

    const tx = await this.aptos.transferCoinTransaction({
      sender: fromAddress,
      recipient: toAddress,
      amount: Number(amount[0].amount),
      coinType: denom as `0x${string}::${string}::${string}`,
      options: {
        gasUnitPrice: gasPrice,
        maxGasAmount: gasLimit,
      },
    });

    return tx;
  }

  async sendTokens(
    fromAddress: string,
    toAddress: string,
    amount: Coin[],
    gasPrice?: number,
    gasLimit?: number,
    memo?: string,
  ) {
    try {
      const txn = await this.generateSendTokensTx(fromAddress, toAddress, amount, gasPrice, gasLimit, memo);
      const committedTxn = await this.signAndBroadcastTransaction(txn);

      const tx = await this.pollForTx(committedTxn.hash);

      return tx.hash;
    } catch (error) {
      throw new Error(error.response?.data?.message ?? error);
    }
  }

  async simulateSendTokens(
    fromAddress: string,
    toAddress: string,
    amount: Coin[],
    memo?: string,
    publicKey?: PublicKey,
  ) {
    const sendTxn = await this.generateSendTokensTx(fromAddress, toAddress, amount, undefined, undefined, memo);
    const simulation = await this.aptos.transaction.simulate.simple({
      transaction: sendTxn,
      signerPublicKey: publicKey,
    });
    return {
      gasEstimate: simulation[0].gas_used,
      gasUnitPrice: simulation[0].gas_unit_price,
    };
  }

  async simulateTransaction(txn: SimpleTransaction, publicKey?: PublicKey) {
    const simulation = await this.aptos.transaction.simulate.simple({
      transaction: txn,
      signerPublicKey: publicKey,
    });
    return {
      gasEstimate: simulation[0].gas_used,
      gasUnitPrice: simulation[0].gas_unit_price,
    };
  }

  async getGasPrice() {
    const res = await this.aptos.getGasPriceEstimation();

    const gasPrice = res?.gas_estimate
      ? {
          low: res.gas_estimate * 1,
          medium: res.gas_estimate * 1.2,
          high: res.gas_estimate * 1.5,
        }
      : undefined;

    const deprioritizedGasPrice = res?.gas_estimate
      ? {
          low: res.gas_estimate * 1,
          medium: res.gas_estimate * 1.2,
          high: res.gas_estimate * 1.5,
        }
      : undefined;

    const prioritizedGasPrice = res?.prioritized_gas_estimate
      ? {
          low: res.prioritized_gas_estimate * 1,
          medium: res.prioritized_gas_estimate * 1.2,
          high: res.prioritized_gas_estimate * 1.5,
        }
      : undefined;

    return { gasPrice, deprioritizedGasPrice, prioritizedGasPrice };
  }

  async pollForTx(txHash: string) {
    const tx = await this.aptos.waitForTransaction({ transactionHash: txHash });
    return tx;
  }

  async signAndBroadcastTransaction(txn: SimpleTransaction) {
    if (!this.account) throw new Error('No account found, please generate the tx client with account');
    const committedTxn = await this.aptos.signAndSubmitTransaction({
      signer: this.account,
      transaction: txn,
    });

    return committedTxn;
  }

  async signMessage(message: HexInput) {
    if (!this.account) throw new Error('No account found, please generate the tx client with account');
    const signedMessage = await this.account.sign(message);
    return signedMessage;
  }

  async signTransaction(txn: SimpleTransaction): Promise<AccountAuthenticator> {
    if (!this.account) throw new Error('No account found, please generate the tx client with account');
    const signedTxn = await this.aptos.sign({
      signer: this.account,
      transaction: txn,
    });
    return signedTxn;
  }

  async getTransactions(address: string) {
    const txs = await this.aptos.getAccountTransactions({
      accountAddress: address,
    });
    return txs;
  }
}
