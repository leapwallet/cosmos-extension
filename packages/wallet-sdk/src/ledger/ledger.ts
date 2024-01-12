import {
  AccountData,
  AminoSignResponse,
  encodeSecp256k1Pubkey,
  makeCosmoshubPath,
  pubkeyToAddress,
  StdSignDoc,
} from '@cosmjs/amino';
import { HdPath } from '@cosmjs/crypto';
import { AddressAndPubkey, LedgerSigner } from '@cosmjs/ledger-amino';
import { LedgerConnectorOptions } from '@cosmjs/ledger-amino/build/ledgerconnector';
import Transport from '@ledgerhq/hw-transport';

import { ChainInfos, SupportedChain } from '../constants';
import {
  bolosError,
  bolosErrorMessage,
  deviceDisconnectedError,
  deviceLockedError,
  ledgerDisconnectMessage,
  LedgerError,
  ledgerLockedError,
  transactionDeclinedError,
  txDeclinedErrorUser,
} from './ledger-errors';

const isWindows = () => navigator.platform.indexOf('Win') > -1;

let transport: Transport | undefined;

export async function getLedgerTransport() {
  if (transport) {
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
    const TransportWebUsb = (await import('@ledgerhq/hw-transport-webusb')).default;
    try {
      transport = await TransportWebUsb.create();
    } catch (e) {
      throw new LedgerError(
        'Unable to connect to Ledger device. Please check if your Ledger is connected and try again.',
      );
    }
  }
  transport.setExchangeTimeout(60_000);
  return transport;
}

export class LeapLedgerSigner extends LedgerSigner {
  constructor(transport: Transport, options: LedgerConnectorOptions) {
    super(transport, options);
  }

  handleError(e: any) {
    transport = undefined;
    if (e.message.includes(bolosErrorMessage)) {
      return bolosError;
    } else if (e.message.includes(ledgerDisconnectMessage)) {
      return deviceDisconnectedError;
    } else if (e.message.includes(ledgerLockedError)) {
      throw deviceLockedError;
    } else if (e.message === transactionDeclinedError.message) {
      return txDeclinedErrorUser;
    } else {
      return new LedgerError(e.message.toString());
    }
  }

  async getAccounts(): Promise<readonly AccountData[]> {
    try {
      return await super.getAccounts();
    } catch (e) {
      throw this.handleError(e);
    }
  }

  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    try {
      return await super.signAmino(signerAddress, signDoc);
    } catch (e) {
      throw this.handleError(e);
    }
  }

  async showAddress(path?: HdPath): Promise<AddressAndPubkey> {
    try {
      return await super.showAddress(path);
    } catch (e) {
      throw this.handleError(e);
    }
  }
}

// TODO:- enable it when implementing ledger for evm chains

/**
 * 
 * export class LeapLedgerSignerEth {
  private readonly ledger: EthereumApp;
  private readonly options: {
    hdPaths: [string];
    prefix: string;
  };

  constructor(transport: Transport, options: { hdPaths: [string]; prefix: string }) {
    this.ledger = new EthereumApp(transport);
    this.options = options;
  }

  private static domainHash(message: any) {
    return TypedDataUtils.hashStruct('EIP712Domain', message, message.types, true);
  }

  private static messageHash(message: any) {
    return TypedDataUtils.hashStruct(message.primaryType, message.message, message.types, true);
  }

  async getAccounts(): Promise<readonly AccountData[]> {
    const hdPath = this.options.hdPaths?.toString();
    const defaultHdPath = "m/44'/60'/0'/0/0";
    const { address, publicKey } = await this.ledger.getAddress(hdPath ?? defaultHdPath);
    const addressBuffer = EthereumUtilsAddress.fromString(address).toBuffer();
    const bech32Address = bech32.encode(this.options.prefix ?? 'inj', bech32.toWords(addressBuffer));

    return [
      {
        address: bech32Address,
        algo: 'secp256k1',
        pubkey: Buffer.from(publicKey),
      },
    ];
  }

  async signEpi712(message: EIP712Message) {
    const hdPath = this.options.hdPaths?.toString();
    const defaultHdPath = "m/44'/60'/0'/0/0";
    const result = await this.ledger.signEIP712HashedMessage(
      hdPath ?? defaultHdPath,
      bufferToHex(LeapLedgerSignerEth.domainHash(message)),
      bufferToHex(LeapLedgerSignerEth.messageHash(message)),
    );
    const combined = `${result.r}${result.s}${result.v.toString(16)}`;
    return combined.startsWith('0x') ? combined : `0x${combined}`;
  }
}
*/

export async function importLedgerAccount(indexes?: Array<number>, primaryChain?: SupportedChain) {
  try {
    const addressIndexes = indexes ?? [0, 1, 2, 3];
    const transport = await getLedgerTransport();
    const hdPaths = addressIndexes.map((adIdx) => makeCosmoshubPath(adIdx));
    const ledgerSigner = new LeapLedgerSigner(transport, {
      hdPaths,
      prefix: ChainInfos[primaryChain ?? 'cosmos'].addressPrefix,
    });

    const primaryChainAccount = await ledgerSigner.getAccounts();
    const chainWiseAddresses: Record<string, Array<{ address: string; pubKey: Uint8Array }>> = {};
    const enabledChains = Object.entries(ChainInfos).filter(
      (chain) => chain[1].enabled && chain[1].bip44.coinType !== '60' && chain[1].bip44.coinType !== '931',
    );
    for (const chainEntries of enabledChains) {
      const [chain, chainInfo] = chainEntries;
      for (const account of primaryChainAccount) {
        const pubKey = account.pubkey;
        const address = pubkeyToAddress(encodeSecp256k1Pubkey(pubKey), chainInfo.addressPrefix);
        if (chainWiseAddresses[chain]) {
          chainWiseAddresses[chain].push({ address, pubKey });
        } else {
          chainWiseAddresses[chain] = [{ address, pubKey }];
        }
      }
    }

    await transport.close();
    return { primaryChainAccount, chainWiseAddresses };
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
