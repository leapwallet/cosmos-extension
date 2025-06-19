import {
  AccountData,
  AminoSignResponse,
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
  serializeSignDoc,
  StdSignDoc,
} from '@cosmjs/amino';
import { Secp256k1Signature } from '@cosmjs/crypto';
import { Algo } from '@cosmjs/proto-signing';
import * as bytes from '@ethersproject/bytes';
import { _TypedDataEncoder as TypedDataEncoder } from '@ethersproject/hash';
import { JsonRpcProvider, TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { encodeSecp256k1Signature, Secp256k1 } from '@leapwallet/leap-keychain';
import EthereumApp from '@ledgerhq/hw-app-eth';
import Transport from '@ledgerhq/hw-transport';
import { CosmosApp } from '@zondax/ledger-cosmos-js';
import { bech32 } from 'bech32';
import { Address as EthereumUtilsAddress, isHexString } from 'ethereumjs-util';
import { utils } from 'ethers';

import { ChainInfo, SupportedChain } from '../constants';
import { getBech32Address, getEthereumAddress } from '../utils';
import { CompassSeiLedgerSigner } from './compass-sei-ledger-signer';
import {
  bolosError,
  bolosErrorMessage,
  declinedCosmosAppOpenError,
  declinedEthAppOpenError,
  deviceDisconnectedError,
  deviceLockedError,
  ledgerDisconnectMessage,
  LedgerError,
  ledgerLockedError,
} from './ledger-errors';
import { LedgerSignerEthers } from './ledger-signer-ethers';
import { getSpeculosTransport, getUseSpeculosTransport } from './speculos-transport';
import { handleError, isAppOpen, openApp } from './utils';

const isWindows = () => navigator.platform.indexOf('Win') > -1;

type LedgerAppId = 'cosmos' | 'eth' | 'sei';

async function revokeHIDPermissions() {
  const vendorId = '0x2C97';
  // Method 1: Using Permissions API (Chrome 85+)

  try {
    //@ts-expect-error navigator.hid is available
    const devices = await navigator.hid.requestDevice({
      filters: [
        {
          vendorId,
        },
      ],
    });
    if (devices.length === 0) {
      devices.map((device: any) => device.forget());
      return false;
    }
    console.log('HID permissions revoked successfully');
    return true;
  } catch (e) {
    console.log('Permission API not supported for HID or revoke not available:', e);
  }

  // Method 2: Force user to clear site data manually (fallback)
  // We can't programmatically clear permissions in browsers that don't support revoke(),
  // so we'll need to instruct the user

  console.log('Unable to programmatically revoke HID permissions');
  return false;
}

async function disconnectLedger() {
  const TransportWebHid = (await import('@ledgerhq/hw-transport-webhid')).default;
  const existingDevices = await TransportWebHid.list();

  for (const device of existingDevices) {
    try {
      if (device.opened) device.close();

      const transport = await TransportWebHid.open(device);
      if (transport) {
        await transport.close();
      }
    } catch (e) {
      console.error('Error closing transport:', e);
    }
  }
}

export async function getLedgerTransport(): Promise<Transport> {
  let transport;

  try {
    await disconnectLedger();
  } catch (e) {
    console.log('No existing connections to disconnect or error during disconnection:', e);
  }
  if (getUseSpeculosTransport()) {
    transport = await getSpeculosTransport();
    return transport;
  }

  if (isWindows()) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (!navigator.hid) {
      throw new LedgerError(
        `Your browser doesn't have HID enabled.\nPlease enable this feature by visiting:\nchrome://flags/#enable-experimental-web-platform-features`,
      );
    }
    const TransportWebHid = (await import('@ledgerhq/hw-transport-webhid')).default;

    transport = await TransportWebHid.create();
  } else {
    // For other than Windows
    const TransportWebhid = (await import('@ledgerhq/hw-transport-webhid')).default;
    try {
      transport = await TransportWebhid.create();
    } catch (e) {
      console.log('error', e);
      throw new LedgerError(
        'Unable to connect to Ledger device. Please check if your Ledger is connected and try again.',
      );
    }
  }

  transport.setExchangeTimeout(60_000);
  return transport;
}

