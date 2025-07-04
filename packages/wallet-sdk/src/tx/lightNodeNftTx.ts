import { concat } from '@ethersproject/bytes';
import { serialize } from '@ethersproject/transactions';
import { EthWallet } from '@leapwallet/leap-keychain';
import axios from 'axios';
import { bech32 } from 'bech32';
import { keccak256 } from 'ethereumjs-util';
import { ethers } from 'ethers';
import { Dict } from 'types';

import { SupportedChain } from '../constants';
import { getBaseURL } from '../globals';
import { axiosWrapper } from '../healthy-nodes';
import { LeapLedgerSignerEth } from '../ledger';
import { LEAP_LIGHT_NODE_ABI } from './leap-ln-abi';
import { SeiEvmTx } from './seiEvmTx';

const CHAIN_ID = 984122;
const CONTRACT_ADDRESS = '0xd4368164DEb9Dc170FC27FeAd657192EEe4eA57c';
const RPC_URL = 'https://rpc.forma.art';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const leapLNContract = new ethers.Contract(CONTRACT_ADDRESS, LEAP_LIGHT_NODE_ABI, provider);
const IPFS_GATEWAY = 'https://ipfs.forma.art/ipfs/';

export function bech32ToEthAddress(bech32Address: string): string {
  try {
    if (!bech32Address) return '';
    const { words } = bech32.decode(bech32Address);
    const data = bech32.fromWords(words);
    return ethers.utils.hexlify(data);
  } catch (error) {
    console.error('Error decoding bech32 address:', error);
    return '';
  }
}

export async function checkMintEligibility(primaryAddress: string) {
  try {
    const res = await axios.get(`${getBaseURL()}/v1/light-node/nft/mint-signature`, {
      params: {
        wallet_address: primaryAddress,
      },
    });
    return res.status === 400;
  } catch (error) {
    return error?.response?.status === 400;
  }
}

const prepareTx = async (primaryAddress: string, mintAddress: string) => {
  const address = bech32ToEthAddress(mintAddress);
  const { data } = await axiosWrapper({
    baseURL: getBaseURL(),
    url: '/v1/light-node/nft/mint-signature',
    params: {
      wallet_address: primaryAddress,
      mint_address: address,
    },
  });
  const tx = await leapLNContract.populateTransaction.safeMint(address, '0x01', data.signature);
  return tx;
};

export async function simulateMintTx(primaryAddress: string, mintAddress: string) {
  const tx = await prepareTx(primaryAddress, mintAddress);
  const gasLimit = await SeiEvmTx.SimulateTransaction(tx.to ?? '', '0', RPC_URL, tx.data, undefined);
  return gasLimit;
}

export async function mintNft(
  primaryAddress: string,
  mintAddress: string,
  wallet: EthWallet | LeapLedgerSignerEth,
  gasLimit: number,
  gasPrice: number,
) {
  const tx = await prepareTx(primaryAddress, mintAddress);
  const txHash = await signAndBroadcastTx(tx, mintAddress, gasLimit.toString(), gasPrice, wallet);
  return txHash;
}

async function signAndBroadcastTx(
  tx: ethers.PopulatedTransaction,
  address: string,
  gasLimit: string,
  gasPrice: number,
  wallet: EthWallet | LeapLedgerSignerEth,
) {
  const ethSenderAddress = bech32ToEthAddress(address);
  tx.chainId = CHAIN_ID;
  tx.nonce = await provider.getTransactionCount(ethSenderAddress);
  tx.gasLimit = ethers.BigNumber.from(gasLimit);
  tx.gasPrice = ethers.BigNumber.from(gasPrice);
  const hash = keccak256(Buffer.from(serialize(tx).replace('0x', ''), 'hex'));
  let signature;
  let v;

  if (wallet instanceof LeapLedgerSignerEth || wallet?.constructor?.name === 'LeapLedgerSignerEth') {
    signature = (await wallet.signTransaction(address, serialize(tx).replace('0x', ''))) as {
      r: string;
      s: string;
      v: number;
    };
    v = Number('0x' + signature.v) - 2 * CHAIN_ID - 35;
  } else {
    signature = await wallet.sign(address, hash);
    v = Number(signature.v) - 27;
  }

  const formattedSignature = concat([
    signature.r,
    signature.s,
    v ? Buffer.from('01', 'hex') : Buffer.from('00', 'hex'),
  ]);

  const signedtx = ethers.utils.serializeTransaction(tx, formattedSignature);
  const txResponse = await provider.sendTransaction(signedtx);
  const receipt = await txResponse.wait();
  return receipt.transactionHash;
}

// Define metadata type
export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  animation_url?: string;
  tokenId?: string;
  tokenUri?: string;
  extension: Dict | null;
  collection: {
    name: string;
    address: string;
    image: string;
  };
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  chain: SupportedChain;
}

export async function getNFTBalance(_address: string) {
  try {
    const address = bech32ToEthAddress(_address);
    const balance = await leapLNContract.balanceOf(address);

    if (balance <= BigInt(0)) {
      return {
        hasNFT: false,
        tokenId: null,
        metadata: null,
        isLoading: false,
      };
    }

    // 2. Get token ID
    const tokenId = await leapLNContract.tokenOfOwnerByIndex(address, BigInt(0));
    const tokenURI = await leapLNContract.tokenURI(tokenId);
    let metadata = null;
    try {
      const base64 = tokenURI.slice('data:application/json;base64,'.length);
      const jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
      metadata = JSON.parse(jsonStr);
    } catch (err) {
      throw new Error(`Failed to decode base64 tokenURI: ${err}`);
    }
    metadata.image = metadata.image?.replace('ipfs://', IPFS_GATEWAY);
    metadata.animation_url = metadata.animation_url?.replace('ipfs://', IPFS_GATEWAY);
    metadata.chain = 'forma';
    metadata.tokenId = Number(tokenId).toString();
    return {
      hasNFT: true,
      tokenId: Number(tokenId),
      metadata,
      isLoading: false,
    };
  } catch (error) {
    console.error('Error getting NFT balance and metadata:', error);
    return {
      hasNFT: false,
      tokenId: null,
      metadata: null,
      isLoading: false,
    };
  }
}
