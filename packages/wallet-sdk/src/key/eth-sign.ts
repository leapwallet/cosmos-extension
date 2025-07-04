import { AminoSignResponse, StdSignDoc } from '@cosmjs/amino';
import { arrayify, concat } from '@ethersproject/bytes';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { serialize } from '@ethersproject/transactions';
import { encodeSecp256k1Pubkey, EthWallet } from '@leapwallet/leap-keychain';
import { keccak256 } from 'ethereumjs-util';

import { LeapKeystoneSignerEth } from '../keystone';
import { LeapLedgerSignerEth } from '../ledger';
import { EIP712MessageValidator } from '../utils/eip-712-validator';

export type EthSignType = 'message' | 'transaction' | 'eip-712';

export const domainHash = (message: {
  types: Record<string, { name: string; type: string }[]>;
  domain: Record<string, any>;
}): string =>
  _TypedDataEncoder.hashStruct('EIP712Domain', { EIP712Domain: message.types.EIP712Domain }, message.domain);

export const messageHash = (message: {
  types: Record<string, { name: string; type: string }[]>;
  primaryType: string;
  message: Record<string, unknown>;
}): string =>
  _TypedDataEncoder
    .from(
      (() => {
        const types = { ...message.types };

        delete types['EIP712Domain'];

        const primary = types[message.primaryType];

        if (!primary) {
          throw new Error(`No matched primary type: ${message.primaryType}`);
        }

        delete types[message.primaryType];

        return {
          [message.primaryType]: primary,
          ...types,
        };
      })(),
    )
    .hash(message.message);

export async function ethSignEip712(
  signerAddress: string,
  wallet: EthWallet | LeapLedgerSignerEth,
  signDoc: StdSignDoc,
  eip712: {
    types: Record<string, { name: string; type: string }[] | undefined>;
    domain: Record<string, any>;
    primaryType: string;
  },
) {
  const accounts = await wallet.getAccounts();
  const pubKey = accounts[0].pubkey;
  const signBytes = Buffer.from(
    JSON.stringify({
      types: eip712.types,
      domain: eip712.domain,
      primaryType: eip712.primaryType,
      message: signDoc,
    }),
  );

  return signEip712Tx(signerAddress, pubKey, wallet, signBytes, signDoc);
}

function ethSignatureToBytes(signature: { v: number | string; r: string; s: string }): string {
  const v = typeof signature.v === 'string' ? parseInt(signature.v, 16) : signature.v;

  return Buffer.from(
    concat([signature.r, signature.s, Buffer.from([v === 0 || (v !== 1 && v % 2 === 1) ? 27 : 28])]),
  ).toString('base64');
}

