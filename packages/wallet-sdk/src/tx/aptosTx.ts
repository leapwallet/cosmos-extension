import {
  Account,
  AccountAddress,
  AccountAuthenticator,
  Aptos,
  APTOS_COIN,
  APTOS_FA,
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
    if (['movement-native', 'aptos-native'].includes(denom)) {
      return APTOS_COIN;
    }
    if (['movement-native-fa', 'aptos-native-fa'].includes(denom)) {
      return APTOS_FA;
    }
    return denom?.replace('0x1::coin::CoinStore<', '')?.replace('>', '');
  }

  async generateFungibleAssetTx(
    fromAddress: string,
    tokenAddress: string,
    toAddress: string,
    amount: number,
    gasPrice?: number,
    gasLimit?: number,
  ) {
    const fungibleAssetMetadataAddress = AptosTx.sanitizeTokenDenom(tokenAddress);
    const simpleTransaction = await this.aptos.transferFungibleAsset({
      //@ts-expect-error this function only uses accountAddress from the Account object.
      sender: {
        accountAddress: AccountAddress.fromStrict(fromAddress),
      },
      fungibleAssetMetadataAddress,
      recipient: toAddress,
      amount: amount,
      options: {
        gasUnitPrice: gasPrice,
        maxGasAmount: gasLimit,
      },
    });
    return simpleTransaction;
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

      return txn;
    } catch (error) {
      throw new Error(error.response?.data?.message ?? error);
    }
  }

  async sendFungibleAsset(
    fromAddress: string,
    tokenAddress: string,
    toAddress: string,
    amount: number,
    gasPrice?: number,
    gasLimit?: number,
  ) {
    try {
      const txn = await this.generateFungibleAssetTx(fromAddress, tokenAddress, toAddress, amount, gasPrice, gasLimit);

      return txn;
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
      options: {
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
        estimatePrioritizedGasUnitPrice: false,
      },
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
      options: {
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
        estimatePrioritizedGasUnitPrice: false,
      },
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

  async pollForTx(txnHash: string) {
    const tx = await this.aptos.waitForTransaction({
      transactionHash: txnHash,
      options: {
        timeoutSecs: 30,
      },
    });
    return { aptosResult: tx };
  }

  async broadcastTransaction(txn: SimpleTransaction) {
    const committedTxn = await this.signTransaction(txn);
    const submittedTxn = await this.aptos.transaction.submit.simple({
      transaction: txn,
      senderAuthenticator: committedTxn,
    });
    return submittedTxn;
  }

  async signAndBroadcastTransaction(txn: SimpleTransaction) {
    if (!this.account) throw new Error('No account found, please generate the tx client with account');
    const committedTxn = await this.aptos.signAndSubmitTransaction({
      signer: this.account,
      transaction: txn,
    });

    console.log('logging committed txn', committedTxn);

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

  async generateSwapTxn(
    tx: {
      function: `${string}::${string}::${string}`;
      typeArguments: string[];
      functionArguments: (string | boolean | string[])[];
    },
    gasPrice?: number,
    gasLimit?: number,
  ) {
    if (!this.account) throw new Error('No account found, please generate the tx client with account');
    const transaction = await this.aptos.transaction.build.simple({
      sender: this.account.accountAddress,
      data: tx,
      options: {
        gasUnitPrice: gasPrice,
        maxGasAmount: gasLimit ?? 200000,
      },
    });
    return transaction;
  }

  async simulateGasFee(txn: SimpleTransaction) {
    if (!this.account) throw new Error('No account found, please generate the tx client with account');

    const simulation = await this.aptos.transaction.simulate.simple({
      transaction: txn,
      signerPublicKey: this.account.publicKey,
    });

    return {
      gasEstimate: simulation[0].gas_used,
      gasUnitPrice: simulation[0].gas_unit_price,
    };
  }
}
