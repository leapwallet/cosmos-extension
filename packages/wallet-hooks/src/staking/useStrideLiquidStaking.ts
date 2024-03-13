import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, coin, GasPrice, StdFee } from '@cosmjs/stargate';
import {
  axiosWrapper,
  ChainInfos,
  DefaultGasEstimates,
  fromSmall,
  simulateStrideLiquidStaking,
  simulateStrideRedeemLiquidStaking,
  StrideTx,
  SupportedChain,
  toSmall,
  transactionDeclinedError,
} from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { currencyDetail, useformatCurrency, useUserPreferredCurrency } from '../settings';
import {
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useGasPriceSteps,
  useGetChains,
  useLSStrideEnabledDenoms,
  usePendingTxState,
} from '../store';
import { useTxHandler } from '../tx';
import { ActivityType, TxCallback, WALLETTYPE } from '../types';
import {
  fetchCurrency,
  formatTokenAmount,
  getMetaDataForLsStakeTx,
  getMetaDataForLsUnstakeTx,
  useNativeFeeDenom,
} from '../utils';

type txMode = 'delegate' | 'undelegate';

// For this hook to calculate txFees, manually call simulateTransaction on frontend within proper useeffects.
export function useStrideLiquidStaking({ forceStrideAddress }: { forceStrideAddress?: string }) {
  // HOOKS
  const supportedDenoms = useLSStrideEnabledDenoms();
  const gasPriceSteps = useGasPriceSteps();
  const defaultGasEstimates = useDefaultGasEstimates();
  const chainInfos = useGetChains();
  const getTxHandler = useTxHandler({ forceChain: 'stride' });
  const { activeWallet } = useActiveWalletStore();
  const [preferredCurrency] = useUserPreferredCurrency();
  const [formatCurrency] = useformatCurrency();
  const address = useAddress();
  const strideAddress = forceStrideAddress ?? address;
  const { setPendingTx } = usePendingTxState();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const denom = useNativeFeeDenom('stride');

  // STATES
  const [memo, setMemo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [fees, setFees] = useState<StdFee>();
  const [currencyFees, setCurrencyFees] = useState<string>();
  const [selectedDenom, setSelectedDenom] = useState<any>();
  const [hostZoneAddress, setHostZoneAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);

  const { lcdUrl } = useChainApis('stride');

  // FUNCTIONS
  const onTxSuccess = async (promise: any, mode: ActivityType, txHash: string, callback?: TxCallback) => {
    setPendingTx({
      img: chainInfos['stride'].chainSymbolImageUrl,
      sentAmount: formatTokenAmount(amount, '', 4),
      sentUsdValue: '',
      subtitle1: ``,
      title1: `LiquidStaked ${selectedDenom?.coinMinimalDenom}`,
      txStatus: 'loading',
      txType: mode,
      promise,
      txHash,
    });
    showLedgerPopup && setShowLedgerPopup(false);
    callback && callback('success');
  };

  const { data: strideData, status: strideDataStatus } = useQuery(
    [lcdUrl, selectedDenom?.coinMinimalDenom, supportedDenoms],
    async (): Promise<any> => {
      const res = await axiosWrapper({
        baseURL: lcdUrl,
        method: 'get',
        url: `/Stride-Labs/stride/stakeibc/host_zone/${
          ChainInfos[supportedDenoms?.[selectedDenom?.coinMinimalDenom ?? 'uatom'] ?? 'cosmos'].chainId
        }`,
      });

      const data = res.data;
      return data.host_zone;
    },
    { enabled: !!lcdUrl && !!selectedDenom?.coinMinimalDenom && !!supportedDenoms },
  );

  const simulateStakeTx = useCallback(
    async (amount: string) => {
      return await simulateStrideLiquidStaking(
        lcdUrl ?? '',
        strideAddress,
        amount,
        selectedDenom?.coinMinimalDenom ?? '',
      );
    },
    [strideAddress, memo, selectedDenom],
  );

  const simulateUnstakeTx = useCallback(
    async (amount: string) => {
      return await simulateStrideRedeemLiquidStaking(
        lcdUrl ?? '',
        strideAddress,
        amount,
        ChainInfos[supportedDenoms?.[selectedDenom?.coinMinimalDenom ?? ''] ?? 'cosmos'].chainId,
        hostZoneAddress,
      );
    },
    [strideAddress, memo, selectedDenom, supportedDenoms],
  );

  const executeStakeTx = useCallback(
    async (amount: string, fee: StdFee, txHandler: StrideTx) => {
      return await txHandler.liquidStake(strideAddress, amount, selectedDenom?.coinMinimalDenom ?? '', fee, memo);
    },
    [strideAddress, memo, selectedDenom],
  );

  const executeUnstakeTx = useCallback(
    async (amount: string, fee: StdFee, txHandler: StrideTx) => {
      return await txHandler.redeemliquidStake(
        strideAddress,
        amount,
        ChainInfos[supportedDenoms?.[selectedDenom?.coinMinimalDenom ?? ''] ?? 'cosmos'].chainId,
        hostZoneAddress,
        fee,
        memo,
      );
    },
    [strideAddress, memo, selectedDenom, hostZoneAddress, supportedDenoms],
  );

  const getAmountAndGasPrice = useCallback(
    (amount: string) => {
      const gasPriceStep = gasPriceSteps.stride.low.toString();
      const denom = Object.values(chainInfos['stride'].nativeDenoms)[0];
      const gasPrice = GasPrice.fromString(`${gasPriceStep + denom.coinMinimalDenom}`);
      return {
        amt: coin(toSmall(amount, denom?.coinDecimals), selectedDenom?.coinMinimalDenom ?? ''),
        gasPrice,
      };
    },
    [chainInfos],
  );

  const executeLiquidStakeTx = async ({
    mode,
    wallet,
    callback,
    isSimulation = true,
  }: {
    mode: txMode;
    wallet?: OfflineSigner;
    callback?: TxCallback;
    isSimulation: boolean;
  }) => {
    if (isLoading || !strideAddress) {
      return;
    }

    setError('');
    if (
      !amount ||
      new BigNumber(amount).lte(0) ||
      !selectedDenom ||
      !supportedDenoms ||
      !Object.keys(supportedDenoms).includes(selectedDenom.coinMinimalDenom) ||
      !strideAddress ||
      (mode === 'undelegate' && !hostZoneAddress)
    ) {
      setFees(undefined);
      setCurrencyFees('');
      return;
    }

    setLoading(true);
    try {
      const tx = !isSimulation && wallet ? await getTxHandler(wallet) : undefined;

      const denom = Object.values(chainInfos['stride'].nativeDenoms)[0];
      const { amt, gasPrice } = getAmountAndGasPrice(amount);

      const defaultGasStake = defaultGasEstimates.stride?.DEFAULT_GAS_STAKE || DefaultGasEstimates.DEFAULT_GAS_STAKE;
      let gasEstimate = defaultGasStake;

      try {
        const { gasUsed } =
          mode === 'delegate' ? await simulateStakeTx(amt.amount) : await simulateUnstakeTx(amt.amount);
        gasEstimate = gasUsed;
      } catch (e: any) {
        console.error(e?.message ?? e);
      }

      // FEES
      const fee = calculateFee(Math.round((gasEstimate ?? defaultGasStake) * 1.5), gasPrice);

      if (isSimulation) {
        const feeCurrencyValue = await fetchCurrency(
          fromSmall(fee.amount[0].amount, denom?.coinDecimals),
          denom.coinGeckoId,
          denom.chain as unknown as SupportedChain,
          currencyDetail[preferredCurrency].currencyPointer,
        );
        setCurrencyFees(feeCurrencyValue ?? '0');
        setFees(fee);
      }

      setError('');

      // TX
      if (isSimulation) return;
      if (tx) {
        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          setShowLedgerPopup(true);
        }
        const strideTx = tx as StrideTx;
        const txHash =
          mode === 'delegate'
            ? await executeStakeTx(amt.amount, fee, strideTx)
            : await executeUnstakeTx(amt.amount, fee, strideTx);

        const metadata =
          mode === 'delegate'
            ? getMetaDataForLsStakeTx('stride', strideAddress, { amount: amt.amount, denom: amt.denom })
            : getMetaDataForLsUnstakeTx(
                'stride',
                supportedDenoms[selectedDenom.coinMinimalDenom],
                amt.amount,
                strideData.redemption_rate,
                hostZoneAddress,
                strideAddress,
              );

        await txPostToDB({
          txHash,
          txType: mode === 'delegate' ? CosmosTxType.LSStake : CosmosTxType.LSUnstake,
          metadata,
          feeDenomination: fee.amount[0].denom,
          feeQuantity: fee.amount[0].amount,
        });
        const txResult = tx.pollForTx(txHash);

        if (txResult) onTxSuccess(txResult, mode, txHash, callback);
        setError('');
      }
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

  const onReviewStakeTransaction = async (wallet: OfflineSigner, callback: TxCallback, isSimulation: boolean) => {
    executeLiquidStakeTx({ mode: 'delegate', wallet, callback, isSimulation });
  };

  const onReviewUnstakeTransaction = async (wallet: OfflineSigner, callback: TxCallback, isSimulation: boolean) => {
    executeLiquidStakeTx({ mode: 'undelegate', wallet, callback, isSimulation });
  };

  const onSimulateStakeTx = async () => {
    executeLiquidStakeTx({ mode: 'delegate', isSimulation: true });
  };

  const onSimulateUnstakeTx = async () => {
    executeLiquidStakeTx({ mode: 'undelegate', isSimulation: true });
  };

  const displayFeeText =
    amount.length === 0 || !fees
      ? 'Enter amount to see the transaction fee'
      : `Transaction fee: ${formatTokenAmount(fromSmall(fees?.amount[0]?.amount, denom?.coinDecimals), '', 5)} ${
          denom?.coinDenom
        } (${formatCurrency(new BigNumber(currencyFees ?? '0'))})`;

  return {
    onReviewStakeTransaction,
    onReviewUnstakeTransaction,
    strideData,
    strideDataStatus,
    fees,
    setFees,
    amount,
    setAmount,
    supportedDenoms,
    displayFeeText,
    error,
    memo,
    setMemo,
    onSimulateStakeTx,
    onSimulateUnstakeTx,
    hostZoneAddress,
    setHostZoneAddress,
    selectedDenom,
    setSelectedDenom,
    isLoading,
    showLedgerPopup,
  };
}