export async function ethSign(
  signerAddress: string,
  wallet: EthWallet | LeapLedgerSignerEth | LeapKeystoneSignerEth,
  signDoc: StdSignDoc,
  type: EthSignType,
): Promise<AminoSignResponse> {
  const accounts = await wallet.getAccounts();
  const pubKey = accounts[0].pubkey;

  const signBytes = Buffer.from(signDoc.msgs[0].value.data, 'base64');
  if (type === 'message') {
    if (wallet instanceof LeapKeystoneSignerEth || wallet?.constructor?.name === 'LeapKeystoneSignerEth') {
      const _wallet = wallet as LeapKeystoneSignerEth;
      const signature = await _wallet.signPersonalMessage(signerAddress, Buffer.from(signBytes).toString('hex'));
      const formattedSignature = concat([
        signature.r,
        signature.s,
        signature.v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
      ]);
      return {
        signed: signDoc,
        signature: {
          pub_key: encodeSecp256k1Pubkey(pubKey),
          signature: Buffer.from(formattedSignature).toString('base64'),
        },
      };
    }

    const tx = concat([
      Buffer.from('\x19Ethereum Signed Message:\n'),
      Buffer.from(signBytes.length.toString()),
      signBytes,
    ]);

    const hash = keccak256(Buffer.from(tx));
    if (wallet instanceof LeapLedgerSignerEth || wallet?.constructor?.name === 'LeapLedgerSignerEth') {
      const signature = await (wallet as LeapLedgerSignerEth).signPersonalMessage(
        signerAddress,
        Buffer.from(signBytes).toString('hex'),
      );
      const formattedSignature = ethSignatureToBytes(signature);
      return {
        signed: signDoc,
        signature: {
          pub_key: encodeSecp256k1Pubkey(pubKey),
          signature: formattedSignature,
        },
      };
    }

    const signature = await wallet.sign(signerAddress, hash);
    const v = Number(signature.v) - 27;

    const formattedSignature = concat([
      signature.r,
      signature.s,
      v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
    ]);
    return {
      signed: signDoc,
      signature: {
        pub_key: encodeSecp256k1Pubkey(pubKey),
        signature: Buffer.from(formattedSignature).toString('base64'),
      },
    };
  } else if (type === 'transaction') {
    const tx = JSON.parse(Buffer.from(signBytes).toString());
    if (wallet instanceof LeapLedgerSignerEth || wallet?.constructor?.name === 'LeapLedgerSignerEth') {
      const signature = await (wallet as LeapLedgerSignerEth).signTransaction(
        signerAddress,
        serialize(tx).replace('0x', ''),
      );
      const formattedSignature = concat([
        signature.r,
        signature.s,
        signature.v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
      ]);
      return {
        signed: signDoc,
        signature: {
          pub_key: encodeSecp256k1Pubkey(pubKey),
          signature: Buffer.from(formattedSignature).toString('base64'),
        },
      };
    }
    if (wallet instanceof LeapKeystoneSignerEth || wallet.constructor.name === 'LeapKeystoneSignerEth') {
      const _wallet = wallet as LeapKeystoneSignerEth;
      const signature = await _wallet.signTransaction(signerAddress, serialize(tx).replace('0x', ''));
      const formattedSignature = concat([
        signature.r,
        signature.s,
        signature.v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
      ]);
      return {
        signed: signDoc,
        signature: {
          pub_key: encodeSecp256k1Pubkey(pubKey),
          signature: Buffer.from(formattedSignature).toString('base64'),
        },
      };
    }

    const hash = keccak256(Buffer.from(serialize(tx).replace('0x', ''), 'hex'));
    const signature = await wallet.sign(signerAddress, hash);
    const v = Number(signature.v) - 27;

    const formattedSignature = concat([
      signature.r,
      signature.s,
      v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
    ]);

    return {
      signed: signDoc,
      signature: {
        pub_key: encodeSecp256k1Pubkey(pubKey),
        signature: Buffer.from(formattedSignature).toString('base64'),
      },
    };
  } else if (type === 'eip-712') {
    return signEip712Tx(signerAddress, pubKey, wallet, signBytes, signDoc);
  }

  throw new Error('Invalid sign type');
}

async function signEip712Tx(
  signerAddress: string,
  pubKey: Uint8Array,
  wallet: EthWallet | LeapLedgerSignerEth | LeapKeystoneSignerEth,
  signBytes: Buffer,
  signDoc: StdSignDoc,
): Promise<AminoSignResponse> {
  const messageBuffer = Buffer.from(signBytes).toString();
  const data = await EIP712MessageValidator.validateAsync(JSON.parse(messageBuffer));

  if (wallet instanceof LeapKeystoneSignerEth || wallet.constructor.name === 'LeapKeystoneSignerEth') {
    const _wallet = wallet as LeapKeystoneSignerEth;
    const signature = await _wallet.signEip712(signerAddress, data);
    const formattedSignature = concat([
      signature.r,
      signature.s,
      signature.v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
    ]);
    return {
      signed: signDoc,
      signature: {
        pub_key: encodeSecp256k1Pubkey(pubKey),
        signature: Buffer.from(formattedSignature).toString('base64'),
      },
    };
  }

  if (wallet instanceof LeapLedgerSignerEth || wallet?.constructor?.name === 'LeapLedgerSignerEth') {
    const signature = await (wallet as LeapLedgerSignerEth).signEip712(signerAddress, data);
    const formattedSignature = concat([
      signature.r,
      signature.s,
      signature.v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
    ]);
    return {
      signed: signDoc,
      signature: {
        pub_key: encodeSecp256k1Pubkey(pubKey),
        signature: Buffer.from(formattedSignature).toString('base64'),
      },
    };
  }
  const hash = keccak256(
    Buffer.concat([
      Buffer.from('19', 'hex'),
      Buffer.from('01', 'hex'),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Buffer.from(domainHash(data).replace('0x', ''), 'hex'),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Buffer.from(messageHash(data).replace('0x', ''), 'hex'),
    ]),
  );

  const rawSignature = await wallet.sign(signerAddress, hash);
  const v = Number(rawSignature.v) - 27;

  const signature = Buffer.concat([
    Buffer.from(rawSignature.r.replace('0x', ''), 'hex'),
    Buffer.from(rawSignature.s.replace('0x', ''), 'hex'),
    v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
  ]);
  return {
    signed: signDoc,
    signature: {
      pub_key: encodeSecp256k1Pubkey(pubKey),
      signature: Buffer.from(arrayify(signature)).toString('base64'),
    },
  };
}
