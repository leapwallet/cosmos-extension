/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BytesLike } from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { parseEther, parseUnits } from '@ethersproject/units';
import { EthWallet, pubkeyToAddress } from '@leapwallet/leap-keychain';
import BigNumber from 'bignumber.js';
import { hashPersonalMessage, intToHex } from 'ethereumjs-util';

import {
  abiERC20,
  EVM_FEE_HISTORY_BLOCK_COUNT,
  EVM_FEE_HISTORY_NEWEST_BLOCK,
  EVM_FEE_HISTORY_REWARD_PERCENTILES,
  EVM_FEE_SETTINGS,
  EvmFeeType,
} from '../constants';
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

  // EIP-1559 fee mechanism
  public static async GasPrices(rpc?: string) {
    const feeHistory = await SeiEvmTx.EthFeeHistory(
      EVM_FEE_HISTORY_BLOCK_COUNT,
      EVM_FEE_HISTORY_NEWEST_BLOCK,
      EVM_FEE_HISTORY_REWARD_PERCENTILES,
      rpc,
    );

    const latestBaseFeePerGas = parseInt(feeHistory?.baseFeePerGas?.pop() ?? '0');
    if (feeHistory && latestBaseFeePerGas) {
      // @ts-ignore
      const baseFeePerGases: Record<EvmFeeType, BigNumber> = {};
      // @ts-ignore
      const medianOfPriorityFeesPerGases: Record<EvmFeeType, string> = {};

      for (const key in EVM_FEE_SETTINGS) {
        baseFeePerGases[key as EvmFeeType] = new BigNumber(latestBaseFeePerGas).multipliedBy(
          EVM_FEE_SETTINGS[key as EvmFeeType].gasMultiplier,
        );

        const priorityFeesPerGas = feeHistory.reward?.map(
          (priorityFeeByRewardPercentileIndex: string[]) =>
            priorityFeeByRewardPercentileIndex[
              EVM_FEE_HISTORY_REWARD_PERCENTILES.findIndex(
                (percentile) => percentile === EVM_FEE_SETTINGS[key as EvmFeeType]?.percentile,
              )
            ],
        );

        medianOfPriorityFeesPerGases[key as EvmFeeType] =
          priorityFeesPerGas?.sort((a: string, b: string) => Number(BigInt(a) - BigInt(b)))[
            Math.floor((priorityFeesPerGas.length - 1) / 2)
          ] ?? '0';
      }

      const medianOfPriorityFeesPerGas = medianOfPriorityFeesPerGases.low;
      if (new BigNumber(medianOfPriorityFeesPerGas).isZero()) {
        const maxPriorityFeePerGas = await SeiEvmTx.EthMaxPriorityFeePerGas(rpc);

        if (maxPriorityFeePerGas) {
          return {
            maxPriorityFeePerGas: {
              low: new BigNumber(maxPriorityFeePerGas).toString(),
              medium: new BigNumber(maxPriorityFeePerGas).toString(),
              high: new BigNumber(maxPriorityFeePerGas).toString(),
            },
            maxFeePerGas: {
              low: baseFeePerGases.low.plus(new BigNumber(maxPriorityFeePerGas)).toString(),
              medium: baseFeePerGases.medium.plus(new BigNumber(maxPriorityFeePerGas)).toString(),
              high: baseFeePerGases.high.plus(new BigNumber(maxPriorityFeePerGas)).toString(),
            },
          };
        }
      }

      return {
        maxPriorityFeePerGas: {
          low: new BigNumber(medianOfPriorityFeesPerGases.low).toString(),
          medium: new BigNumber(medianOfPriorityFeesPerGases.medium).toString(),
          high: new BigNumber(medianOfPriorityFeesPerGases.high).toString(),
        },
        maxFeePerGas: {
          low: baseFeePerGases.low.plus(new BigNumber(medianOfPriorityFeesPerGases.low)).toString(),
          medium: baseFeePerGases.medium.plus(new BigNumber(medianOfPriorityFeesPerGases.medium)).toString(),
          high: baseFeePerGases.high.plus(new BigNumber(medianOfPriorityFeesPerGases.high)).toString(),
        },
      };
    } else {
      const block = await SeiEvmTx.GetBlockByNumber(['latest', true], rpc);
      const latestBaseFeePerGas = parseInt(block?.baseFeePerGas ?? '0');
      const maxPriorityFeePerGas = await SeiEvmTx.EthMaxPriorityFeePerGas(rpc);

      if (block && latestBaseFeePerGas && maxPriorityFeePerGas) {
        const baseFeePerGases = Object.keys(EVM_FEE_SETTINGS).reduce((acc: Record<EvmFeeType, BigNumber>, key) => {
          acc[key as EvmFeeType] = new BigNumber(latestBaseFeePerGas).multipliedBy(
            EVM_FEE_SETTINGS[key as EvmFeeType].gasMultiplier,
          );
          return acc;
        }, {} as Record<EvmFeeType, BigNumber>);

        return {
          maxPriorityFeePerGas: {
            low: new BigNumber(maxPriorityFeePerGas).toString(),
            medium: new BigNumber(maxPriorityFeePerGas).toString(),
            high: new BigNumber(maxPriorityFeePerGas).toString(),
          },
          maxFeePerGas: {
            low: baseFeePerGases.low.plus(new BigNumber(maxPriorityFeePerGas)).toString(),
            medium: baseFeePerGases.medium.plus(new BigNumber(maxPriorityFeePerGas)).toString(),
            high: baseFeePerGases.high.plus(new BigNumber(maxPriorityFeePerGas)).toString(),
          },
        };
      } else {
        const gasPrice = await SeiEvmTx.EthGasPrice(rpc);

        if (gasPrice) {
          const gasPrices = Object.keys(EVM_FEE_SETTINGS).reduce((acc: Record<EvmFeeType, string>, key) => {
            acc[key as EvmFeeType] = new BigNumber(Number(gasPrice))
              .multipliedBy(EVM_FEE_SETTINGS[key as EvmFeeType].gasMultiplier)
              .toString();

            return acc;
          }, {} as Record<EvmFeeType, string>);

          return {
            gasPrice: {
              ...gasPrices,
            },
          };
        }
      }
    }

    return {
      gasPrice: { low: '0', medium: '0', high: '0' },
    };
  }

  public static async BlockBaseFee(rpc?: string) {
    const block = await SeiEvmTx.GetBlockByNumber(['latest', true], rpc);
    return parseInt(block?.baseFeePerGas ?? '0');
  }

  public static async EthFeeHistory(
    blockCount: number,
    newestBlock: string,
    rewardPercentiles: number[],
    rpc?: string,
  ) {
    const txParams = [`0x${blockCount.toString(16)}`, newestBlock, rewardPercentiles];
    const fetchParams = getFetchParams(txParams, 'eth_feeHistory');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async EthMaxPriorityFeePerGas(rpc?: string) {
    const fetchParams = getFetchParams([], 'eth_maxPriorityFeePerGas');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async EthGasPrice(rpc?: string) {
    const fetchParams = getFetchParams([], 'eth_gasPrice');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async SimulateTransaction(
    toAddress: string,
    value: string,
    rpc?: string,
    data?: BytesLike,
    gasAdjustment?: number,
    fromAddress?: string,
    contractAddress?: string,
    decimals?: number,
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

    if (contractAddress) {
      const weiValue = parseUnits(value, decimals);
      const contract = new Contract(contractAddress, abiERC20);
      const data = contract.interface.encodeFunctionData('transfer', [toAddress, weiValue]);

      txParams.to = contractAddress;
      txParams.data = data;
      txParams.value = '0x0';
    }

    const result = await SeiEvmTx.ExecuteEthEstimateGas([txParams], rpc);
    const gasEstimate = Math.ceil(Number(result));

    if (gasAdjustment) {
      return parseInt((gasEstimate * gasAdjustment).toString());
    }

    return gasEstimate;
  }

  public static async ExecuteEthEstimateGas(txParams: any, rpc?: string) {
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

  public static async GetBlockByNumber(txParams: any, rpc?: string) {
    const fetchParams = getFetchParams(txParams, 'eth_getBlockByNumber');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async EthGetBalance(txParams: any, rpc?: string) {
    const fetchParams = getFetchParams(txParams, 'eth_getBalance');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async GetCosmosTxHash(evmTxHash: string, rpc?: string) {
    const fetchParams = getFetchParams([evmTxHash], 'sei_getCosmosTx');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  public static async GetSeiAddressFromHex(hexAddress: string, rpc?: string) {
    const fetchParams = getFetchParams([hexAddress], 'sei_getSeiAddress');
    return await SeiEvmTx.fetchRequest(fetchParams, rpc);
  }

  async sendTransaction(_: string, toAddress: string, value: string, gas: number, gasPrice?: number, data?: BytesLike) {
    const weiValue = parseEther(value);
    const txn = await this.wallet.sendTransaction({
      to: toAddress,
      value: weiValue.toHexString(),
      gasLimit: intToHex(gas),
      gasPrice: intToHex(gasPrice ?? 1000_000_000),
      data,
    });

    await txn.wait();
    return txn;
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

    const txn = await this.wallet.sendTransaction(txObject);
    await txn.wait();
    return txn;
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

    const txn = await this.wallet.sendTransaction(txObject);
    await txn.wait();
    return txn;
  }

  public async pollLinkAddressWithoutFunds(ethAddress: string, chainId: string, retryCount = 40): Promise<any> {
    if (retryCount === 0) {
      throw new Error('Failed to check if the addresses are linked. Please refresh and try again.');
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
    const signature = await personalSign(message, account.address, this.wallet);

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

    const data = Buffer.alloc(4);
    const msgHash = hashPersonalMessage(data);

    const signature = this.wallet.sign(account.address, msgHash);
    const compactV = Number(signature.v) - 27;

    const params = {
      r: signature.r,
      s: signature.s,
      v: `0x${compactV}`,
      custom_message: `\x19Ethereum Signed Message:\n4${data.toString()}`,
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
