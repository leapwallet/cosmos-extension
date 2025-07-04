import { TransactionResponseType, UserTransactionResponse } from '@aptos-labs/ts-sdk';
import { AptosTx, ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk/dist/browser/healthy-nodes/axiosWrapper';
import { fromSmall } from '@leapwallet/cosmos-wallet-sdk/dist/browser/utils/token-converter';
import { IbcTraceFetcher } from '@leapwallet/cosmos-wallet-store';
import { ParsedMessageType, type ParsedTransaction, TransactionParser } from '@leapwallet/parser-parfait';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import qs from 'qs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { useActiveChain, useAddress, useChainApis, useChainsStore, useSelectedNetwork } from '../store';
import { Activity, ActivityCardContent, getActivityContentProps, TxResponse } from '../types';
import { sliceAddress } from '../utils';
import { convertVoteOptionToString } from './../utils/vote-option';
import { parseAnkrTx } from './parse-ankr-tx';
import { parseAptosTx } from './parse-aptos-tx';
import { parseBitcoinTx } from './parse-bitcoin-tx';
import { parseFormaTx } from './parse-forma-tx';

export type Validators = Record<string, string>;

export const useInvalidateActivity = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (activeChain: SupportedChain) => {
      queryClient.invalidateQueries([`${activeChain}-fetch-activity`]);
    },
    [queryClient],
  );
};

