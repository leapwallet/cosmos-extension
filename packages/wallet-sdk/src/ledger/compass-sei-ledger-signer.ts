import { AccountData, Algo, serializeSignDoc } from '@cosmjs/amino';
import { Secp256k1Signature } from '@cosmjs/crypto';
import { TypedDataEncoder } from '@ethersproject/hash/lib/typed-data';
import { JsonRpcProvider, TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { encodeSecp256k1Signature, Secp256k1, StdSignDoc } from '@leapwallet/leap-keychain';
import { signEIP712HashedMessage } from '@ledgerhq/hw-app-eth/lib/modules/EIP712';
import Transport from '@ledgerhq/hw-transport';
import { SeiApp } from '@zondax/ledger-sei';
import { isHexString } from 'ethereumjs-util';
import { utils } from 'ethers';

import { pubKeyToEvmAddressToShow } from '../utils';
import { declinedSeiAppOpenError, LedgerError } from './ledger-errors';
import { LedgerSignerEthers } from './ledger-signer-ethers';
import { handleError, isAppOpen, openApp } from './utils';

export class CompassSeiLedgerSigner {
  private readonly options: {
    hdPaths: string[];
    prefix: string;
  };

  ledger: SeiApp;
  provider?: JsonRpcProvider;

  constructor(private transport: Transport, options: { hdPaths: string[]; prefix: string }) {
    this.options = options;
    this.ledger = new SeiApp(transport);
  }

  private static domainHash(message: any) {
    return TypedDataEncoder.hashStruct('EIP712Domain', { EIP712Domain: message.types['EIP712Domain'] }, message.domain);
  }

  static formatSignature(signature: { v: number | string; r: string; s: string }) {
    return {
      r: `0x${signature.r}`,
      s: `0x${signature.s}`,
      v: signature.v,
    };
  }

  private async _getAccounts(
    closeTransport?: boolean,
  ): Promise<Array<AccountData & { hexAddress: string; path: string }>> {
    try {
      const defaultHdPath = "m/44'/60'/0'/0/0";
      const hdPaths = this.options.hdPaths ?? [defaultHdPath];
      const accounts: Array<AccountData & { hexAddress: string; path: string }> = [];
      const isSeiAppOpen = await isAppOpen(this.transport, 'Sei');

      try {
        if (!isSeiAppOpen) {
          const newTransport = await openApp(this.transport, 'Sei');
          if (this.transport) {
            await this.transport.close().catch(() => {});
          }

          const verifyAppOpen = await isAppOpen(newTransport, 'Sei');
          if (!verifyAppOpen) {
            throw new LedgerError('Unable to open Sei App. Please check if your Ledger is connected and try again.');
          }

          this.transport = newTransport;
          this.ledger = new SeiApp(newTransport);
        }
      } catch (e) {
        if (e.message.includes('0x5501')) {
          throw new Error(declinedSeiAppOpenError);
        }
      }

      for (const hdPath of hdPaths) {
        const { address: cosmosAddress, pubKey } = await this.ledger.getCosmosAddress(hdPath ?? defaultHdPath);
        const compressedPubKey = Secp256k1.publicKeyConvert(Buffer.from(pubKey, 'hex'), true);
        const evmAddress = pubKeyToEvmAddressToShow(compressedPubKey);

        const account = {
          address: cosmosAddress,
          algo: 'secp256k1' as Algo,
          pubkey: compressedPubKey,
          hexAddress: evmAddress,
          path: hdPath,
        };
        accounts.push(account);
      }

      if (closeTransport) {
        await this.transport.close();
      }

      return accounts;
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }

  async getAccount(signerAddress: string) {
    try {
      const accounts = await this._getAccounts();
      const account = accounts?.find((_account) => {
        if (isHexString(signerAddress)) {
          return _account?.hexAddress?.toLowerCase() === signerAddress?.toLowerCase();
        }

        return _account?.address?.toLowerCase() === signerAddress?.toLowerCase();
      });

      if (!account) throw new Error('Account not found');
      return account;
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }

  async getAccounts(closeTransport?: boolean): Promise<Array<AccountData & { path: string }>> {
    const accounts = await this._getAccounts(closeTransport);
    return accounts;
  }

  private static messageHash(message: any) {
    return TypedDataEncoder.from(
      (() => {
        const types = { ...message.types };
        delete types['EIP712Domain'];

        const primary = types[message.primaryType];
        if (!primary) {
          throw new Error(`Could not find matching primary type: ${message.primaryType}`);
        }

        delete types[message.primaryType];
        return {
          [message.primaryType]: primary,
          ...types,
        };
      })(),
    ).hash(message.message);
  }

  async sendTransaction(transactionRequest: TransactionRequest): Promise<TransactionResponse> {
    try {
      const ledgerSignerEthers = new LedgerSignerEthers(this, this.ledger, this.options.hdPaths[0], this.provider);
      if (!transactionRequest.nonce) {
        const accounts = await this._getAccounts();
        const accountAddress = accounts[0].hexAddress;
        const nonce = await this.provider?.getTransactionCount(accountAddress, 'pending');

        transactionRequest.nonce = nonce;
      }
      const response = await ledgerSignerEthers.sendTransaction(transactionRequest);
      return response;
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    } finally {
      this.transport.close();
    }
  }

  async sign(signerAddress: string, eipToSign: any) {
    try {
      this.getAccount(signerAddress);
      return this.signEip712(signerAddress, eipToSign);
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    } finally {
      this.transport.close();
    }
  }

  async signAmino(signerAddress: string, signDoc: StdSignDoc) {
    try {
      const accounts = await this.getAccounts();
      const accountIndex = accounts.findIndex((account) => account.address === signerAddress);

      if (accountIndex === -1) {
        throw new Error(`Address ${signerAddress} not found in wallet`);
      }

      const message = serializeSignDoc(signDoc);
      const accountForAddress = accounts[accountIndex];
      const hdPath = this.options.hdPaths?.[accountIndex];
      if (!hdPath) {
        throw new Error('HD Path not found');
      }

      const response = await this.ledger.signCosmos(hdPath, Buffer.from(message));
      if (response.error_message === 'No errors') {
        const signature = new Secp256k1Signature(response.r, response.s).toFixedLength();
        this.transport.close();

        return {
          signed: signDoc,
          signature: encodeSecp256k1Signature(accountForAddress.pubkey, signature),
        };
      } else {
        throw new Error(response.error_message);
      }
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    } finally {
      this.transport.close();
    }
  }

  async signEip712(signerAddress: string, message: any) {
    try {
      // This is just for validation
      await this.getAccount(signerAddress);

      const hdPath = this.options.hdPaths?.toString();
      const defaultHdPath = "m/44'/60'/0'/0/0";
      const domainHash = CompassSeiLedgerSigner.domainHash(message);
      const messageHash = CompassSeiLedgerSigner.messageHash(message);

      const result = await signEIP712HashedMessage(this.transport, hdPath ?? defaultHdPath, domainHash, messageHash);
      setTimeout(async () => {
        await this.transport.close();
      }, 1000);

      return CompassSeiLedgerSigner.formatSignature(result);
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }

  async signMessage(message: utils.Bytes | string): Promise<string> {
    const leapLedgerSignerEthers = new LedgerSignerEthers(this, this.ledger, this.options.hdPaths[0], this.provider);
    const response = await leapLedgerSignerEthers.signMessage(message);
    return response;
  }

  async signPersonalMessage(signerAddress: string, message: string) {
    try {
      await this.getAccount(signerAddress);
      const defaultHdPath = "m/44'/60'/0'/0/0";
      const hdPath = this.options.hdPaths?.toString() ?? defaultHdPath;
      const messageHex = utils.hexlify(message).substring(2);

      const signature = await this.ledger.signPersonalMessage(hdPath, messageHex);

      await this.transport.close();
      return CompassSeiLedgerSigner.formatSignature(signature);
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }

  async signTransaction(signerAddress: string, transaction: string) {
    try {
      await this.getAccount(signerAddress);
      const defaultHdPath = "m/44'/60'/0'/0/0";
      const hdPath = this.options.hdPaths?.toString() ?? defaultHdPath;
      const resolution = {
        domains: [],
        plugin: [],
        externalPlugin: [],
        nfts: [],
        erc20Tokens: [],
      };

      const signature = await this.ledger.signEVM(hdPath, transaction, resolution);
      await this.transport.close();
      return CompassSeiLedgerSigner.formatSignature(signature) as { r: string; s: string; v: number };
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }

  setProvider(provider: JsonRpcProvider) {
    this.provider = provider;
  }
}
