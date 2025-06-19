/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Coin } from '@cosmjs/amino';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, coin, StdFee } from '@cosmjs/stargate';
import {
  DenomsRecord,
  fromSmall,
  GasPrice,
  getNobleSwapPools,
  LedgerError,
  NativeDenom,
  NobleTx,
  simulateClaimUSD,
  simulateSwapUSD,
  SupportedChain,
  toSmall,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import { currencyDetail, useformatCurrency, useUserPreferredCurrency } from '../settings';
import {
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useGetChains,
  useSelectedNetwork,
} from '../store';
import { useTxHandler } from '../tx';
import { Token, WALLETTYPE } from '../types';
import {
  GasOptions,
  getChainId,
  getMetaDataForEarnNobleTx,
  getTxnLogAmountValue,
  useGasRateQuery,
  useGetGasPrice,
  useNativeFeeDenom,
} from '../utils';
import { fetchCurrency } from '../utils/findUSDValue';
import { getNativeDenom } from '../utils/getNativeDenom';
import { formatTokenAmount } from '../utils/strings';
import { useGetFeeMarketGasPricesSteps, useHasToCalculateDynamicFee } from '../utils-hooks';

export type EARN_MODE = 'deposit' | 'withdraw' | 'claim';

export function useEarnTx(denoms: DenomsRecord, mode: EARN_MODE) {
  const [sourceToken, setSourceToken] = useState<Token>();
  const [destinationToken, setDestinationToken] = useState<Token>();
  const activeChain = 'noble' as SupportedChain;
  const selectedNetwork = useSelectedNetwork();
  const defaultGasEstimates = useDefaultGasEstimates();
  const [, setGasPriceFactor] = useState<'low' | 'average' | 'high'>('low');
  const [recommendedGasLimit, setRecommendedGasLimit] = useState(0);
  const getGasPrice = useGetGasPrice(activeChain, selectedNetwork);

  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const gasAdjustment = useGasAdjustmentForChain(activeChain);
  const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork);
  const gasPrices = useGasRateQuery(denoms, activeChain, selectedNetwork);
  const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork);
  const getFeeMarketGasPricesSteps = useGetFeeMarketGasPricesSteps(activeChain, selectedNetwork);

  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom);
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [gasPriceOptions, setGasPriceOptions] = useState(gasPrices?.[feeDenom.coinMinimalDenom]);

  const [amount, setAmount] = useState<string>('');
  const [amountOut, setAmountOut] = useState('');

  // HOOKS

  const chainInfos = useGetChains();

  const getTxHandler = useTxHandler({
    forceChain: 'noble',
    forceNetwork: selectedNetwork,
  });
  const { activeWallet } = useActiveWalletStore();
  const address = useAddress(activeChain);
  const [preferredCurrency] = useUserPreferredCurrency();
  const [formatCurrency] = useformatCurrency();

  const [fees, setFees] = useState<StdFee>();
  const [currencyFees, setCurrencyFees] = useState<string>();
  const [error, setError] = useState<string>();
  const [ledgerError, setLedgerErrorMsg] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);
  const [showKeystonePopup, setShowKeystonePopup] = useState(false);
  const [txHash, setTxHash] = useState<string>();

  const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);

  /**
   * Fee calculation
   */

  useEffect(() => {
    (async function () {
      if (hasToCalculateDynamicFee && feeDenom.coinMinimalDenom === nativeFeeDenom?.coinMinimalDenom) {
        const { low, medium, high } = await getFeeMarketGasPricesSteps(feeDenom.coinMinimalDenom);

        setGasPriceOptions({
          low: GasPrice.fromString(`${low}${feeDenom.coinMinimalDenom}`),
          medium: GasPrice.fromString(`${medium}${feeDenom.coinMinimalDenom}`),
          high: GasPrice.fromString(`${high}${feeDenom.coinMinimalDenom}`),
        });
      }
    })();
  }, [
    feeDenom.coinMinimalDenom,
    gasOption,
    recommendedGasLimit,
    userPreferredGasLimit,
    userPreferredGasPrice,
    activeChain,
    selectedNetwork,
    hasToCalculateDynamicFee,
    nativeFeeDenom?.coinMinimalDenom,
  ]);

  const customFee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? Number(recommendedGasLimit);
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;

    return calculateFee(Math.ceil(_gasLimit * gasAdjustment), _gasPrice);
  }, [
    gasPriceOptions,
    gasOption,
    recommendedGasLimit,
    userPreferredGasLimit,
    userPreferredGasPrice,
    activeChain,
    feeDenom.coinMinimalDenom,
  ]);

  const onTxSuccess = async (txHash: string, callback?: (mode: EARN_MODE) => void) => {
    setTxHash(txHash);
    if (showLedgerPopup) {
      setShowLedgerPopup(false);
    }
    if (showKeystonePopup) {
      setShowKeystonePopup(false);
    }
    callback?.(mode);
  };

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const setLedgerError = useCallback((error?: string) => {
    setLedgerErrorMsg(error);
    setShowLedgerPopup(false);
  }, []);

  const simulateTx = useCallback(() => {
    switch (mode) {
      case 'deposit':
        return simulateSwapUSD(lcdUrl ?? '', address, getAmount(amount, 'uusdc'), getAmount('0', 'uusdn'));

      case 'withdraw':
        return simulateSwapUSD(lcdUrl ?? '', address, getAmount(amount, 'uusdn'), getAmount('0', 'uusdc'));

      case 'claim':
        return simulateClaimUSD(lcdUrl ?? '', address);
    }
  }, [mode, lcdUrl, address, amount]);

  const executeTx = useCallback(
    async (amount: Coin, fee: StdFee, txHandler: NobleTx) => {
      switch (mode) {
        case 'deposit': {
          const pools = await getNobleSwapPools(lcdUrl ?? '');
          return await txHandler.swap(
            address,
            amount,
            [{ denomTo: amount.denom === 'uusdc' ? 'uusdn' : 'uusdc', poolId: pools?.[0]?.id }],
            getAmount('0', 'uusdn'),
            fee,
          );
        }

        case 'withdraw': {
          const pools = await getNobleSwapPools(lcdUrl ?? '');
          return await txHandler.swap(
            address,
            amount,
            [{ denomTo: amount.denom === 'uusdc' ? 'uusdn' : 'uusdc', poolId: pools?.[0]?.id }],
            getAmount('0', 'uusdc'),
            fee,
          );
        }

        case 'claim': {
          return await txHandler.claim(address, fee);
        }
      }
    },
    [mode, address],
  );

  const getAmount = useCallback((amount: string, denom: string) => {
    return coin(toSmall(amount), denom);
  }, []);

  const executeEarnTx = async ({
    wallet,
    callback,
    isSimulation = true,
    customFee,
  }: {
    wallet?: OfflineSigner;
    callback?: (mode: EARN_MODE) => void;
    isSimulation: boolean;
    customFee?: {
      stdFee: StdFee | undefined;
      feeDenom: NativeDenom;
    };
  }) => {
    if ((isLoading && !isSimulation) || !address || !activeChain) {
      return;
    }
    if (mode === 'deposit' && !sourceToken) {
      return;
    }
    if (mode === 'withdraw' && !destinationToken) {
      return;
    }
    if (mode === 'claim' && new BigNumber(amount).lte(0.00001)) {
      setError('Reward is too low');
      return;
    }

    setError(undefined);

    if (!amount || new BigNumber(amount).lte(0)) {
      setFees(undefined);
      setCurrencyFees('');
      setAmountOut('0');
      return;
    }

    setLoading(true);

    try {
      const isLedgerWallet = activeWallet?.walletType === WALLETTYPE.LEDGER;
      const isKeystoneWallet = activeWallet?.walletType === WALLETTYPE.KEYSTONE;
      const tx: NobleTx | undefined = !isSimulation && wallet ? ((await getTxHandler(wallet)) as NobleTx) : undefined;

      const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);

      let fee: StdFee;
      let feeDenom: NativeDenom;

      if (customFee !== undefined && customFee.stdFee) {
        fee = customFee.stdFee;
        feeDenom = customFee.feeDenom;
      } else {
        const gasPrice = await getGasPrice();

        const defaultGas = defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER;
        let gasEstimate = defaultGas;

        try {
          const { gasUsed, amountOut } = await simulateTx();
          gasEstimate = gasUsed;
          setRecommendedGasLimit(gasUsed);
          setAmountOut(fromSmall(amountOut.toString()));
        } catch (error: any) {
          setError(error.message);
          setAmountOut('');
          return;
        }

        fee = calculateFee(Math.round((gasEstimate ?? defaultGas) * gasAdjustment), gasPrice);
        feeDenom = getNativeDenom(chainInfos, activeChain, selectedNetwork);
      }

      if (isSimulation) {
        const denomChainInfo = chainInfos[feeDenom.chain as SupportedChain];
        const _chainId = getChainId(denomChainInfo, selectedNetwork);
        const feeCurrencyValue = await fetchCurrency(
          fromSmall(fee.amount[0].amount, feeDenom.coinDecimals),
          feeDenom.coinGeckoId,
          feeDenom.chain as SupportedChain,
          currencyDetail[preferredCurrency].currencyPointer,
          `${_chainId}-${feeDenom.coinMinimalDenom}`,
        );
        setCurrencyFees(feeCurrencyValue ?? '0');
        setFees(fee);
      }

      setError(undefined);
      setLedgerError(undefined);

      if (tx) {
        if (isLedgerWallet) {
          setShowLedgerPopup(true);
        }
        if (isKeystoneWallet) {
          setShowKeystonePopup(true);
        }

        const txHash = await executeTx(getAmount(amount, sourceToken?.coinMinimalDenom ?? ''), fee, tx);
        onTxSuccess(txHash, callback);
        setError(undefined);

        const metadata = getMetaDataForEarnNobleTx(
          { amount: Number(amount), denom: sourceToken?.coinMinimalDenom ?? '' },
          destinationToken ? { amount: Number(amountOut), denom: destinationToken.coinMinimalDenom } : undefined,
        );

        const txnLogAmountValue = await getTxnLogAmountValue(amount, {
          coinGeckoId: sourceToken?.coinGeckoId ?? '',
          chain: sourceToken?.chain as SupportedChain,
          coinMinimalDenom: sourceToken?.coinMinimalDenom,
          chainId: getChainId(chainInfos.noble, selectedNetwork),
        });
        await txPostToDB({
          txHash,
          txType: mode === 'claim' ? CosmosTxType.StakeClaim : CosmosTxType.Swap,
          metadata,
          feeDenomination: fee.amount[0].denom,
          feeQuantity: fee.amount[0].amount,
          amount: txnLogAmountValue,
          forceChain: activeChain,
          forceNetwork: selectedNetwork,
          forceWalletAddress: address,
          chainId: chainInfos.noble.chainId,
        });
      }
    } catch (e: any) {
      if (e instanceof LedgerError) {
        setLedgerError(e.message.toString());
      } else {
        setError(e.message.toString());
      }
    } finally {
      setLoading(false);
      setShowLedgerPopup(false);
      setShowKeystonePopup(false);
    }
  };

  const onReviewTransaction = async (
    wallet: OfflineSigner,
    callback: (mode: EARN_MODE) => void,
    isSimulation: boolean,
    customFee?: {
      stdFee: StdFee | undefined;
      feeDenom: NativeDenom;
    },
  ) => {
    try {
      executeEarnTx({ wallet, callback, isSimulation, customFee });
    } catch (e) {
      //
    }
  };

  const onSimulateTx = () => {
    try {
      executeEarnTx({ isSimulation: true });
    } catch (e: any) {
      //
    }
  };

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      const amountBN = new BigNumber(amount);
      if (!amountBN.isNaN() && amountBN.gt(0)) {
        try {
          executeEarnTx({ isSimulation: true });
        } catch {
          //
        }
      } else {
        setAmountOut('0');
      }
    }, 750);

    return () => clearTimeout(timeoutID);
  }, [amount]);

  const displayFeeText =
    amount.length === 0 || !fees
      ? 'Enter amount to see the transaction fee'
      : `Transaction fee: ${formatTokenAmount(fromSmall(fees?.amount[0]?.amount, denom?.coinDecimals), '', 5)} ${
          denom?.coinDenom
        } (${formatCurrency(new BigNumber(currencyFees ?? '0'))})`;

  return {
    error,
    clearError,
    isLoading,
    fees: fromSmall(fees?.amount[0]?.amount ?? '0', denom?.coinDecimals),
    currencyFees,
    amount,
    setAmount,
    sourceToken,
    setSourceToken,
    destinationToken,
    setDestinationToken,
    displayFeeText,
    onReviewTransaction,
    showLedgerPopup,
    showKeystonePopup,
    onSimulateTx,
    setGasPriceFactor,
    setLedgerError,
    ledgerError,
    recommendedGasLimit,
    gasOption,
    setGasOption,
    userPreferredGasLimit,
    userPreferredGasPrice,
    setUserPreferredGasLimit,
    setUserPreferredGasPrice,
    feeDenom,
    setFeeDenom,
    customFee,
    amountOut,
    setError,
    txHash,
    setTxHash,
  };
}