async function getActivityCardContent({
  parsedTx,
  address,
  restUrl,
  chainId,
  coinDecimals,
  ibcTraceFetcher,
}: getActivityContentProps): Promise<ActivityCardContent> {
  if (!parsedTx) {
    return {
      txType: 'fallback',
      title1: 'Unknown',
      subtitle1: '',
    };
  }

  const content: ActivityCardContent = {
    txType: 'fallback',
    title1: parsedTx.code === 0 ? 'Success' : 'Failed',
    subtitle1: sliceAddress(parsedTx?.txHash ?? ''),
  };

  const msg = parsedTx.messages[0];

  switch (msg.__type) {
    case ParsedMessageType.BankSend: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.tokens[0].denomination, restUrl, chainId ?? '');
      const isReceive = msg.toAddress.toUpperCase() === address?.toUpperCase();
      content.txType = isReceive ? 'receive' : 'send';

      content.title1 = isReceive
        ? `Received ${sentTokenInfo?.coinDenom ?? ''}`
        : `Sent ${sentTokenInfo?.coinDenom ?? ''}`;

      content.subtitle1 = isReceive
        ? `From ${sliceAddress(msg.fromAddress ?? '')}`
        : `To ${sliceAddress(msg.toAddress ?? '')}`;

      if (!sentTokenInfo?.coinDenom) {
        content.sentAmount = msg.tokens[0].quantity;
      } else {
        if (sentTokenInfo?.chain === 'solana' && sentTokenInfo?.coinDenom !== 'SOL') {
          content.sentAmount = msg.tokens[0].quantity.toString();
        } else {
          content.sentAmount = fromSmall(
            msg.tokens[0].quantity.toString(),
            sentTokenInfo?.coinDecimals ?? coinDecimals ?? 0,
          );
        }
      }

      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.StakingDelegate: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.denomination, restUrl, chainId ?? '');
      content.txType = 'delegate';
      content.title1 = 'Delegation';
      content.subtitle1 = `${sliceAddress(msg.delegatorAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.StakingUndelegate: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.denomination, restUrl, chainId ?? '');
      content.txType = 'undelegate';
      content.title1 = 'Undelegation';
      content.subtitle1 = `${sliceAddress(msg.delegatorAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.IbcSend: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.token.denomination, restUrl, chainId ?? '');
      content.txType = 'ibc/transfer';
      content.title1 = 'IBC Send';
      content.subtitle1 = `To ${sliceAddress(msg.toAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.token.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.IbcReceive: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.token.denomination, restUrl, chainId ?? '');
      content.txType = 'ibc/transfer';
      content.title1 = 'IBC Receive';
      content.subtitle1 = `From ${sliceAddress(msg.fromAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.token.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.GovVote: {
      content.txType = 'vote';
      content.title1 = `Voted ${convertVoteOptionToString(msg.option)}`;
      content.subtitle1 = `Proposal ${msg.proposalId}`;
      break;
    }
    case ParsedMessageType.GammJoinPool: {
      content.txType = 'liquidity/add';
      content.title1 = `Add Liquidity - Pool #${msg.poolId}`;
      content.subtitle1 = `Bought ${msg.shares} shares`;
      break;
    }
    case ParsedMessageType.GammExitPool: {
      content.txType = 'liquidity/remove';
      content.title1 = `Remove Liquidity - Pool #${msg.poolId}`;
      content.subtitle1 = `Sold ${msg.shares} shares`;
      break;
    }
    case ParsedMessageType.GammSwapExact:
    case ParsedMessageType.PMSwapExactIn:
    case ParsedMessageType.PMSplitSwapExactIn: {
      content.txType = 'swap';
      const lastRoute: any = msg.routes[msg.routes.length - 1];

      const tokenGiven = {
        denomination: msg.tokenIn.denomination,
        quantity: msg.tokenIn.quantity,
      };
      const tokenGained = {
        denomination: lastRoute.tokenOutDenomination,
        quantity: msg.tokenOutAmount,
      };
      const fromToken =
        tokenGiven && chainId
          ? await ibcTraceFetcher.fetchIbcTrace(tokenGiven.denomination, restUrl, chainId)
          : undefined;
      const toToken =
        tokenGained && chainId
          ? await ibcTraceFetcher.fetchIbcTrace(tokenGained.denomination, restUrl, chainId)
          : undefined;

      if (fromToken && toToken) {
        content.title1 = `${fromToken.coinDenom} 👉🏻 ${toToken.coinDenom}`;
        content.receivedAmount = fromSmall(tokenGained?.quantity.toString() ?? '0', toToken.coinDecimals);
        content.sentAmount = fromSmall(tokenGiven?.quantity.toString() ?? '0', fromToken.coinDecimals);
        content.sentTokenInfo = fromToken;
        content.receivedTokenInfo = toToken;
        content.img = fromToken.icon;
        content.secondaryImg = toToken.icon;
      } else if (fromToken && !toToken) {
        content.title1 = `Swapped to ${fromToken.coinDenom}`;
        content.img = fromToken.icon;
        content.sentTokenInfo = fromToken;
      } else if (!fromToken && toToken) {
        content.title1 = `Swapped from ${toToken.coinDenom}`;
        content.img = toToken.coinMinimalDenom;
        content.receivedTokenInfo = toToken;
      } else {
        content.title1 = 'Swap';
      }
      break;
    }
  }
  return content;
}

function unionOfTxs(_txs1: ParsedTransaction[], _txs2: ParsedTransaction[]): ParsedTransaction[] {
  if (!_txs1 || _txs1.length === 0) return _txs2;
  if (!_txs2 || _txs2.length === 0) return _txs1;

  const txs = new Map();

  _txs1.forEach((tx) => txs.set(tx.txHash, tx));
  _txs2.forEach((tx) => txs.set(tx.txHash, tx));

  return Array.from(txs.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const txnParser = new TransactionParser();

export function useActivity(
  ankrChainMap: { [key: string]: string },
  ibcTraceFetcher: IbcTraceFetcher,
  forceChain?: SupportedChain,
  forceAddress?: string,
  forceNetwork?: 'mainnet' | 'testnet',
): TxResponse {
  const chain = useActiveChain();
  const network = useSelectedNetwork();
  const activeChain = forceChain ?? chain;
  const selectedNetwork = forceNetwork ?? network;
  const userAddress = useAddress(activeChain);

  const { lcdUrl: restUrl = '', rpcUrl } = useChainApis(activeChain, selectedNetwork);
  const { chains } = useChainsStore();
  const address = forceAddress ?? userAddress;

  const [activity, setActivity] = useState<Activity[]>([]);
  const resetActivity = () => setActivity([]);

  useEffect(() => {
    resetActivity();
  }, [activeChain, address, selectedNetwork]);

  const { status, data } = useQuery(
    [`${activeChain}-fetch-activity`, address, activeChain, selectedNetwork, chains, ibcTraceFetcher],
    async function () {
      if (!address) {
        return null;
      }

      return getChainActivity({
        chainInfo: chains[activeChain],
        activeChain,
        selectedNetwork,
        address,
        rpcUrl,
        ankrChainMap,
        restUrl,
        ibcTraceFetcher,
      });
    },
    {
      retry: 3,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: true,
    },
  );

  useEffect(() => {
    if (data && data.length) {
      setActivity(data);
    }
  }, [data]);

  const txResponse = useMemo(
    () => ({
      activity,
      loading: status === 'loading',
      error: status === 'error',
    }),
    [activity, status],
  );

  return txResponse;
}

export const getChainActivity = async (config: {
  chainInfo: ChainInfo;
  activeChain: SupportedChain;
  selectedNetwork: 'mainnet' | 'testnet';
  address: string;
  rpcUrl?: string;
  ankrChainMap: Record<string, string>;
  restUrl: string;
  ibcTraceFetcher: IbcTraceFetcher;
}) => {
  const { activeChain, address, ankrChainMap, chainInfo, ibcTraceFetcher, restUrl, rpcUrl, selectedNetwork } =
    config || {};
  try {
    let parsedData: ParsedTransaction[] = [];
    const coinDecimals = chainInfo?.evmOnlyChain ? 18 : undefined;

    switch (activeChain) {
      case 'forma': {
        try {
          const url = `https://explorer.forma.art/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`;
          const response = await fetch(url);
          const data = await response.json();
          parsedData = data?.items?.map((tx: any) => parseFormaTx(tx, Object.keys(chainInfo.nativeDenoms)[0]));
        } catch (_) {
          //
        }

        break;
      }
      case 'flame': {
        try {
          const explorer =
            selectedNetwork === 'mainnet'
              ? 'https://explorer.flame.astria.org'
              : 'https://explorer.flame.dawn-1.astria.org';
          const url = `${explorer}/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`;
          const response = await fetch(url);
          const data = await response.json();
          parsedData = data?.items?.map((tx: any) => parseFormaTx(tx, Object.keys(chainInfo.nativeDenoms)[0]));
        } catch (_) {
          //
        }

        break;
      }
      case 'manta': {
        try {
          const explorer =
            selectedNetwork === 'mainnet'
              ? 'https://pacific-explorer.manta.network'
              : 'https://pacific-explorer.sepolia-testnet.manta.network';
          const url = `${explorer}/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`;
          const response = await fetch(url);
          const data = await response.json();
          parsedData = data?.items?.map((tx: any) => parseFormaTx(tx, Object.keys(chainInfo.nativeDenoms)[0]));
        } catch (_) {
          //
        }
        break;
      }
      case 'lightlink': {
        try {
          const explorer =
            selectedNetwork === 'mainnet' ? 'https://phoenix.lightlink.io' : 'https://pegasus.lightlink.io';
          const url = `${explorer}/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`;
          const response = await fetch(url);
          const data = await response.json();
          parsedData = data?.items?.map((tx: any) => parseFormaTx(tx, Object.keys(chainInfo.nativeDenoms)[0]));
        } catch (_) {
          //
        }

        break;
      }
      case 'bitcoin':
      case 'bitcoinSignet': {
        try {
          const url = `${rpcUrl}/address/${address}/txs`;
          const response = await fetch(url);
          const data = await response.json();
          parsedData = data?.map((tx: any) => parseBitcoinTx(tx, Object.keys(chainInfo.nativeDenoms)[0], address));
        } catch (_) {
          //
        }

        break;
      }

      case 'movement':
      case 'aptos': {
        try {
          const aptos = await AptosTx.getAptosClient(restUrl);
          const txs = await aptos.getTransactions(address);
          parsedData = await Promise.all(
            txs
              .filter((tx) => tx.type === TransactionResponseType.User)
              .map((tx) =>
                parseAptosTx(
                  tx as UserTransactionResponse,
                  ibcTraceFetcher,
                  restUrl,
                  chainInfo.chainId,
                  Object.keys(chainInfo.nativeDenoms)[0],
                ),
              ),
          );
          parsedData = parsedData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (_) {
          //
        }
        break;
      }

      default: {
        if (chainInfo?.evmOnlyChain) {
          try {
            if (ankrChainMap[activeChain]) {
              const url = `https://api.leapwallet.io/proxy/ankr/activity`;
              const { data } = await axios.post(url, {
                blockchains: [ankrChainMap[activeChain]],
                walletAddress: address,
                descOrder: true,
              });

              if (data?.error) {
                throw new Error(data.error.message);
              }

              parsedData = data?.result?.transactions?.map((tx: any) =>
                parseAnkrTx(tx, Object.keys(chainInfo.nativeDenoms)[0]),
              );
            }
          } catch (_) {
            console.log('error', _);
            //
          }
        } else {
          try {
            const chainId = selectedNetwork === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;
            const { data } = await LeapWalletApi.getActivity(address, 0, chainId ?? '');

            parsedData = data;
          } catch (_) {
            let sendParsedData: ParsedTransaction[] = [];
            try {
              const sendParams = {
                'pagination.limit': 20,
                'pagination.reverse': true,
                events: `transfer.sender='${address}'`,
                query: `transfer.recipient='${address}'`,
              };

              const sendQuery = qs.stringify(sendParams);

              const sendData = await axiosWrapper({
                baseURL: restUrl,
                method: 'get',
                url: `/cosmos/tx/v1beta1/txs?${sendQuery}`,
              });

              sendParsedData = sendData.data?.tx_responses
                ?.map((tx: any) => {
                  try {
                    const res = txnParser.parse(tx);
                    if (res.success) {
                      return res.data;
                    }
                    return null;
                  } catch {
                    return null;
                  }
                })
                .filter(Boolean);
            } catch (_) {
              //
            }

            let receiveParsedData: ParsedTransaction[] = [];
            try {
              const receiveParams = {
                'pagination.limit': 20,
                'pagination.reverse': true,
                events: `transfer.recipient='${address}'`,
                query: `transfer.recipient='${address}'`,
              };

              const receiveQuery = qs.stringify(receiveParams);

              const receiveData = await axiosWrapper({
                baseURL: restUrl,
                method: 'get',
                url: `/cosmos/tx/v1beta1/txs?${receiveQuery}`,
              });

              receiveParsedData = receiveData.data?.tx_responses
                ?.map((tx: any) => {
                  try {
                    const res = txnParser.parse(tx);
                    if (res.success) {
                      return res.data;
                    }
                    return null;
                  } catch {
                    return null;
                  }
                })
                .filter(Boolean);
            } catch (_) {
              //
            }

            parsedData = unionOfTxs(sendParsedData, receiveParsedData);
          }
        }
      }
    }

    const activity = await Promise.all(
      parsedData?.map(async (parsedTx) => {
        try {
          const chainId = selectedNetwork === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;
          const txnFee = parsedTx.fee?.amount[0];
          let feeTokenInfo = txnFee
            ? await ibcTraceFetcher.fetchIbcTrace(txnFee.denom, restUrl, chainId ?? '')
            : undefined;
          if (chainInfo.beta && chainInfo.nativeDenoms && !feeTokenInfo) {
            feeTokenInfo = Object.values(chainInfo.nativeDenoms)[0];
          }
          const feeAmount = txnFee
            ? fromSmall(txnFee.amount.toString(), coinDecimals ?? feeTokenInfo?.coinDecimals)
            : undefined;

          const content = await getActivityCardContent({
            parsedTx,
            address,
            restUrl,
            chainId,
            coinDecimals,
            ibcTraceFetcher,
          });
          content.feeAmount = feeAmount && feeTokenInfo ? `${feeAmount} ${feeTokenInfo?.coinDenom ?? ''}` : '';

          return { parsedTx, content };
        } catch (_) {
          return null;
        }
      }),
    );

    return (activity.filter((tx) => tx) as { parsedTx: ParsedTransaction; content: ActivityCardContent }[]).sort(
      (a, b) => new Date(b?.parsedTx?.timestamp).getTime() - new Date(a?.parsedTx?.timestamp).getTime(),
    );
  } catch (error) {
    console.log('Tx Parsing Error', error);
    return [];
  }
};
