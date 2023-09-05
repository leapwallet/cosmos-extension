import { coin, StdFee } from '@cosmjs/amino';
import { calculateFee, GasPrice } from '@cosmjs/stargate';
import {
  ChainInfos,
  DefaultGasEstimates,
  Dict,
  fromSmall,
  isEthAddress,
  NativeDenom,
  simulateIbcTransfer,
  simulateSend,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import bech32 from 'bech32';
import { BigNumber } from 'bignumber.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis/LeapWalletApi';
import { useGasAdjustment } from '../fees';
import { useGetIbcChannelId, useGetIBCSupport } from '../ibc';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { Token, TxCallback } from '../types';
import { fetchCurrency, GasOptions, useGasRateQuery, useNativeFeeDenom } from '../utils';
import { useIsCW20Tx } from './useIsCW20Tx';
import { sendTokensParams, useSimpleSend } from './useSimpleSend';

export type SelectedAddress = {
  avatarIcon: string | undefined;
  chainIcon: string | undefined;
  chainName: string;
  name: string;
  address: string | undefined;
  emoji: number | undefined;
  selectionType: 'saved' | 'currentWallet' | 'notSaved' | 'nameService';
  information?: Dict;
};

export type SendModuleType = Readonly<{
  selectedAddress: SelectedAddress | null;
  setSelectedAddress: React.Dispatch<React.SetStateAction<SelectedAddress | null>>;
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  inputAmount: string;
  setInputAmount: React.Dispatch<React.SetStateAction<string>>;
  ibcSupportData: ReturnType<typeof useGetIBCSupport>['data'];
  isIbcSupportDataLoading: ReturnType<typeof useGetIBCSupport>['isLoading'];
  tokenFiatValue?: string;
  feeTokenFiatValue?: string;
  selectedToken: Token | null;
  setSelectedToken: React.Dispatch<React.SetStateAction<Token | null>>;
  feeDenom: NativeDenom;
  setFeeDenom: React.Dispatch<React.SetStateAction<NativeDenom>>;
  gasEstimate: number;
  fee: StdFee | undefined;
  gasOption: GasOptions;
  setGasOption: React.Dispatch<React.SetStateAction<GasOptions>>;
  allGasOptions: Record<GasOptions, string> | undefined;
  userPreferredGasPrice: GasPrice | undefined;
  setUserPreferredGasPrice: React.Dispatch<React.SetStateAction<GasPrice | undefined>>;
  userPreferredGasLimit: number | undefined;
  setUserPreferredGasLimit: React.Dispatch<React.SetStateAction<number | undefined>>;
  addressError: string | undefined;
  amountError: string | undefined;
  txError: string | undefined;
  setAddressError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAmountError: React.Dispatch<React.SetStateAction<string | undefined>>;
  isIBCTransfer: boolean;
  sendDisabled: boolean;
  isSending: boolean;
  showLedgerPopup: boolean;
  customIbcChannelId: string | undefined;
  setCustomIbcChannelId: React.Dispatch<React.SetStateAction<string | undefined>>;
  confirmSend: (
    args: Omit<sendTokensParams, 'gasEstimate'>,
    callback: (status: 'success' | 'txDeclined') => void,
  ) => Promise<void>;
  clearTxError: () => void;
}>;

export function useSendModule(): SendModuleType {
  /**
   * Universal Hooks
   */
  const activeChain = useActiveChain();
  const selectedNetwork = useSelectedNetwork();
  const defaultGasEstimates = useDefaultGasEstimates();
  const [preferredCurrency] = useUserPreferredCurrency();
  const fromAddress = useAddress();
  const { lcdUrl } = useChainApis();
  const isCW20Tx = useIsCW20Tx();

  /**
   * Local State Variables
   */
  const [inputAmount, setInputAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [gasEstimate, setGasEstimate] = useState<number>(
    defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
  );

  const [addressError, setAddressError] = useState<string | undefined>(undefined);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [txError, setTxError] = useState<string | undefined>(undefined);

  const [customIbcChannelId, setCustomIbcChannelId] = useState<string | undefined>(undefined);

  /**
   * Send Tx related hooks
   */
  const { setPendingTx } = usePendingTxState();
  const getIbcChannelId = useGetIbcChannelId();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const { isSending, sendTokens, showLedgerPopup } = useSimpleSend();
  const { data: ibcSupportData, isLoading: isIbcSupportDataLoading } = useGetIBCSupport(activeChain);
  const nativeFeeDenom = useNativeFeeDenom();
  const gasAdjustment = useGasAdjustment(activeChain);

  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom);

  const gasPrices = useGasRateQuery(activeChain, selectedNetwork);
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom];

  /**
   * Ibc Related tx
   */
  const { data: ibcChannelId } = useQuery(['ibc-channel-id', 'send', selectedAddress?.address], async () => {
    if (!selectedAddress?.address) return undefined;
    const ibcChannelIds = await getIbcChannelId(selectedAddress.address);
    return ibcChannelIds?.[0];
  });

  const isIBCTransfer = useMemo(() => {
    if (selectedAddress && selectedAddress.address) {
      try {
        const { prefix: fromAddressPrefix } = bech32.decode(fromAddress);
        const { prefix: toAddressPrefix } = bech32.decode(selectedAddress.address);
        return fromAddressPrefix !== toAddressPrefix;
      } catch {
        return false;
      }
    }
    return false;
  }, [selectedAddress, fromAddress]);

  /**
   * Fee Calculation:
   * all gas options are used to display fees in big denom to the user.
   * These values should not be used for calculations
   */
  const allGasOptions = useMemo(() => {
    if (!gasPriceOptions) return;

    const getFeeValue = (gasPriceOption: GasPrice) => {
      const gasAdjustmentValue = gasAdjustment * (selectedToken && isCW20Tx(selectedToken) ? 2 : 1);
      const stdFee = calculateFee(Math.ceil(gasEstimate * gasAdjustmentValue), gasPriceOption);
      return fromSmall(stdFee.amount[0].amount, feeDenom?.coinDecimals);
    };

    return {
      low: getFeeValue(gasPriceOptions.low),
      medium: getFeeValue(gasPriceOptions.medium),
      high: getFeeValue(gasPriceOptions.high),
    };
  }, [activeChain, gasEstimate, gasPriceOptions, feeDenom?.coinDecimals]);

  // This is the fee used in the transaction.
  const fee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? gasEstimate;
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;

    const gasAdjustmentValue = gasAdjustment * (selectedToken && isCW20Tx(selectedToken) ? 2 : 1);
    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice);

    // keep feeDenom in the dependency array to update the fee when the denom changes
  }, [gasPriceOptions, gasOption, gasEstimate, userPreferredGasLimit, userPreferredGasPrice, activeChain]);

  /**
   * Currency Calculation Selected Token
   */
  const { data: tokenFiatValue } = useQuery(
    ['input-token-fiat-value', selectedToken],
    async () => {
      return Promise.resolve(parseFloat(selectedToken?.usdPrice ?? '0') > 0 ? selectedToken?.usdPrice : undefined);
    },
    { enabled: !!selectedToken },
  );

  /**
   * Currency Calculation Fee Token
   */
  const { data: feeTokenFiatValue } = useQuery(
    ['fee-token-fiat-value', selectedToken],
    async () => {
      return fetchCurrency(
        '1',
        feeDenom.coinGeckoId,
        feeDenom.chain as unknown as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      );
    },
    { enabled: !!selectedToken },
  );

  const sendDisabled =
    !!addressError ||
    !!amountError ||
    !selectedAddress ||
    !selectedToken ||
    new BigNumber(inputAmount.trim() || 0).lte(0);

  const confirmSend = useCallback(
    async (args: Omit<sendTokensParams, 'gasEstimate'>, callback: TxCallback) => {
      const result = await sendTokens({
        ...args,
        ibcChannelId: args.ibcChannelId ?? customIbcChannelId ?? ibcChannelId ?? '',
      });
      if (result.success === true) {
        if (result.data) txPostToDB(result.data);
        setPendingTx({ ...result.pendingTx, toAddress: args?.toAddress });
        callback('success');
      } else {
        if (result.errors.includes('txDeclined')) {
          callback('txDeclined');
        }
        setTxError(result.errors.join(',\n'));
      }
    },
    [activeChain, gasEstimate, sendTokens, setPendingTx, txPostToDB, ibcChannelId, customIbcChannelId],
  );

  const clearTxError = useCallback(() => {
    setTxError(undefined);
  }, []);

  useEffect(() => {
    const fn = async () => {
      const inputAmountNumber = new BigNumber(inputAmount);

      if (!selectedAddress || !selectedToken || inputAmountNumber.isNaN() || inputAmountNumber.lte(0)) {
        return;
      }

      const normalizedAmount = inputAmountNumber
        .multipliedBy(10 ** (selectedToken?.coinDecimals ?? 6))
        .toFixed(0, BigNumber.ROUND_DOWN);

      let token = isIBCTransfer
        ? selectedToken.ibcDenom || selectedToken.coinMinimalDenom
        : selectedToken.coinMinimalDenom;

      token = isEthAddress(token) ? `erc20/${token}` : token;
      const amountOfCoins = coin(normalizedAmount, token);

      setGasEstimate(
        isIBCTransfer
          ? defaultGasEstimates[activeChain]?.DEFAULT_GAS_IBC ?? DefaultGasEstimates.DEFAULT_GAS_IBC
          : (defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER) *
              (selectedToken && isCW20Tx(selectedToken) ? 2 : 1),
      );

      const channelId = customIbcChannelId ?? ibcChannelId ?? '';

      try {
        const { gasUsed } = isIBCTransfer
          ? await simulateIbcTransfer(
              lcdUrl ?? '',
              fromAddress,
              selectedAddress.address ?? '',
              amountOfCoins,
              channelId,
              'transfer',
              Math.floor(Date.now() / 1000) + 60,
              undefined,
            )
          : await simulateSend(lcdUrl ?? '', fromAddress, selectedAddress.address ?? '', [amountOfCoins]);

        setGasEstimate(gasUsed);
      } catch (err) {
        //
      }
    };

    fn();
  }, [
    activeChain,
    ChainInfos.chihuahua.key,
    fromAddress,
    getIbcChannelId,
    ibcChannelId,
    inputAmount,
    isIBCTransfer,
    lcdUrl,
    selectedAddress,
    selectedToken,
  ]);

  return {
    selectedAddress,
    setSelectedAddress,
    memo,
    setMemo,
    inputAmount,
    setInputAmount,
    ibcSupportData,
    isIbcSupportDataLoading,
    tokenFiatValue,
    feeTokenFiatValue,
    selectedToken,
    setSelectedToken,
    feeDenom,
    setFeeDenom,
    gasOption,
    setGasOption,
    gasEstimate,
    fee,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    userPreferredGasPrice,
    setUserPreferredGasPrice,
    allGasOptions,
    addressError,
    amountError,
    setAddressError,
    setAmountError,
    isIBCTransfer,
    sendDisabled,
    isSending,
    confirmSend,
    showLedgerPopup,
    txError,
    clearTxError,
    customIbcChannelId,
    setCustomIbcChannelId,
  } as const;
}
