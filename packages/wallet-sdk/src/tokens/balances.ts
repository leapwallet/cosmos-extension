import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { createProtobufRpcClient, QueryClient, StargateClient } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import BigNumber from 'bignumber.js';
import { QueryClientImpl, QueryDenomTraceResponse } from 'cosmjs-types/ibc/applications/transfer/v1/query';
import { Contract, ethers } from 'ethers';

import { ChainInfo, ChainInfos, SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { BalancesResponse } from '../types/bank';
import { formatEtherValue } from '../utils';

export type IQueryDenomTraceResponse = QueryDenomTraceResponse;

export async function fetchAllBalancesRestApi(lcdUrl: string, address: string, fallBackRpcUrl?: string) {
  // leading whitespaces on request url can cause requests to fail on react native
  try {
    const response = await axiosWrapper<BalancesResponse>({
      baseURL: lcdUrl.trim(),
      method: 'get',
      url: `/cosmos/bank/v1beta1/${
        address.toLowerCase().includes('terra') ? 'spendable_' : ''
      }balances/${address}?pagination.limit=1000`,
    });

    return response.data.balances.map(({ amount, denom }) => {
      return { amount: new BigNumber(amount), denom };
    });
  } catch (e) {
    if (fallBackRpcUrl) {
      return fetchAllBalances(fallBackRpcUrl, address);
    }
    throw e;
  }
}

export async function fetchAllBalances(rpcUrl: string, address: string) {
  const client = await StargateClient.connect(rpcUrl);
  const balances = await client.getAllBalances(address);

  return balances.map(({ amount, denom }) => {
    return { denom, amount: new BigNumber(amount) };
  });
}

export async function fetchSeiEvmBalances(evmJsonRpc: string, ethWalletAddress: string) {
  const provider = new ethers.providers.JsonRpcProvider(evmJsonRpc);
  const balance = await provider.getBalance(ethWalletAddress);
  return { denom: 'usei', amount: formatEtherValue(balance.toString()) };
}

export async function fetchCW20Balances(rpcUrl: string, address: string, cw20Tokens: Array<string>) {
  const client = await CosmWasmClient.connect(rpcUrl);
  const promises = cw20Tokens.map(async (tokenAddress) => {
    const balance = await client.queryContractSmart(tokenAddress, { balance: { address } });
    return { denom: tokenAddress, amount: new BigNumber(balance.balance) };
  });
  const balances = await Promise.allSettled(promises);

  const fulfilledBalances = balances.reduce(
    (fulfilledBalances: Array<{ denom: string; amount: BigNumber }>, currentBalance) => {
      if (currentBalance.status === 'fulfilled') {
        return [...fulfilledBalances, { ...currentBalance.value }];
      }

      return fulfilledBalances;
    },
    [],
  );

  return fulfilledBalances;
}

export async function fetchERC20Balances(evmJsonRpc: string, ethWalletAddress: string, erc20Tokens: Array<string>) {
  const provider = new ethers.providers.JsonRpcProvider(evmJsonRpc);
  const contractAbi = ['function balanceOf(address account) view returns (uint256)'];

  const promises = erc20Tokens.map(async (tokenAddress) => {
    const contract = new Contract(tokenAddress, contractAbi, provider);
    const balance = await contract.balanceOf(ethWalletAddress);
    return { denom: tokenAddress, amount: new BigNumber(balance._hex, 16) };
  });

  const balances = await Promise.allSettled(promises);
  const fulfilledBalances = balances.reduce(
    (fulfilledBalances: Array<{ denom: string; amount: BigNumber }>, currentBalance) => {
      if (currentBalance.status === 'fulfilled') {
        return [...fulfilledBalances, { ...currentBalance.value }];
      }

      return fulfilledBalances;
    },
    [],
  );

  return fulfilledBalances;
}

export class TransferQueryClient {
  private static queryClient: QueryClientImpl;

  static async getTransferQueryClient(
    rpcUrl: string,
    chainInfos?: Record<SupportedChain, ChainInfo>,
  ): Promise<QueryClientImpl> {
    const isJunoRpc = rpcUrl === `${(chainInfos ?? ChainInfos).juno.apis.rpc}/`;
    const junoRpc = (chainInfos ?? ChainInfos).juno.apis.alternateRpc ?? '';
    try {
      const tmClient = await Tendermint34Client.connect(isJunoRpc ? junoRpc : rpcUrl);
      const queryClient = QueryClient.withExtensions(tmClient);
      const rpc = createProtobufRpcClient(queryClient);
      return new QueryClientImpl(rpc);
    } catch (e) {
      if (isJunoRpc) {
        return TransferQueryClient.getTransferQueryClient((chainInfos ?? ChainInfos).juno.apis.rpc ?? '');
      }
      throw e;
    }
  }

  static async getDenomTrace(hash: string, rpcUrl: string, chainInfos?: Record<SupportedChain, ChainInfo>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!TransferQueryClient.queryClient || TransferQueryClient.queryClient.rpc.url !== rpcUrl) {
      TransferQueryClient.queryClient = await TransferQueryClient.getTransferQueryClient(rpcUrl, chainInfos);
    }

    const denomTrace = await TransferQueryClient.queryClient.DenomTrace({ hash });

    return { denomTrace };
  }
}

export async function getIbcDenomTrace(lcdUrl: string, hash: string) {
  const response = await axiosWrapper<{ denom_trace: { base_denom: string; path: string } }>({
    baseURL: lcdUrl.trim(),
    method: 'get',
    url: `/ibc/apps/transfer/v1/denom_traces/${hash}`,
  });

  return response.data.denom_trace;
}
