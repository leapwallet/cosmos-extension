import { Interface } from '@ethersproject/abi';
import { arrayify, Signature } from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { formatEther, parseEther } from '@ethersproject/units';
import { formatUnits } from '@ethersproject/units';
import { EthWallet } from '@leapwallet/leap-keychain';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { hashPersonalMessage, isHexString, stripHexPrefix, toBuffer, toRpcSig } from 'ethereumjs-util';

import { abiERC20, abiERC721, abiERC1155, abiPointerView } from '../constants';
import { LeapKeystoneSignerEth } from '../keystone';
import { CompassSeiLedgerSigner, LeapLedgerSignerEth } from '../ledger';

const erc20Interface = new Interface(abiERC20);
const erc721Interface = new Interface(abiERC721);
const erc1155Interface = new Interface(abiERC1155);

export function parseStandardTokenTransactionData(data: string) {
  try {
    return erc20Interface.parseTransaction({ data });
  } catch {
    // ignore and next try to parse with erc721 ABI
  }

  try {
    return erc721Interface.parseTransaction({ data });
  } catch {
    // ignore and next try to parse with erc1155 ABI
  }

  try {
    return erc1155Interface.parseTransaction({ data });
  } catch {
    // ignore and return undefined
  }

  return undefined;
}

export function parseEtherValue(value: string) {
  return parseEther(value).toString();
}

export function formatEtherValue(value: string) {
  return formatEther(value);
}

export function formatEtherUnits(value: string, decimals: number) {
  return formatUnits(value, decimals);
}

export function trimLeadingZeroes(value: string, isHex?: boolean) {
  function removeLeadingZeroes(value: string) {
    return value.replace(/^0+/, '');
  }

  if (isHex && value.toLowerCase().startsWith('0x')) {
    value = value.slice(2);
    return `0x${removeLeadingZeroes(value)}`;
  }

  return removeLeadingZeroes(value);
}

export async function getErc20TokenDetails(contractAddress: string, rpcUrl: string, chainId: number) {
  const provider = new JsonRpcProvider(rpcUrl, chainId);
  const contract = new Contract(contractAddress, abiERC20, provider);

  const [name, symbol, decimals] = await Promise.all([contract.name(), contract.symbol(), contract.decimals()]);
  return { name, symbol, decimals: Number(decimals) };
}

export async function getErc721TokenDetails(contractAddress: string, rpcUrl: string, chainId: number) {
  const provider = new JsonRpcProvider(rpcUrl, chainId);
  const contract = new Contract(contractAddress, abiERC721, provider);
  const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
  return { name, symbol };
}

export async function getCw20Pointer(contractAddress: string, rpcUrl: string, chainId: number) {
  const provider = new JsonRpcProvider(rpcUrl, chainId);
  const contract = new Contract('0x000000000000000000000000000000000000100A', abiPointerView, provider);
  const pointer = await contract.getCW20Pointer(contractAddress);
  return pointer;
}

export async function getCw721Pointer(contractAddress: string, rpcUrl: string, chainId: number) {
  const provider = new JsonRpcProvider(rpcUrl, chainId);
  const contract = new Contract('0x000000000000000000000000000000000000100A', abiPointerView, provider);
  const pointer = await contract.getCW721Pointer(contractAddress);
  return pointer;
}

export async function getNativePointer(contractAddress: string, rpcUrl: string, chainId: number) {
  const provider = new JsonRpcProvider(rpcUrl, chainId);
  const contract = new Contract('0x000000000000000000000000000000000000100A', abiPointerView, provider);
  const pointer = await contract.getNativePointer(contractAddress);
  return pointer;
}

export function encodedUtf8HexToText(hexValue: string) {
  try {
    const strippedHexValue = stripHexPrefix(hexValue);
    const hexBuffer = Buffer.from(strippedHexValue, 'hex');
    return hexBuffer.length === 32 ? hexBuffer : hexBuffer.toString('utf8');
  } catch (_) {
    return hexValue;
  }
}

