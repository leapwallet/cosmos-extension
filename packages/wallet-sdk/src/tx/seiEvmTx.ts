import { BytesLike } from '@ethersproject/bytes';
import { JsonRpcProvider } from '@ethersproject/providers';
import { parseEther, parseUnits } from '@ethersproject/units';
import { EthWallet, pubkeyToAddress } from '@leapwallet/leap-keychain';
import { hashPersonalMessage, intToHex } from 'ethereumjs-util';
import { Contract } from 'ethers';

import { abiERC20 } from '../constants';
import { getFetchParams, personalSign, sleep, trimLeadingZeroes } from '../utils';

export type JsonRpcResponse = {
  jsonrpc: string;
  id: number;
  result?: string;
  error?: { code: number; message: string };
};

export class SeiEvmTx {
  private static rpcUrl: string;
  private constructor(private rpc: string, private wallet: EthWallet) {}

  public static GetSeiEvmClient(wallet: EthWallet, rpc: string, chainId: number) {
    const provider = new JsonRpcProvider(rpc, chainId);
    this.rpcUrl = rpc;

    wallet.setProvider(provider);
    return new SeiEvmTx(rpc, wallet);
  }

  async sendTransaction(_: string, toAddress: string, value: string, gas: number, gasPrice?: number, data?: BytesLike) {
    const weiValue = parseEther(value);
    return this.wallet.sendTransaction({
      to: toAddress,
      value: weiValue.toHexString(),
      gasLimit: intToHex(gas),
      gasPrice: intToHex(gasPrice ?? 1000_000_000),
      data,
    });
  }

  async sendERC20Transaction(
    toAddress: string,
    value: string,
    contractAddress: string,
    decimals: number,
    gas: number,
    gasPrice?: number,
  ) {
    const weiValue = parseUnits(value, decimals);
    const contract = new Contract(contractAddress, abiERC20);
    const data = contract.interface.encodeFunctionData('transfer', [toAddress, weiValue]);

    const txObject = {
      to: contractAddress,
      value: 0,
      gasLimit: intToHex(gas),
      gasPrice: intToHex(gasPrice ?? 1000_000_000),
      data,
    };

    return this.wallet.sendTransaction(txObject);
  }

  public static async SimulateTransaction(
    toAddress: string,
    value: string,
    rpc?: string,
    data?: BytesLike,
    gasAdjustment?: number,
    fromAddress?: string,
  ) {
    const txParams: { to: string; value?: string; data?: BytesLike; from?: string } = {
      to: toAddress,
    };

    if (fromAddress) {
      txParams.from = fromAddress;
    }

    if (Number(value)) {
      const weiValue = parseEther(value);
      txParams.value = trimLeadingZeroes(weiValue.toHexString(), true);
    }

    if (data) {
      txParams.data = data;
    }

    const result = await SeiEvmTx.ExecuteEthEstimateGAs([txParams], rpc);
    const gasEstimate = parseInt(Number(result).toString());

    if (gasAdjustment) {
      return parseInt((gasEstimate * gasAdjustment).toString());
    }

    return gasEstimate;
  }

  public static async ExecuteEthEstimateGAs(txParams: any, rpc?: string) {
    const fetchParams = getFetchParams(txParams, 'eth_estimateGas');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async ExecuteEthCall(txParams: any, rpc?: string) {
    const fetchParams = getFetchParams(txParams, 'eth_call');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async GetBlockNumber(rpc?: string) {
    const fetchParams = getFetchParams([], 'eth_blockNumber');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async GetTransactionReceipt(txHash: string, rpc?: string) {
    const fetchParams = getFetchParams([txHash], 'eth_getTransactionReceipt');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async GetTransactionByHash(txHash: string, rpc?: string) {
    const fetchParams = getFetchParams([txHash], 'eth_getTransactionByHash');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  async transferErc721Token({
    erc721ContractAddress,
    tokenId,
    from,
    to,
    gas,
    gasPrice,
  }: {
    erc721ContractAddress: string;
    tokenId: string;
    from: string;
    to: string;
    gas: number;
    gasPrice?: number;
  }) {
    const contract = new Contract(erc721ContractAddress, abiERC20);
    const data = contract.interface.encodeFunctionData('transferFrom', [from, to, tokenId]);

    const txObject = {
      to: erc721ContractAddress,
      value: 0,
      gasLimit: intToHex(gas),
      gasPrice: intToHex(gasPrice ?? 1000_000_000),
      data,
    };

    return this.wallet.sendTransaction(txObject);
  }

  public async pollLinkAddressWithoutFunds(ethAddress: string, chainId: string, retryCount = 20): Promise<any> {
    if (retryCount === 0) {
      throw new Error('Failed to link address');
    }

    const baseUrl = 'https://app-api.seinetwork.io/associate-message';
    const url = `${baseUrl}/${chainId}/${ethAddress}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.data?.status === 'processing') {
      await sleep(1000);
      return await this.pollLinkAddressWithoutFunds(ethAddress, chainId, retryCount - 1);
    }

    return data;
  }

  public async linkAddressWithoutFunds(ethAddress: string, token: string) {
    const accounts = await this.wallet.getAccounts();
    const account = accounts[0];
    const message =
      'Please sign this message to link your EVM and Sei addresses on Compass. No SEI will be spent as a result of this signature.';
    const signature = personalSign(message, account.address, this.wallet);

    const url = 'https://app-api.seinetwork.io/associate';
    const body = {
      address: ethAddress,
      message,
      signature,
      token,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data;
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
    const res = await fetch(this.rpc, getFetchParams([params], 'sei_associate'));
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

    const res = await fetch(this.rpc, getFetchParams([seiAddress], 'sei_getEVMAddress'));
    return res.json();
  }

  private static async fetchRequest(fetchParams: any, rpc?: string) {
    const rpcUrl = rpc || this.rpcUrl;
    const res = await fetch(rpcUrl, fetchParams);
    const responseData = await res.json();

    if (responseData?.error) {
      throw new Error(responseData.error.message);
    }

    return responseData.result;
  }
}
