import { Interface } from '@ethersproject/abi';
import { arrayify } from '@ethersproject/bytes';
import { formatEther, parseEther } from '@ethersproject/units';
import { EthWallet } from '@leapwallet/leap-keychain';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { hashPersonalMessage, isHexString, stripHexPrefix, toBuffer, toRpcSig } from 'ethereumjs-util';
import { Contract, ethers } from 'ethers';

import { abiERC20, abiERC721, abiERC1155, ARCTIC_ETH_CHAIN_ID, ARCTIC_EVM_RPC_URL } from '../constants';

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
  return ethers.utils.formatUnits(value, decimals);
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

export async function getErc20TokenDetails(contractAddress: string) {
  const provider = new ethers.providers.JsonRpcProvider(ARCTIC_EVM_RPC_URL, ARCTIC_ETH_CHAIN_ID);
  const contract = new Contract(contractAddress, abiERC20, provider);
  const [name, symbol, decimals] = await Promise.all([contract.name(), contract.symbol(), contract.decimals()]);
  return { name, symbol, decimals: Number(decimals) };
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

export function personalSign(data: string, signerAddress: string, wallet: EthWallet) {
  const message = isHexString(data) ? toBuffer(data) : Buffer.from(data);
  const msgHash = hashPersonalMessage(message);
  const signature = wallet.sign(signerAddress, msgHash);

  const rpcSigArgs = {
    v: signature.v,
    r: Buffer.from(arrayify(signature.r)),
    s: Buffer.from(arrayify(signature.s)),
  };
  const rpcSignature = toRpcSig(rpcSigArgs.v, rpcSigArgs.r, rpcSigArgs.s);
  return rpcSignature;
}

export function signTypedData(data: any, signerAddress: string, wallet: EthWallet) {
  const messageHash = TypedDataUtils.eip712Hash(data, SignTypedDataVersion.V4);
  const signature = wallet.sign(signerAddress, messageHash);

  const rpcSigArgs = {
    v: signature.v,
    r: Buffer.from(arrayify(signature.r)),
    s: Buffer.from(arrayify(signature.s)),
  };
  const rpcSignature = toRpcSig(rpcSigArgs.v, rpcSigArgs.r, rpcSigArgs.s);
  return rpcSignature;
}
