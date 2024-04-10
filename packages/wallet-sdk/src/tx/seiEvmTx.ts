import { BytesLike } from '@ethersproject/bytes';
import { JsonRpcProvider } from '@ethersproject/providers';
import { parseEther } from '@ethersproject/units';
import { EthWallet, pubkeyToAddress } from '@leapwallet/leap-keychain';
import { hashPersonalMessage, intToHex } from 'ethereumjs-util';

import { ARCTIC_ETH_CHAIN_ID } from '../constants';
import { ARCTIC_EVM_RPC_URL } from '../constants';
import { trimLeadingZeroes } from '../utils';

export type JsonRpcResponse = {
  jsonrpc: string;
  id: number;
  result?: string;
  error?: { code: number; message: string };
};

export class SeiEvmTx {
  private constructor(private rpc: string, private wallet: EthWallet) {}

  public static GetSeiEvmClient(wallet: EthWallet, rpc?: string) {
    const rpcUrl = rpc || ARCTIC_EVM_RPC_URL;
    const chainId = ARCTIC_ETH_CHAIN_ID;
    const provider = new JsonRpcProvider(rpcUrl, chainId);
    wallet.setProvider(provider);
    return new SeiEvmTx(rpcUrl, wallet);
  }

  async sendTransaction(
    bech32Address: string,
    toAddress: string,
    value: string,
    gas: number,
    gasPrice?: number,
    data?: BytesLike,
  ) {
    const weiValue = parseEther(value);
    return this.wallet.sendTransaction({
      to: toAddress,
      value: weiValue.toHexString(),
      gasLimit: intToHex(gas),
      gasPrice: intToHex(gasPrice ?? 1000_000_000),
      data,
    });
  }

  public static async SimulateTransaction(
    toAddress: string,
    value: string,
    rpc?: string,
    data?: BytesLike,
    gasAdjustment?: number,
  ) {
    const rpcUrl = rpc || ARCTIC_EVM_RPC_URL;
    const txParams: { to: string; value?: string; data?: BytesLike } = {
      to: toAddress,
    };

    if (Number(value)) {
      const weiValue = parseEther(value);
      txParams.value = trimLeadingZeroes(weiValue.toHexString(), true);
    }

    if (data) {
      txParams.data = data;
    }

    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [txParams],
      }),
    });

    const responseData = await res.json();
    if (responseData?.error) {
      throw new Error(responseData.error.message);
    }

    const gasEstimate = Number(responseData.result);
    if (gasAdjustment) {
      return gasEstimate * gasAdjustment;
    }

    return gasEstimate;
  }

  async associateEvmAddress() {
    const accounts = await this.wallet.getAccounts();
    const account = accounts[0];

    const data = Buffer.alloc(32);
    const msgHash = hashPersonalMessage(data);

    const signature = this.wallet.sign(account.address, msgHash);
    const compactV = Number(signature.v) - 27;

    const params = {
      r: signature.r,
      s: signature.s,
      v: `0x${compactV}`,
      custom_message: `\x19Ethereum Signed Message:\n32${data.toString()}`,
    };
    const response = await this.submitAssociationTx(params);
    return response;
  }

  async submitAssociationTx(params: {
    r: string;
    s: string;
    v: string;
    custom_message: string;
  }): Promise<JsonRpcResponse> {
    const res = await fetch(this.rpc, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'sei_associate',
        params: [params],
      }),
    });

    return res.json();
  }

  async getAssociation(): Promise<{
    jsonrpc: string;
    id: number;
    result?: string;
    error?: { code: number; message: string };
  }> {
    const accounts = await this.wallet.getAccounts();
    const pubKey = accounts[0].pubkey;
    const seiAddress = pubkeyToAddress('sei', pubKey);

    const res = await fetch(this.rpc, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'sei_getEVMAddress',
        params: [seiAddress],
      }),
    });
    return res.json();
  }
}
