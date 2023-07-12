import { AminoSignResponse, StdSignDoc } from '@cosmjs/amino';
import { arrayify, concat, splitSignature } from '@ethersproject/bytes';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { serialize } from '@ethersproject/transactions';
import { encodeSecp256k1Pubkey, EthWallet } from '@leapwallet/leap-keychain';
import { keccak256 } from 'ethereumjs-util';

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

export async function ethSign(
  signerAddress: string,
  wallet: EthWallet,
  signDoc: StdSignDoc,
  type: EthSignType,
): Promise<AminoSignResponse> {
  const accounts = wallet.getAccounts();
  const pubKey = accounts[0].pubkey;

  const signBytes = Buffer.from(signDoc.msgs[0].value.data, 'base64');

  if (type === 'message') {
    const tx = concat([
      Buffer.from('\x19Ethereum Signed Message:\n'),
      Buffer.from(signBytes.length.toString()),
      signBytes,
    ]);

    const hash = keccak256(Buffer.from(tx));

    const signature = wallet.sign(signerAddress, hash);

    const formattedSignature = concat([signature.r, signature.s, Buffer.from('1b', 'hex')]);
    return {
      signed: signDoc,
      signature: {
        pub_key: encodeSecp256k1Pubkey(pubKey),
        signature: Buffer.from(formattedSignature).toString('base64'),
      },
    };
  } else if (type === 'transaction') {
    const tx = JSON.parse(Buffer.from(signBytes).toString());
    const hash = keccak256(Buffer.from(serialize(tx).replace('0x', ''), 'hex'));
    const signature = wallet.sign(signerAddress, hash);

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
  } else if (type === 'eip-712') {
    const messageBuffer = Buffer.from(signBytes).toString();
    const data = await EIP712MessageValidator.validateAsync(JSON.parse(messageBuffer));
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

    const rawSignature = wallet.sign(signerAddress, hash);

    const signature = Buffer.concat([
      Buffer.from(rawSignature.r.replace('0x', ''), 'hex'),
      Buffer.from(rawSignature.s.replace('0x', ''), 'hex'),
      rawSignature.v ? Buffer.from('1c', 'hex') : Buffer.from('1b', 'hex'),
    ]);
    return {
      signed: signDoc,
      signature: {
        pub_key: encodeSecp256k1Pubkey(pubKey),
        signature: Buffer.from(arrayify(signature)).toString('base64'),
      },
    };
  }

  throw new Error('Invalid sign type');
}
