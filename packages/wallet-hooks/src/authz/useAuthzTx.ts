import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, StdFee } from '@cosmjs/stargate';
import {
  GasPrice,
  getSimulationFee,
  NativeDenom,
  simulateRevokeGrant,
  SupportedChain,
  transactionDeclinedError,
} from '@leapwallet/cosmos-wallet-sdk';
import { Coin } from '@leapwallet/parser-parfait';
import { useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import { useActiveChain, useAddress, useChainApis, useGetChains, usePendingTxState } from '../store';
import { useTxHandler } from '../tx';
import { TxCallback } from '../types';
import { GasOptions, getMetaDataForAuthzTx, Grant, useGasRateQuery, useNativeFeeDenom } from '../utils';

const GAS_ESTIMATE = 240_000;

export type AuthzTxType = {
  onReviewRevokeTransaction: (wallet: OfflineSigner, callback: TxCallback) => Promise<void>;
  error: string;
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  selectedChain: SupportedChain;
  showAuthzDetailsFor: Grant | undefined;
  setShowAuthzDetailsFor: React.Dispatch<React.SetStateAction<Grant | undefined>>;
  setSelectedChain: React.Dispatch<React.SetStateAction<SupportedChain>>;
  setFeeDenom: React.Dispatch<
    React.SetStateAction<
      NativeDenom & {
        ibcDenom?: string | undefined;
      }
    >
  >;
  setGasOption: React.Dispatch<React.SetStateAction<GasOptions>>;
  gasOption: GasOptions;
  gasEstimate: number;
  userPreferredGasLimit: number | undefined;
  userPreferredGasPrice: GasPrice | undefined;
  setUserPreferredGasLimit: React.Dispatch<React.SetStateAction<number | undefined>>;
  setUserPreferredGasPrice: React.Dispatch<React.SetStateAction<GasPrice | undefined>>;
  setMsgType: React.Dispatch<React.SetStateAction<string>>;
  feeDenom: NativeDenom & {
    ibcDenom?: string | undefined;
  };
  gasError: string | null;
  setGasError: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  selectedChainHasMainnetOnly: boolean;
};

export function useAuthzTx() {
  const chainInfos = useGetChains();
  const { setPendingTx } = usePendingTxState();
  const activeChain = useActiveChain();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const [memo, setMemo] = useState<string>('Revoke authz grant via Leap');
  const [error, setError] = useState<string>('');
  const [gasError, setGasError] = useState<string | null>(null);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedChain, setSelectedChain] = useState(activeChain);
  const [showAuthzDetailsFor, setShowAuthzDetailsFor] = useState<Grant>();
  const [msgType, setMsgType] = useState('');

  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [gasEstimate, setGasEstimate] = useState<number>(GAS_ESTIMATE);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);

  const selectedChainHasMainnetOnly = useMemo(() => {
    if (chainInfos[selectedChain].testnetChainId === chainInfos[selectedChain].chainId) {
      return false;
    }

    return true;
  }, [selectedChain]);

  const nativeFeeDenom = useNativeFeeDenom(selectedChain, selectedChainHasMainnetOnly ? 'mainnet' : undefined);
  const [feeDenom, setFeeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom);
  const activeAddress = useAddress(selectedChain);
  const { lcdUrl } = useChainApis(selectedChain, selectedChainHasMainnetOnly ? 'mainnet' : undefined);
  const getTxHandler = useTxHandler({
    forceChain: selectedChain,
    forceNetwork: selectedChainHasMainnetOnly ? 'mainnet' : undefined,
  });

  const gasAdjustment = useGasAdjustmentForChain(selectedChain);
  const gasPrices = useGasRateQuery(selectedChain, selectedChainHasMainnetOnly ? 'mainnet' : undefined);
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom];

  const onTxSuccess = async (promise: any, txHash: string, callback?: TxCallback) => {
    setPendingTx({
      img: chainInfos[selectedChain].chainSymbolImageUrl,
      sentUsdValue: '',
      subtitle1: `Grantee: ${showAuthzDetailsFor?.grantee ?? ''}`,
      title1: 'Access revoked from grantee',
      txStatus: 'loading',
      txType: 'revoke',
      promise,
      txHash,
    });

    callback && callback('success');
  };

  const fee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? gasEstimate;
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;

    const gasAdjustmentValue = gasAdjustment;
    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice);
  }, [gasPriceOptions, gasOption, gasEstimate, userPreferredGasLimit, userPreferredGasPrice, selectedChain]);

  useEffect(() => {
    setFeeDenom(nativeFeeDenom);
  }, [selectedChain]);

  useEffect(() => {
    if (showAuthzDetailsFor) {
      (async () => {
        if (!activeAddress || !selectedChain || !lcdUrl) {
          return;
        }

        let _gasEstimate = GAS_ESTIMATE;
        const _fee = getSimulationFee(feeDenom.coinMinimalDenom);

        try {
          const { gasUsed, gasWanted } = await simulateRevokeGrant(
            msgType,
            lcdUrl ?? '',
            activeAddress,
            showAuthzDetailsFor?.grantee ?? '',
            (fee?.amount as Coin[]) ?? _fee,
          );

          if (selectedChain === 'chihuahua') {
            _gasEstimate = gasWanted;
          } else {
            _gasEstimate = gasUsed;
          }
        } catch (_) {
          //
        }

        setGasEstimate(_gasEstimate);
      })();
    }
  }, [showAuthzDetailsFor, lcdUrl, activeAddress, selectedChain]);

  const executeRestakeTx = async ({ wallet, callback }: { wallet: OfflineSigner; callback: TxCallback }) => {
    if (isLoading || !activeAddress || !selectedChain) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      const tx = await getTxHandler(wallet);

      // TX
      const txHash = await await tx.revokeGrant(
        msgType,
        activeAddress,
        showAuthzDetailsFor?.grantee ?? '',
        fee as StdFee,
        memo,
      );

      await txPostToDB({
        txHash,
        txType: CosmosTxType.AuthZRevoke,
        metadata: getMetaDataForAuthzTx(showAuthzDetailsFor?.grantee ?? '', [msgType]),
        feeDenomination: fee?.amount[0].denom,
        feeQuantity: fee?.amount[0].amount,
      });

      const txResult = tx.pollForTx(txHash);
      if (txResult) onTxSuccess(txResult, txHash, callback);
      setError('');
    } catch (e: any) {
      if (e.message === transactionDeclinedError.message) {
        callback && callback('txDeclined');
      }
      setError(e.message.toString());
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  const onReviewRevokeTransaction = async (wallet: OfflineSigner, callback: TxCallback) => {
    executeRestakeTx({ wallet, callback });
  };

  return {
    onReviewRevokeTransaction,
    error,
    memo,
    setMemo,
    isLoading,
    selectedChain,
    showAuthzDetailsFor,
    setShowAuthzDetailsFor,
    setSelectedChain,
    setFeeDenom,
    setGasOption,
    gasOption,
    gasEstimate,
    userPreferredGasLimit,
    userPreferredGasPrice,
    setUserPreferredGasLimit,
    setUserPreferredGasPrice,
    setMsgType,
    feeDenom,
    gasError,
    setGasError,
    setError,
    selectedChainHasMainnetOnly,
  };
}