export async function personalSign(
  data: string,
  signerAddress: string,
  wallet: EthWallet | LeapLedgerSignerEth | LeapKeystoneSignerEth | CompassSeiLedgerSigner,
) {
  let signature: Signature;

  if (wallet instanceof LeapLedgerSignerEth || wallet instanceof CompassSeiLedgerSigner) {
    signature = (await wallet.signPersonalMessage(signerAddress, data)) as unknown as Signature;
  } else if (wallet instanceof LeapKeystoneSignerEth || wallet.constructor.name === 'LeapKeystoneSignerEth') {
    const _wallet = wallet as LeapKeystoneSignerEth;
    signature = (await _wallet.signPersonalMessage(signerAddress, data)) as unknown as Signature;
  } else {
    const message = isHexString(data) ? toBuffer(data) : Buffer.from(data);
    const msgHash = hashPersonalMessage(message);
    signature = wallet.sign(signerAddress, msgHash);
  }

  const v = typeof signature.v === 'string' ? parseInt(signature.v, 16) : signature.v;
  // Normalize v to either 27 or 28
  const normalizedV = v === 0 || v === 27 ? 27 : 28;

  const rpcSigArgs = {
    v: normalizedV,
    r: Buffer.from(arrayify(signature.r)),
    s: Buffer.from(arrayify(signature.s)),
  };
  const rpcSignature = toRpcSig(rpcSigArgs.v, rpcSigArgs.r, rpcSigArgs.s);
  return rpcSignature;
}

export async function signTypedData(
  data: any,
  signerAddress: string,
  wallet: EthWallet | LeapLedgerSignerEth | LeapKeystoneSignerEth,
) {
  let signature: Signature;

  if (wallet instanceof LeapLedgerSignerEth || wallet instanceof CompassSeiLedgerSigner) {
    signature = (await wallet.signEip712(signerAddress, data)) as unknown as Signature;
  } else if (wallet instanceof LeapKeystoneSignerEth || wallet.constructor.name === 'LeapKeystoneSignerEth') {
    const _wallet = wallet as LeapKeystoneSignerEth;
    signature = (await _wallet.signEip712(signerAddress, data)) as unknown as Signature;
  } else {
    const messageHash = TypedDataUtils.eip712Hash(data, SignTypedDataVersion.V4);
    signature = wallet.sign(signerAddress, messageHash);
  }

  const rpcSigArgs = {
    v: signature.v,
    r: Buffer.from(arrayify(signature.r)),
    s: Buffer.from(arrayify(signature.s)),
  };
  const rpcSignature = toRpcSig(rpcSigArgs.v, rpcSigArgs.r, rpcSigArgs.s);
  return rpcSignature;
}

export function getFetchParams(
  params: unknown[],
  ethMethod: string,
  method: 'POST' | string = 'POST',
  headers: { [key: string]: unknown } = {},
) {
  return {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: ethMethod,
      params: [...params],
    }),
  };
}

export async function getNftContractInfo(contractAddress: string, rpcUrl: string) {
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(contractAddress, abiERC721, provider);
  const name = await contract.name();
  return { name };
}

export async function getNftBalanceCount(contractAddress: string, ownerAddress: string, rpcUrl: string) {
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(contractAddress, abiERC721, provider);
  const balance = await contract.balanceOf(ownerAddress);
  return balance.toString();
}

export async function getNftTokenIdInfo(
  contractAddress: string,
  tokenId: string,
  walletAddress: string,
  rpcUrl: string,
) {
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(contractAddress, abiERC721, provider);

  const ownerOf = await contract.ownerOf(tokenId);
  if (ownerOf.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error('Token does not belong to the wallet');
  }

  const tokenURI = await contract.tokenURI(tokenId);
  return { tokenURI };
}

export function encodeErc72TransferData(params: string[]) {
  const data = erc721Interface.encodeFunctionData('transferFrom', params);
  return data;
}
