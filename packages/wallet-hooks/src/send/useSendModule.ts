import { coin, StdFee } from '@cosmjs/amino';
import { calculateFee, GasPrice } from '@cosmjs/stargate';
import {
  ChainInfos,
  DefaultGasEstimates,
  Dict,
  fromSmall,
  getSimulationFee,
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
import { useGasAdjustmentForChain } from '../fees';
import { useGetIbcChannelId, useGetIBCSupport } from '../ibc';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useDenoms,
  useGasPriceSteps,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { Token, TxCallback } from '../types';
import {
  fetchCurrency,
  GasOptions,
  getErrorMsg,
  getOsmosisGasPriceSteps,
  getTxnLogAmountValue,
  useGasRateQuery,
  useNativeFeeDenom,
} from '../utils';
import { useIsCW20Tx } from './useIsCW20Tx';
import { useSendIbcChains } from './useSendIbcChains';
import { sendTokensParams, useSimpleSend } from './useSimpleSend';

export type SelectedAddress = {
  ethAddress?: string;
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
  displayAccounts: [string, string][];
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
  setFeeDenom: React.Dispatch<React.SetStateAction<NativeDenom & { ibcDenom?: string }>>;
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
  const allChainsGasPriceSteps = useGasPriceSteps();
  const isCW20Tx = useIsCW20Tx();
  const denoms = useDenoms();

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
  const gasAdjustment = useGasAdjustmentForChain(activeChain);

  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [feeDenom, setFeeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom);

  const gasPrices = useGasRateQuery(activeChain, selectedNetwork);
  const [gasPriceOptions, setGasPriceOptions] = useState(gasPrices?.[feeDenom.coinMinimalDenom]);
  const displayAccounts = useSendIbcChains();

  useEffect(() => {
    (async function () {
      if (feeDenom.coinMinimalDenom === 'uosmo' && activeChain === 'osmosis') {
        const { low, medium, high } = await getOsmosisGasPriceSteps(lcdUrl ?? '', allChainsGasPriceSteps);
        setGasPriceOptions({
          low: GasPrice.fromString(`${low}${feeDenom.coinMinimalDenom}`),
          medium: GasPrice.fromString(`${medium}${feeDenom.coinMinimalDenom}`),
          high: GasPrice.fromString(`${high}${feeDenom.coinMinimalDenom}`),
        });
      }
    })();
  }, [feeDenom.coinMinimalDenom, gasOption, gasEstimate, userPreferredGasLimit, userPreferredGasPrice, activeChain]);

  /**
   * Ibc Related tx
   */
  const { data: ibcChannelId } = useQuery(
    ['ibc-channel-id', 'send', selectedAddress?.address, activeChain, selectedNetwork],
    async () => {
      if (!selectedAddress?.address) return undefined;
      const ibcChannelIds = await getIbcChannelId(selectedAddress.address);
      return ibcChannelIds?.[0];
    },
  );

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
  }, [
    gasPriceOptions,
    gasOption,
    gasEstimate,
    userPreferredGasLimit,
    userPreferredGasPrice,
    activeChain,
    feeDenom.coinMinimalDenom,
  ]);

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
    ['fee-token-fiat-value', selectedToken, feeDenom],
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
        const txLogAmountDenom = {
          coinGeckoId: denoms[selectedToken?.coinMinimalDenom ?? '']?.coinGeckoId,
          chain: selectedToken?.chain as SupportedChain,
        };

        const txLogAmountValue = await getTxnLogAmountValue(inputAmount, txLogAmountDenom);

        if (result.data) txPostToDB({ ...result.data, amount: txLogAmountValue });
        setPendingTx({
          ...result.pendingTx,
          toAddress: args?.toAddress,
          txnLogAmount: txLogAmountValue,
        });

        callback('success');
      } else {
        if (result.errors.includes('txDeclined')) {
          callback('txDeclined');
        }
        setTxError(getErrorMsg(result.errors.join(',\n'), gasOption, 'send'));
      }
    },
    [activeChain, gasEstimate, sendTokens, setPendingTx, txPostToDB, ibcChannelId, customIbcChannelId, denoms],
  );

  const clearTxError = useCallback(() => {
    setTxError(undefined);
  }, []);

  useEffect(() => {
    const fn = async () => {
      const inputAmountNumber = new BigNumber(inputAmount);

      if (
        !selectedAddress?.address ||
        !selectedToken ||
        inputAmountNumber.isNaN() ||
        inputAmountNumber.lte(0) ||
        activeChain === 'mayachain'
      ) {
        return;
      }

      const normalizedAmount = inputAmountNumber
        .multipliedBy(10 ** (selectedToken?.coinDecimals ?? 6))
        .toFixed(0, BigNumber.ROUND_DOWN);

      let token = selectedToken.ibcDenom || selectedToken.coinMinimalDenom;

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
        const fee = getSimulationFee(feeDenom.ibcDenom ?? feeDenom.coinMinimalDenom);

        const { gasUsed } = isIBCTransfer
          ? await simulateIbcTransfer(
              lcdUrl ?? '',
              fromAddress,
              selectedAddress.address ?? '',
              amountOfCoins,
              channelId,
              'transfer',
              Math.floor(Date.now() / 1000) + 120,
              undefined,
              fee,
            )
          : await simulateSend(lcdUrl ?? '', fromAddress, selectedAddress.address ?? '', [amountOfCoins], fee);

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
    ibcChannelId,
    inputAmount,
    isIBCTransfer,
    lcdUrl,
    selectedAddress?.address,
    selectedToken?.ibcDenom,
    selectedToken?.coinMinimalDenom,
    feeDenom.ibcDenom,
    feeDenom.coinMinimalDenom,
  ]);

  return {
    displayAccounts,
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
