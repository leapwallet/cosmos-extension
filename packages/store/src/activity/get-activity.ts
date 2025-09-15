import type { UserTransactionResponse } from '@aptos-labs/ts-sdk';
import { AptosTx, type ChainInfo, type SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk/dist/browser/healthy-nodes/axiosWrapper';
import { fromSmall } from '@leapwallet/cosmos-wallet-sdk/dist/browser/utils/token-converter';
import { type ParsedTransaction, TransactionParser } from '@leapwallet/parser-parfait';
import type { IbcTraceFetcher } from 'assets';
import axios from 'axios';
import qs from 'qs';

import { fetchActivity } from './fetch-activity';
import { getActivityCardContent } from './get-activity-card-content';
import { parseAnkrTx } from './parse-ankr-tx';
import { parseAptosTx } from './parse-aptos-tx';
import { parseBitcoinTx } from './parse-bitcoin-tx';
import { parseFormaTx } from './parse-forma-tx';
import type { ActivityCardContent } from './types';
import { unionOfTxs } from './union-of-txs';

const txnParser = new TransactionParser();

export const getChainActivity = async (config: {
  chainInfo: ChainInfo;
  chain: SupportedChain;
  network: 'mainnet' | 'testnet';
  address: string;
  rpcUrl?: string;
  ankrChainMap: Record<string, string>;
  restUrl: string;
  ibcTraceFetcher: IbcTraceFetcher;
}) => {
  const { chain, address, ankrChainMap, chainInfo, ibcTraceFetcher, restUrl, rpcUrl, network } = config || {};
  try {
    let parsedData: ParsedTransaction[] = [];
    const coinDecimals = chainInfo?.evmOnlyChain ? 18 : undefined;

    switch (chain) {
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
      case 'manta': {
        try {
          const explorer =
            network === 'mainnet'
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
          const explorer = network === 'mainnet' ? 'https://phoenix.lightlink.io' : 'https://pegasus.lightlink.io';
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
              .filter((tx) => tx.type === 'user_transaction')
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
            if (ankrChainMap[chain]) {
              const url = `https://api.leapwallet.io/proxy/ankr/activity`;
              const { data } = await axios.post(url, {
                blockchains: [ankrChainMap[chain]],
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
            const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;
            const { data } = await fetchActivity(address, 0, chainId ?? '');

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
          const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;
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