export class LeapLedgerSigner {
  private ledger: CosmosApp;

  constructor(private transport: Transport, private options: { hdPaths: string[]; prefix: string }) {
    this.ledger = new CosmosApp(transport);
  }

  private static hdPathToArray(hdPath: string): Array<number> {
    const path = hdPath
      .split('/')
      .filter((x) => x !== 'm')
      .map((x) => parseInt(x, 10));

    return path;
  }

  async isLedgerUnlocked() {
    try {
      const defaultHdPath = [44, 118, 0, 0, 0];
      const response = await this.ledger.getAddressAndPubKey(defaultHdPath, 'cosmos');

      return response.error_message === 'No errors';
    } catch {
      return false;
    }
  }

  async getAccounts(closeTransport?: boolean): Promise<Array<AccountData & { path: string }>> {
    try {
      const accounts: Array<AccountData & { path: string }> = [];
      const hdPaths = this.options.hdPaths;
      const isCosmosAppOpen = await isAppOpen(this.transport, 'Cosmos');

      try {
        if (!isCosmosAppOpen) {
          const newTransport = await openApp(this.transport, 'Cosmos');
          if (this.transport) {
            await this.transport.close().catch(() => {});
          }
          const verifyAppOpen = await isAppOpen(newTransport, 'Cosmos');
          if (!verifyAppOpen) {
            throw new LedgerError('Unable to open Cosmos App. Please check if your Ledger is connected and try again.');
          }
          this.transport = newTransport;
          this.ledger = new CosmosApp(newTransport);
        }
      } catch (e) {
        if (e.message.includes('0x5501')) {
          throw new Error(declinedCosmosAppOpenError);
        }
      }
      if (!hdPaths) {
        throw new Error('HD Paths not found');
      }

      for (const hdPath of hdPaths) {
        const path = LeapLedgerSigner.hdPathToArray(hdPath);
        const result = await this.ledger.getAddressAndPubKey(path, this.options.prefix ?? 'cosmos');

        const account = {
          algo: 'secp256k1' as Algo,
          address: result.bech32_address,
          pubkey: result.compressed_pk,
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

  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
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

      const response = await this.ledger.sign(LeapLedgerSigner.hdPathToArray(hdPath), Buffer.from(message));
      if (response.error_message === 'No errors') {
        const signature = Secp256k1Signature.fromDer(response.signature).toFixedLength();
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
    }
  }
}

export class LeapLedgerSignerEth {
  private readonly options: {
    hdPaths: string[];
    prefix: string;
  };
  ledger: EthereumApp;
  provider?: JsonRpcProvider;

  constructor(private transport: Transport, options: { hdPaths: string[]; prefix: string }) {
    this.options = options;
    this.ledger = new EthereumApp(transport);
  }

  private static domainHash(message: any) {
    return TypedDataEncoder.hashStruct('EIP712Domain', { EIP712Domain: message.types['EIP712Domain'] }, message.domain);
  }

  private static messageHash(message: any) {
    return TypedDataEncoder.from(
      (() => {
        const types = { ...message.types };
        delete types['EIP712Domain'];

        const primary = types[message.primaryType];
        if (!primary) {
          throw new Error(`Could not find  matching  primary type : ${message.primaryType}`);
        }

        delete types[message.primaryType];
        return {
          [message.primaryType]: primary,
          ...types,
        };
      })(),
    ).hash(message.message);
  }

  private async _getAccounts(
    closeTransport?: boolean,
  ): Promise<Array<AccountData & { hexAddress: string; path: string }>> {
    try {
      const defaultHdPath = "m/44'/60'/0'/0/0";
      const hdPaths = this.options.hdPaths ?? [defaultHdPath];

      const accounts: Array<AccountData & { hexAddress: string; path: string }> = [];
      const isEthAppOpen = await isAppOpen(this.transport, 'Ethereum');

      try {
        if (!isEthAppOpen) {
          const newTransport = await openApp(this.transport, 'Ethereum');
          if (this.transport) {
            await this.transport.close().catch(() => {});
          }

          const verifyAppOpen = await isAppOpen(newTransport, 'Ethereum');
          if (!verifyAppOpen) {
            throw new LedgerError(
              'Unable to open Ethereum App. Please check if your Ledger is connected and try again.',
            );
          }

          this.transport = newTransport;
          this.ledger = new EthereumApp(newTransport);
        }
      } catch (e) {
        if (e.message.includes('0x5501')) {
          throw new Error(declinedEthAppOpenError);
        }
      }

      for await (const hdPath of hdPaths) {
        const { address, publicKey } = await this.ledger.getAddress(hdPath ?? defaultHdPath);
        const addressBuffer = EthereumUtilsAddress.fromString(address).toBuffer();

        const bech32Address = bech32.encode(this.options.prefix ?? 'inj', bech32.toWords(addressBuffer));
        const compressedPubKey = Secp256k1.publicKeyConvert(Buffer.from(publicKey, 'hex'), true);

        const account = {
          address: bech32Address,
          algo: 'secp256k1' as Algo,
          pubkey: compressedPubKey,
          hexAddress: address,
          path: hdPath,
        };

        accounts.push(account);
      }

      if (closeTransport) {
        this.transport.close().catch(() => {});
      }

      return accounts;
    } catch (e) {
      this.transport.close().catch(() => {});
      throw handleError(e);
    }
  }

  async getAccounts(closeTransport?: boolean): Promise<Array<AccountData & { path: string }>> {
    const accounts = await this._getAccounts(closeTransport);
    return accounts;
  }

  async signAmino(signerAddress: string, signDoc: StdSignDoc) {
    try {
      const accounts = await this.getAccounts();
      const account = accounts?.find((account) => account.address === signerAddress);

      if (!account) throw new Error('Account not found');
      const message = Buffer.from(
        JSON.stringify({
          types: {},
          domain: {},
          primaryType: 'Tx',
          message: signDoc,
        }),
      );

      const splitSignature = await this.signEip712(signerAddress, message);
      const signature = bytes.arrayify(bytes.concat([splitSignature.r, splitSignature.s]));

      return {
        signed: signDoc,
        signature: encodeSecp256k1Signature(account.pubkey, signature),
      };
    } catch (e) {
      this.transport.close().catch(() => {});
      throw handleError(e);
    }
  }

  async sign(signerAddress: string, eipToSign: any) {
    try {
      await this.getAccount(signerAddress);
      return this.signEip712(signerAddress, eipToSign);
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }

  async getAccount(signerAddress: string) {
    try {
      const accounts = await this._getAccounts();
      const account = accounts?.find((account) => {
        if (isHexString(signerAddress)) {
          return account.hexAddress === signerAddress;
        }
        return account.address === signerAddress;
      });

      if (!account) throw new Error('Account not found');
      return account;
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }

  static formatSignature(signature: { v: number | string; r: string; s: string }) {
    return {
      r: `0x${signature.r}`,
      s: `0x${signature.s}`,
      v: signature.v,
    };
  }

  async signPersonalMessage(signerAddress: string, message: string | Uint8Array) {
    try {
      await this.getAccount(signerAddress);
      const defaultHdPath = "m/44'/60'/0'/0/0";
      const hdPath = this.options.hdPaths?.toString() ?? defaultHdPath;

      if (typeof message === 'string' && !message.startsWith('0x')) {
        message = `0x${message}`;
      }
      const messageHex = utils.hexlify(message);
      const signature = await this.ledger.signPersonalMessage(hdPath, messageHex.substring(2));
      return LeapLedgerSignerEth.formatSignature(signature);
    } catch (e) {
      throw handleError(e);
    } finally {
      await this.transport.close();
    }
  }

  async signMessage(message: utils.Bytes | string): Promise<string> {
    const leapLedgerSignerEthers = new LedgerSignerEthers(this, this.ledger, this.options.hdPaths[0], this.provider);
    const response = await leapLedgerSignerEthers.signMessage(message);

    return response;
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

      const signature = await this.ledger.signTransaction(hdPath, transaction, resolution);
      await this.transport.close();

      return LeapLedgerSignerEth.formatSignature(signature) as { r: string; s: string; v: number };
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }

  setProvider(provider: JsonRpcProvider) {
    this.provider = provider;
  }

  async sendTransaction(transactionRequest: TransactionRequest): Promise<TransactionResponse> {
    try {
      const ledgerSignerEthers = new LedgerSignerEthers(this, this.ledger, this.options.hdPaths[0], this.provider);
      const response = await ledgerSignerEthers.sendTransaction(transactionRequest);

      return response;
    } catch (e) {
      try {
        await this.transport.close();
      } catch (e) {
        // do nothing
      }
      throw handleError(e);
    }
  }

  async signEip712(signerAddress: string, message: any) {
    try {
      // This is just for validation
      await this.getAccount(signerAddress);

      const hdPath = this.options.hdPaths?.toString();
      const defaultHdPath = "m/44'/60'/0'/0/0";
      const domainHash = LeapLedgerSignerEth.domainHash(message);
      const messageHash = LeapLedgerSignerEth.messageHash(message);

      const result = await this.ledger.signEIP712HashedMessage(hdPath ?? defaultHdPath, domainHash, messageHash);
      setTimeout(async () => {
        await this.transport.close();
      }, 1000);

      return LeapLedgerSignerEth.formatSignature(result);
    } catch (e) {
      await this.transport.close();
      throw handleError(e);
    }
  }
}

export async function isLedgerUnlocked(appName: 'Cosmos' | 'Ethereum', revokePermission?: boolean) {
  if (revokePermission) {
    await revokeHIDPermissions();
  }
  let transport;

  try {
    transport = await getLedgerTransport();

    if (appName === 'Cosmos') {
      const cosmosApp = new CosmosApp(transport);
      const response = await cosmosApp.appInfo();

      return response.error_message === 'No errors';
    } else {
      const ethApp = new EthereumApp(transport);
      await ethApp.getAppConfiguration();

      return true;
    }
  } catch (e) {
    if (e.message.includes('Unable to connect to Ledger device')) {
      return false;
    }
    if (!e.message.includes(ledgerLockedError)) {
      return true;
    }

    return false;
  } finally {
    transport?.close();
  }
}

export async function importLedgerAccount(
  indexes: Array<number>,
  useEthApp: boolean = false,
  primaryChain: SupportedChain,
  chainsToImport: SupportedChain[],
  chainInfos: Record<SupportedChain, ChainInfo>,
  customDerivationPath: string[] = [],
  useCompassSeiApp: boolean = false,
) {
  let transport;

  try {
    const cosmosDefaultChain = 'cosmos';
    const ethDefaultChain = 'injective';
    const compassSeiDefaultChain = 'seiTestnet2';

    const addressIndexes = indexes ?? [0, 1, 2, 3];
    transport = await getLedgerTransport();

    const getHdPaths = (addressIndexes: Array<number>, coinType: string) => {
      return addressIndexes.map((adIdx) => `m/44'/${coinType}'/0'/0/${adIdx}`);
    };

    const getHdCustomPaths = (customDerivationPath: Array<string>, coinType: string) => {
      return customDerivationPath.map((path) => `m/44'/${coinType}'/${path}`);
    };

    const getPaths = (coinType: string) => [
      ...getHdPaths(addressIndexes, coinType),
      ...getHdCustomPaths(customDerivationPath, coinType),
    ];

    let primaryChainAccount;

    if (useCompassSeiApp) {
      const compassSeiLedgerSigner = new CompassSeiLedgerSigner(transport, {
        hdPaths: getHdPaths(addressIndexes, '60'),
        prefix: chainInfos[primaryChain ?? compassSeiDefaultChain].addressPrefix,
      });
      primaryChainAccount = await compassSeiLedgerSigner.getAccounts(true);
    } else if (useEthApp) {
      const ethLedgerSigner = new LeapLedgerSignerEth(transport, {
        prefix: chainInfos[primaryChain ?? ethDefaultChain].addressPrefix,
        hdPaths: getPaths('60'),
      });
      primaryChainAccount = await ethLedgerSigner.getAccounts(true);
    } else {
      const ledgerSigner = new LeapLedgerSigner(transport, {
        prefix: chainInfos[primaryChain ?? cosmosDefaultChain].addressPrefix,
        hdPaths: getPaths('118'),
      });
      primaryChainAccount = await ledgerSigner.getAccounts(true);
    }

    const chainWiseAddresses: Record<string, Array<{ address: string; pubKey: Uint8Array }>> = {};
    let pathWiseAddresses: Record<string, Record<string, { address: string; pubKey: Uint8Array }>> = {};
    let enabledChains: Array<any> = [];

    if (useEthApp) {
      enabledChains = Object.entries(chainInfos).filter(
        (chain) =>
          chain[1].enabled && chain[1].bip44.coinType === '60' && chainsToImport.includes(chain[0] as SupportedChain),
      );
    } else {
      enabledChains = Object.entries(chainInfos).filter(
        (chain) =>
          chain[1].enabled &&
          chain[1].bip44.coinType !== '60' &&
          chain[1].bip44.coinType !== '931' &&
          chain[1].bip44.coinType !== '0' &&
          chain[1].bip44.coinType !== '1' &&
          chain[1].bip44.coinType !== '637' &&
          chain[1].bip44.coinType !== '501' &&
          chain[1].bip44.coinType !== '784',
      );
    }

    for (const chainEntries of enabledChains) {
      const [chain, chainInfo] = chainEntries;

      for (const account of primaryChainAccount) {
        const pubKey = account.pubkey;
        const path = account.path;
        const shortPath = path
          .split('/')
          .slice(3, path.length - 1)
          .join('/');
        const address = useEthApp
          ? convertEvmChainAddress(account.address, chainInfo.addressPrefix)
          : pubkeyToAddress(encodeSecp256k1Pubkey(pubKey), chainInfo.addressPrefix);

        pathWiseAddresses = {
          ...pathWiseAddresses,
          [shortPath]: {
            ...pathWiseAddresses[shortPath],
            [chain]: { address, pubKey },
          },
        };

        if (chainWiseAddresses[chain]) {
          chainWiseAddresses[chain].push({ address, pubKey });
        } else {
          chainWiseAddresses[chain] = [{ address, pubKey }];
        }
      }
    }

    return { primaryChainAccount, chainWiseAddresses, pathWiseAddresses };
  } catch (e) {
    transport = undefined;
    if (e.message.includes(bolosErrorMessage)) {
      throw bolosError;
    }

    if (e.message.includes(ledgerDisconnectMessage)) {
      throw deviceDisconnectedError;
    }

    if (e.message.includes(ledgerLockedError)) {
      throw deviceLockedError;
    }

    throw new LedgerError(e.message);
  }
}

export async function importLedgerAccountV2(
  app: LedgerAppId,
  indexes: Array<number>,
  customDerivationPath: string[] = [],
  chainConfig: {
    primaryChain: SupportedChain;
    chainsToImport: SupportedChain[];
    chainInfos: Record<SupportedChain, { addressPrefix: string; enabled: boolean; coinType: string }>;
  },
) {
  let transport;

  try {
    const cosmosDefaultChain = 'cosmos';
    const ethDefaultChain = 'injective';
    const compassSeiDefaultChain = 'seiTestnet2';

    const addressIndexes = indexes ?? [0, 1, 2, 3];
    transport = await getLedgerTransport();

    const getHdPaths = (addressIndexes: Array<number>, coinType: string) => {
      return addressIndexes.map((adIdx) => `m/44'/${coinType}'/0'/0/${adIdx}`);
    };

    const getHdCustomPaths = (customDerivationPath: Array<string>, coinType: string) => {
      return customDerivationPath.map((path) => `m/44'/${coinType}'/${path}`);
    };

    const getPaths = (coinType: string) => [
      ...getHdPaths(addressIndexes, coinType),
      ...getHdCustomPaths(customDerivationPath, coinType),
    ];

    let primaryChainAccount;

    const { chainInfos, primaryChain, chainsToImport } = chainConfig;

    if (app === 'sei') {
      const compassSeiLedgerSigner = new CompassSeiLedgerSigner(transport, {
        hdPaths: getPaths('60'),
        prefix: chainInfos[primaryChain ?? compassSeiDefaultChain].addressPrefix,
      });
      primaryChainAccount = await compassSeiLedgerSigner.getAccounts(true);
    } else if (app === 'eth') {
      const ethLedgerSigner = new LeapLedgerSignerEth(transport, {
        prefix: chainInfos[primaryChain ?? ethDefaultChain].addressPrefix,
        hdPaths: getPaths('60'),
      });
      primaryChainAccount = await ethLedgerSigner.getAccounts(true);
    } else {
      const ledgerSigner = new LeapLedgerSigner(transport, {
        prefix: chainInfos[primaryChain ?? cosmosDefaultChain].addressPrefix,
        hdPaths: getPaths('118'),
      });
      primaryChainAccount = await ledgerSigner.getAccounts(true);
    }

    const chainWiseAddresses: Record<string, Array<{ address: string; pubKey: Uint8Array }>> = {};
    let pathWiseAddresses: Record<string, Record<string, { address: string; pubKey: Uint8Array }>> = {};
    let enabledChains: Array<any> = [];

    if (app === 'eth') {
      enabledChains = Object.entries(chainInfos).filter(
        (chain) =>
          chain[1].enabled && chain[1].coinType === '60' && chainsToImport.includes(chain[0] as SupportedChain),
      );
    } else {
      enabledChains = Object.entries(chainInfos).filter(
        (chain) =>
          chain[1].enabled &&
          chain[1].coinType !== '60' &&
          chain[1].coinType !== '931' &&
          chain[1].coinType !== '0' &&
          chain[1].coinType !== '1' &&
          chain[1].coinType !== '637' &&
          chain[1].coinType !== '501' &&
          chain[1].coinType !== '784',
      );
    }

    for (const chainEntries of enabledChains) {
      const [chain, chainInfo] = chainEntries;

      for (const account of primaryChainAccount) {
        const pubKey = account.pubkey;
        const path = account.path;
        const shortPath = path
          .split('/')
          .slice(3, path.length - 1)
          .join('/');
        const address =
          app === 'eth'
            ? convertEvmChainAddress(account.address, chainInfo.addressPrefix)
            : pubkeyToAddress(encodeSecp256k1Pubkey(pubKey), chainInfo.addressPrefix);

        pathWiseAddresses = {
          ...pathWiseAddresses,
          [shortPath]: {
            ...pathWiseAddresses[shortPath],
            [chain]: { address, pubKey },
          },
        };

        if (chainWiseAddresses[chain]) {
          chainWiseAddresses[chain].push({ address, pubKey });
        } else {
          chainWiseAddresses[chain] = [{ address, pubKey }];
        }
      }
    }

    return { primaryChainAccount, chainWiseAddresses, pathWiseAddresses };
  } catch (e) {
    transport = undefined;
    if (e.message.includes(bolosErrorMessage)) {
      throw bolosError;
    }

    if (e.message.includes(ledgerDisconnectMessage)) {
      throw deviceDisconnectedError;
    }

    if (e.message.includes(ledgerLockedError)) {
      throw deviceLockedError;
    }

    throw new LedgerError(e.message);
  }
}

function convertEvmChainAddress(address: string, prefix: string) {
  const ethAddress = getEthereumAddress(address);
  return getBech32Address(prefix, ethAddress);
}
