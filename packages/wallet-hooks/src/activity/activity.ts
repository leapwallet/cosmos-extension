import { axiosWrapper, SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { fromSmall } from '@leapwallet/cosmos-wallet-sdk/dist/utils/token-converter';
import { ParsedMessageType, type ParsedTransaction, TransactionParser } from '@leapwallet/parser-parfait';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import qs from 'qs';
import { useCallback, useEffect, useState } from 'react';

import { useActiveChain, useAddress, useChainsStore, useDenoms } from '../store';
import { useSelectedNetwork } from '../store';
import { useChainApis } from '../store';
import { Activity, ActivityCardContent, getActivityContentProps, TxResponse } from '../types';
import { denomFetcher, sliceAddress } from '../utils';
import { convertVoteOptionToString } from './../utils/vote-option';
import { activityQueryIds } from './queryIds';

export type Validators = Record<string, string>;

export const useInvalidateActivity = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries([activityQueryIds.datasend]);
  }, [queryClient]);
};

async function getActivityCardContent({
  parsedTx,
  address,
  denoms,
  restUrl,
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
      const sentTokenInfo = denoms[msg.tokens[0].denomination as SupportedDenoms];
      const isReceive = msg.toAddress === address;
      content.txType = isReceive ? 'receive' : 'send';
      content.title1 = isReceive
        ? `Received ${sentTokenInfo?.coinDenom ?? ''}`
        : `Sent ${sentTokenInfo?.coinDenom ?? ''}`;
      content.subtitle1 = isReceive
        ? `From ${sliceAddress(msg.fromAddress ?? '')}`
        : `To ${sliceAddress(msg.toAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.tokens[0].quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.StakingDelegate: {
      const sentTokenInfo = denoms[msg.denomination as SupportedDenoms];
      content.txType = 'delegate';
      content.title1 = 'Delegation';
      content.subtitle1 = `${sliceAddress(msg.delegatorAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.StakingUndelegate: {
      const sentTokenInfo = denoms[msg.denomination as SupportedDenoms];
      content.txType = 'undelegate';
      content.title1 = 'Undelegation';
      content.subtitle1 = `${sliceAddress(msg.delegatorAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.IbcSend: {
      const sentTokenInfo = denoms[msg.token.denomination as SupportedDenoms];
      content.txType = 'ibc/transfer';
      content.title1 = 'IBC Send';
      content.subtitle1 = `To ${sliceAddress(msg.toAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.token.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.IbcReceive: {
      const sentTokenInfo = denoms[msg.token.denomination as SupportedDenoms];
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
    case ParsedMessageType.GammSwapExact: {
      content.txType = 'swap';
      const lastRoute = msg.routes[msg.routes.length - 1];
      const tokenGained = {
        denomination: lastRoute.tokenOutDenomination,
        quantity: msg.tokenOutAmount,
      };
      const tokenGiven = {
        denomination: msg.tokenIn.denomination,
        quantity: msg.tokenIn.quantity,
      };
      const fromToken = tokenGiven ? await denomFetcher.fetchDenomTrace(tokenGiven.denomination, restUrl) : undefined;
      const toToken = tokenGained ? await denomFetcher.fetchDenomTrace(tokenGained.denomination, restUrl) : undefined;

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
    }
  }
  return content;
}

function unionOfTxs(_txs1: Activity[], _txs2: Activity[]): Activity[] {
  if (!_txs1 || _txs1.length === 0) return _txs2;
  if (!_txs2 || _txs2.length === 0) return _txs1;
  const txs = new Map();
  _txs1.forEach((tx) => txs.set(tx.parsedTx.txHash, tx));

  _txs2.forEach((tx) => txs.set(tx.parsedTx.txHash, tx));
  return Array.from(txs.values()).sort(
    (a, b) => new Date(b.parsedTx.timestamp).getTime() - new Date(a.parsedTx.timestamp).getTime(),
  );
}

const txnParser = new TransactionParser();

export function useActivity(forceChain?: SupportedChain): {
  txResponse: TxResponse;
  resetActivity: () => void;
  refetchActivity: () => Promise<void>;
} {
  const activeChain = forceChain ?? useActiveChain();
  const selectedNetwork = useSelectedNetwork();

  const [activitySend, setActivitySend] = useState<Activity[]>([]);
  const [activityRecv, setActivityRecv] = useState<Activity[]>([]);

  const address = useAddress();

  const [nextSend, setNextSend] = useState<number>();
  const [offsetSend, setOffsetSend] = useState<number>(0);
  const [doneSend, setDoneSend] = useState(false);

  const [nextRecv, setNextRecv] = useState<number>();
  const [offsetRecv, setOffsetRecv] = useState<number>(0);
  const [doneRecv, setDoneRecv] = useState(false);

  const { lcdUrl: restUrl = '' } = useChainApis(activeChain);
  const { chains } = useChainsStore();
  const denoms = useDenoms();

  const resetActivity = () => {
    setActivitySend([]);
    setActivityRecv([]);
    setOffsetSend(0);
    setOffsetRecv(0);
    setNextRecv(undefined);
    setNextSend(undefined);
  };

  useEffect(() => {
    resetActivity();
  }, [activeChain, address, selectedNetwork]);

  const {
    data: dataSend = { parsedData: [], paginationTotal: 0, sendActivity: [] },
    status: dataSendStatus,
    refetch: refetchDataSend,
  } = useQuery(
    [activityQueryIds.datasend, address, activeChain, offsetSend, selectedNetwork, restUrl],
    async (): Promise<
      { parsedData: ParsedTransaction[]; paginationTotal: number; sendActivity: Activity[] } | undefined
    > => {
      if (address) {
        const params = {
          'pagination.limit': 100,
          'pagination.offset': offsetSend,
          'pagination.reverse': true,
          events: `transfer.sender='${address}'`,
        };
        const query = qs.stringify(params);

        try {
          const data = await axiosWrapper({
            baseURL: restUrl,
            method: 'get',
            url: `/cosmos/tx/v1beta1/txs?${query}`,
          });

          const parsedData: ParsedTransaction[] = data.data?.tx_responses
            ?.map((tx: any) => {
              const res = txnParser.parse(tx);
              if (res.success) {
                return res.data;
              }
              return null;
            })
            .filter(Boolean);

          const sendActivity = await Promise.all(
            parsedData?.map(async (parsedTx) => {
              const txnFee = parsedTx.fee.amount[0];
              let feeTokenInfo = txnFee ? denoms[txnFee.denom as SupportedDenoms] : undefined;
              if (chains[activeChain].beta && chains[activeChain].nativeDenoms) {
                feeTokenInfo = Object.values(chains[activeChain].nativeDenoms)[0];
              }
              const feeAmount = txnFee ? fromSmall(txnFee.amount.toString(), feeTokenInfo?.coinDecimals) : undefined;

              const content = await getActivityCardContent({
                parsedTx,
                address,
                denoms,
                restUrl,
              });
              content.feeAmount = feeAmount && feeTokenInfo ? `${feeAmount}${feeTokenInfo?.coinDenom ?? ''}` : '';

              return { parsedTx, content };
            }),
          );

          return { parsedData, paginationTotal: data.data.pagination?.total ?? data.data.total, sendActivity };
        } catch (e) {
          console.log('Tx Parsing Error', e);
          return { parsedData: [], paginationTotal: 0, sendActivity: [] };
        }
      } else {
        return { parsedData: [], paginationTotal: 0, sendActivity: [] };
      }
    },
    { retry: 3, staleTime: 60 * 1000, refetchOnWindowFocus: true },
  );

  const {
    data: dataRecv = { parsedData: [], paginationTotal: 0, receiveActivity: [] },
    status: dataRecvStatus,
    refetch: refetchDataRecv,
  } = useQuery(
    [activityQueryIds.datarecv, address, activeChain, offsetRecv, selectedNetwork, restUrl],
    async (): Promise<
      { parsedData: ParsedTransaction[]; paginationTotal: number; receiveActivity: Activity[] } | undefined
    > => {
      if (address) {
        const params = {
          'pagination.limit': 100,
          'pagination.offset': offsetRecv,
          'pagination.reverse': true,
          events: `transfer.recipient='${address}'`,
        };
        const query = qs.stringify(params);

        try {
          const data = await axiosWrapper({
            baseURL: restUrl,
            method: 'get',
            url: `/cosmos/tx/v1beta1/txs?${query}`,
          });

          const parsedData: ParsedTransaction[] = data.data?.tx_responses
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
          const receiveActivity = await Promise.all(
            parsedData?.map(async (parsedTx) => {
              const txnFee = parsedTx.fee.amount[0];
              let feeTokenInfo = txnFee ? denoms[txnFee.denom as SupportedDenoms] : undefined;
              if (chains[activeChain].beta && chains[activeChain].nativeDenoms) {
                feeTokenInfo = Object.values(chains[activeChain].nativeDenoms)[0];
              }
              const feeAmount = txnFee ? fromSmall(txnFee.amount.toString(), feeTokenInfo?.coinDecimals) : undefined;

              const content = await getActivityCardContent({
                parsedTx,
                address,
                denoms,
                restUrl,
              });
              content.feeAmount = feeAmount && feeTokenInfo ? `${feeAmount}${feeTokenInfo?.coinDenom ?? ''}` : '';

              return { parsedTx, content };
            }),
          );
          return { parsedData, paginationTotal: data.data.pagination?.total ?? data.data.total, receiveActivity };
        } catch (e) {
          console.log('Tx Parsing Error', e);
          return { parsedData: [], paginationTotal: 0, receiveActivity: [] };
        }
      } else {
        return { parsedData: [], paginationTotal: 0, receiveActivity: [] };
      }
    },
    { retry: 3, staleTime: 60 * 1000, refetchOnWindowFocus: true },
  );

  useEffect(() => {
    if (dataRecv?.receiveActivity?.length) {
      setActivityRecv((txs) => [...txs, ...(dataRecv?.receiveActivity ?? [])]);
      if (offsetRecv !== undefined) {
        setNextRecv(offsetRecv + 100);
      }
    }
  }, [dataRecv?.receiveActivity, offsetRecv]);

  useEffect(() => {
    if (dataSend?.sendActivity?.length) {
      setActivitySend((txs) => [...txs, ...(dataSend?.sendActivity ?? [])]);
      if (offsetSend !== undefined) {
        setNextSend(offsetSend + 100);
      }
    }
  }, [dataSend?.sendActivity, offsetSend]);

  useEffect(() => {
    setDoneSend(activitySend?.length === Number(dataSend?.paginationTotal ?? 0));
  }, [activitySend, dataSend]);

  useEffect(() => {
    setDoneRecv(activityRecv?.length === Number(dataRecv?.paginationTotal ?? 0));
  }, [activityRecv, dataRecv]);

  const done = doneRecv || doneSend;

  const more = useCallback(() => {
    activitySend?.length && !doneSend && setOffsetSend(nextSend ?? 0);
    activityRecv?.length && !doneRecv && setOffsetRecv(nextRecv ?? 0);
  }, [activitySend, activityRecv, doneSend, doneRecv, nextSend, nextRecv]);

  const refetchActivity = async () => {
    await Promise.all([refetchDataRecv(), refetchDataSend()]);
  };

  return {
    txResponse: {
      activity: unionOfTxs(activitySend, activityRecv),
      done,
      more,
      next: nextSend === undefined && nextRecv === undefined ? undefined : (nextRecv ?? 0) + (nextSend ?? 0),
      loading: dataRecvStatus === 'loading' || dataSendStatus === 'loading',
      error: dataRecvStatus === 'error' && dataSendStatus === 'error',
    },
    refetchActivity,
    resetActivity,
  };
}
