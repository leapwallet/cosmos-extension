import { Random } from '@cosmjs/crypto';
import { Permit, SecretNetworkClient, Wallet, WalletOptions } from 'secretjs';
import { GasPriceStepsRecord } from 'types';

import { ChainInfos, defaultGasPriceStep } from '../constants';
import { EncryptionUtilsImpl } from './encryptionutil';

const DEFAULT_GAS = 135000;

type Query_Permissions = 'balance' | 'history' | 'allowance';
export type CreateViewingKeyOptions = {
  key?: string;
  gasLimit?: number;
  feeDenom?: string;
  gasPriceStep?: number;
};

export class Sscrt {
  constructor(private client: SecretNetworkClient) {
    //
  }

  static create(url: string, chainId: string, walletAddress: string, encryptionUtils?: EncryptionUtilsImpl) {
    const secretjs = new SecretNetworkClient({
      url,
      chainId,
      walletAddress,
      encryptionUtils: encryptionUtils ?? new EncryptionUtilsImpl(url, chainId),
    });

    return new Sscrt(secretjs);
  }

  async getBalance(address: string, contract: string, key: string) {
    const { code_hash = '' } = await this.client.query.snip20.codeHashByContractAddress({ contract_address: contract });

    return await this.client.query.snip20.getBalance({
      contract: { code_hash, address: contract },
      address: this.client.address ?? address,
      auth: { key },
    });
  }

  async getBalanceUsingPermit(address: string, contract: string, permit: Permit) {
    const { code_hash = '' } = await this.client.query.snip20.codeHashByContractAddress({ contract_address: contract });
    return await this.client.query.snip20.getBalance({
      contract: { code_hash, address: contract },
      address: this.client.address ?? address,
      auth: { permit },
    });
  }

  async simulate(sender: string, contractAddress: string, msg: { transfer: { recipient: string; amount: string } }) {
    const { code_hash = '' } = await this.client.query.snip20.codeHashByContractAddress({
      contract_address: contractAddress,
    });
    try {
      const res = await this.client.tx.snip20.transfer.simulate(
        {
          sender,
          contract_address: contractAddress,
          msg,
          code_hash,
        },
        { gasLimit: DEFAULT_GAS },
      );
      return {
        gasUsed: res.gas_info?.gas_used ?? DEFAULT_GAS,
      };
    } catch (e) {
      return {
        gasUsed: DEFAULT_GAS,
      };
    }
  }

  async getTokenParams(contractAddress: string) {
    const { code_hash = '' } = await this.client.query.snip20.codeHashByContractAddress({
      contract_address: contractAddress,
    });
    const txQuery = await this.client.query.snip20.getSnip20Params({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      contract: { address: contractAddress, code_hash: code_hash! },
    });
    return txQuery;
  }
}

export class SscrtWallet {
  constructor(public wallet: Wallet) {
    //
  }

  static async create(mnemonic: string, options: WalletOptions) {
    const wallet = await new Wallet(mnemonic, options);

    return wallet;
  }
}

export class SigningSscrt {
  constructor(private client: SecretNetworkClient) {
    //
  }

  static create(url: string, chainId: string, wallet: Wallet, encryptionutil?: EncryptionUtilsImpl) {
    const secretjs = new SecretNetworkClient({
      url,
      chainId,
      wallet,
      walletAddress: wallet.address,
      encryptionUtils: encryptionutil ?? new EncryptionUtilsImpl(url, chainId),
    });

    return new SigningSscrt(secretjs);
  }

  async transfer(sender: string, contractAddress: string, msg: { transfer: { recipient: string; amount: string } }) {
    const { code_hash = '' } = await this.client.query.snip20.codeHashByContractAddress({
      contract_address: contractAddress,
    });
    const res = await this.client.tx.snip20.transfer.simulate(
      {
        sender,
        contract_address: contractAddress,
        msg,
        code_hash,
      },
      { gasLimit: DEFAULT_GAS },
    );

    const result = await this.client.tx.snip20.transfer(
      {
        sender,
        contract_address: contractAddress,
        msg,
        code_hash,
      },
      { gasLimit: parseInt(res.gas_info?.gas_used ?? DEFAULT_GAS.toString()), gasPriceInFeeDenom: 0.02 },
    );

    return result;
  }

  async simulateCreateViewingKey(senderAddress: string, contractAddress: string, key?: string) {
    const random = Random.getBytes(32);
    const { code_hash = '' } = await this.client.query.snip20.codeHashByContractAddress({
      contract_address: contractAddress,
    });
    let _key = key;
    if (!_key) {
      _key = Buffer.from(random).toString('hex');
    }

    try {
      const txStatus = await this.client.tx.snip20.setViewingKey.simulate(
        {
          sender: senderAddress,
          contract_address: contractAddress,
          code_hash,
          msg: { set_viewing_key: { key: _key } },
        },
        { gasLimit: DEFAULT_GAS },
      );

      return { gasUsed: txStatus.gas_info?.gas_used ?? DEFAULT_GAS.toString() };
    } catch (e) {
      throw new Error('Unable to simulate viewing key');
    }
  }

  async createViewingKey(
    senderAddress: string,
    contractAddress: string,
    gasPriceSteps: GasPriceStepsRecord,
    options?: CreateViewingKeyOptions,
  ) {
    const random = Random.getBytes(32);
    const { code_hash = '' } = await this.client.query.snip20.codeHashByContractAddress({
      contract_address: contractAddress,
    });

    let _key = options?.key;
    if (!_key) {
      _key = Buffer.from(random).toString('hex');
    }

    try {
      const txStatus = await this.client.tx.snip20.setViewingKey(
        {
          sender: senderAddress,
          contract_address: contractAddress,
          code_hash,
          msg: { set_viewing_key: { key: _key } },
        },
        {
          gasLimit: options?.gasLimit ?? DEFAULT_GAS,
          gasPriceInFeeDenom: options?.gasPriceStep ?? gasPriceSteps.secret?.low ?? defaultGasPriceStep.low,
          feeDenom: options?.feeDenom ?? 'uscrt',
        },
      );

      return { txStatus, viewingKey: _key };
    } catch (e) {
      throw new Error('Unable to set viewing key');
    }
  }

  async createQueryPermit(
    address: string,
    permitname: string,
    contracts: Array<string>,
    permissions: Array<Query_Permissions>,
  ) {
    try {
      return await this.client.utils.accessControl.permit.sign(
        address,
        ChainInfos.secret.chainId,
        permitname,
        contracts,
        permissions,
        false,
      );
    } catch (e) {
      throw new Error('Unable to create query permit');
    }
  }
}
