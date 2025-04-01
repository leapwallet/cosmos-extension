import { Ed25519PublicKey } from '@aptos-labs/ts-sdk';
import { coin, StdFee } from '@cosmjs/amino';
import { calculateFee, GasPrice } from '@cosmjs/stargate';
import {
  AccountDetails,
  AptosTx,
  ChainInfos,
  DefaultGasEstimates,
  DenomsRecord,
  Dict,
  estimateVSize,
  fetchUtxos,
  fromSmall,
  getOsmosisGasPriceSteps,
  getSimulationFee,
  isAptosChain,
  isEthAddress,
  NativeDenom,
  pubKeyToEvmAddressToShow,
  SeiEvmTx,
  simulateIbcTransfer,
  simulateSend,
  SupportedChain,
  toSmall,
} from '@leapwallet/cosmos-wallet-sdk';
import { Token } from '@leapwallet/cosmos-wallet-store';
import { EthWallet } from '@leapwallet/leap-keychain';
import { base64 } from '@scure/base';
import { FetchStatus, QueryStatus, useQuery } from '@tanstack/react-query';
import { bech32 } from 'bech32';
import { BigNumber } from 'bignumber.js';
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis/LeapWalletApi';
import { useGasAdjustmentForChain } from '../fees';
import { useGetIbcChannelId, useGetIBCSupport } from '../ibc';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  getCompassSeiEvmConfigStoreSnapshot,
  useActiveChain,
  useActiveWallet,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useGasPriceSteps,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { TxCallback, WALLETTYPE } from '../types';
import {
  fetchCurrency,
  GasOptions,
  getChainId,
  getErrorMsg,
  getTxnLogAmountValue,
  isERC20Token,
  useGasRateQuery,
  useNativeFeeDenom,
} from '../utils';
import {
  useChainId,
  useChainInfo,
  useFetchAccountDetails,
  useGetFeeMarketGasPricesSteps,
  useHasToCalculateDynamicFee,
  useIsSeiEvmChain,
} from '../utils-hooks';
import { useSendIbcChains } from './useSendIbcChains';
import { SendTokenEthParamOptions, sendTokensParams, useSimpleSend } from './useSimpleSend';

export type AddressWarning = {
  type: 'link' | 'erc20' | '';
  message: ReactNode;
};

export const INITIAL_ADDRESS_WARNING: AddressWarning = {
  type: '',
  message: '',
};

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
  addressWarning: AddressWarning;
  amountError: string | undefined;
  gasError: string | null;
  txError: string | undefined;
  setAddressError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAddressWarning: React.Dispatch<React.SetStateAction<AddressWarning>>;
  setGasError: React.Dispatch<React.SetStateAction<string | null>>;
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
  confirmSendEth: (
    toAddress: string,
    value: string,
    gas: number,
    wallet: EthWallet,
    txCallback: TxCallback,
    gasPrice?: number,
    options?: SendTokenEthParamOptions,
  ) => void;
  clearTxError: () => void;
  fetchAccountDetailsLoading: boolean;
  fetchAccountDetailsStatus: QueryStatus | FetchStatus;
  fetchAccountDetailsError: string;
  fetchAccountDetailsData: AccountDetails | undefined;
  fetchAccountDetails: (address: string) => Promise<void>;
  setFetchAccountDetailsData: React.Dispatch<React.SetStateAction<AccountDetails | undefined>>;
  setSelectedChain: React.Dispatch<React.SetStateAction<SupportedChain | null>>;
  selectedChain: SupportedChain | null;
  sendActiveChain: SupportedChain;
  sendSelectedNetwork: 'mainnet' | 'testnet';
  isSeiEvmTransaction: boolean;
  associatedSeiAddress: string;
  setAssociatedSeiAddress: React.Dispatch<React.SetStateAction<string>>;
  associated0xAddress: string;
  setAssociated0xAddress: React.Dispatch<React.SetStateAction<string>>;
  isCexIbcTransferWarningNeeded: boolean;
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
  hasToUsePointerLogic: boolean;
  setHasToUsePointerLogic: React.Dispatch<React.SetStateAction<boolean>>;
  pointerAddress: string;
  setPointerAddress: React.Dispatch<React.SetStateAction<string>>;
  hasToUseCw20PointerLogic: boolean;
  setHasToUseCw20PointerLogic: React.Dispatch<React.SetStateAction<boolean>>;
}>;

export function useSendModule({
  denoms,
  cw20Denoms,
  erc20Denoms,
}: {
  denoms: DenomsRecord;
  cw20Denoms: DenomsRecord;
  erc20Denoms: DenomsRecord;
}): SendModuleType {
  /**
   * Universal Hooks
   */

  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();
  const activeWallet = useActiveWallet();

  const defaultGasEstimates = useDefaultGasEstimates();
  const [preferredCurrency] = useUserPreferredCurrency();
  const allChainsGasPriceSteps = useGasPriceSteps();

  const isCW20Token = useCallback(
    (token: Token) => {
      if (!token) {
        return false;
      }
      return Object.keys(cw20Denoms).some(
        (cw20Denom) => cw20Denom.toLowerCase() === token.coinMinimalDenom.toLowerCase(),
      );
    },
    [cw20Denoms],
  );

  //const denoms = useDenoms();

  /**
   * Local State Variables
   */
  const [inputAmount, setInputAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null);

  const activeChain = useMemo(() => {
    if (selectedChain) {
      return selectedChain;
    }

    if ((_activeChain as SupportedChain & 'aggregated') === 'aggregated') {
      return 'cosmos';
    }

    return _activeChain;
  }, [_activeChain, selectedChain]);

  const selectedNetwork = useMemo(() => {
    if ((_activeChain as SupportedChain & 'aggregated') === 'aggregated') {
      return 'mainnet';
    }

    return _selectedNetwork;
  }, [_selectedNetwork, _activeChain]);

  const isAptosTx = isAptosChain(activeChain);
  const isSeiEvmChain = useIsSeiEvmChain(activeChain);
  const { lcdUrl, evmJsonRpc, rpcUrl } = useChainApis(activeChain, selectedNetwork);
  const fromAddress = useAddress(activeChain);
  const activeChainInfo = useChainInfo(activeChain);
  const activeChainId = useChainId(activeChain, selectedNetwork);

  const {
    isLoading: fetchAccountDetailsLoading,
    status: fetchAccountDetailsStatus,
    error: fetchAccountDetailsError,
    data: fetchAccountDetailsData,
    fetchDetails: fetchAccountDetails,
    setData: setFetchAccountDetailsData,
  } = useFetchAccountDetails(activeChain, selectedNetwork);

  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [gasEstimate, setGasEstimate] = useState<number>(
    defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
  );
  const [gasError, setGasError] = useState<string | null>(null);

  const [addressError, setAddressError] = useState<string | undefined>(undefined);
  const [addressWarning, setAddressWarning] = useState<AddressWarning>(INITIAL_ADDRESS_WARNING);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const [txError, setTxError] = useState<string | undefined>(undefined);

  const chains = useGetChains();
  const [customIbcChannelId, setCustomIbcChannelId] = useState<string | undefined>(undefined);
  const [associatedSeiAddress, setAssociatedSeiAddress] = useState<string>('');
  const [associated0xAddress, setAssociated0xAddress] = useState<string>('');

  /**
   * Send Tx related hooks
   */
  const { setPendingTx } = usePendingTxState();
  const getIbcChannelId = useGetIbcChannelId(activeChain);
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const { isSending, sendTokens, showLedgerPopup, sendTokenEth, setIsSending } = useSimpleSend(
    denoms,
    isCW20Token,
    activeChain,
    selectedNetwork,
  );
  const { data: ibcSupportData, isLoading: isIbcSupportDataLoading } = useGetIBCSupport(activeChain);
  const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork);
  const gasAdjustment = useGasAdjustmentForChain(activeChain);

  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [feeDenom, setFeeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom);

  const [hasToUseCw20PointerLogic, setHasToUseCw20PointerLogic] = useState(false);
  const [hasToUsePointerLogic, setHasToUsePointerLogic] = useState(false);
  const [pointerAddress, setPointerAddress] = useState('');

  const isSeiEvmTransaction = useMemo(() => {
    if (activeChainInfo?.evmOnlyChain) {
      return true;
    }

    if (!isSeiEvmChain) {
      return false;
    }

    if (hasToUsePointerLogic) {
      return true;
    }

    if (associated0xAddress && isEthAddress(associated0xAddress)) {
      return true;
    }

    if (associatedSeiAddress) {
      return false;
    }

    let toAddress = selectedAddress?.address ?? '';
    const _isERC20Token = isERC20Token(Object.keys(erc20Denoms), selectedToken?.coinMinimalDenom ?? '');
    const isNativeEvmToken = selectedToken?.isEvm;

    if (isNativeEvmToken || _isERC20Token) {
      if (
        toAddress.toLowerCase().startsWith(ChainInfos[activeChain].addressPrefix) &&
        fetchAccountDetailsData?.pubKey.key
      ) {
        toAddress = pubKeyToEvmAddressToShow(fetchAccountDetailsData.pubKey.key);
      }
    }

    if (isEthAddress(toAddress)) {
      return true;
    }

    return false;
  }, [
    isSeiEvmChain,
    selectedAddress,
    selectedToken,
    fetchAccountDetailsData?.pubKey.key,
    associatedSeiAddress,
    erc20Denoms,
    associated0xAddress,
    hasToUsePointerLogic,
  ]);

  const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork);
  const getFeeMarketGasPricesSteps = useGetFeeMarketGasPricesSteps(activeChain, selectedNetwork);
  const gasPrices = useGasRateQuery(denoms, activeChain, selectedNetwork, isSeiEvmTransaction);
  const [gasPriceOptions, setGasPriceOptions] = useState(gasPrices?.[feeDenom.coinMinimalDenom]);
  const displayAccounts = useSendIbcChains(activeChain);

  useEffect(() => {
    (async function () {
      if (feeDenom.coinMinimalDenom === 'uosmo' && activeChain === 'osmosis') {
        const { low, medium, high } = await getOsmosisGasPriceSteps(lcdUrl ?? '', allChainsGasPriceSteps);
        setGasPriceOptions({
          low: GasPrice.fromString(`${low}${feeDenom.coinMinimalDenom}`),
          medium: GasPrice.fromString(`${medium}${feeDenom.coinMinimalDenom}`),
          high: GasPrice.fromString(`${high}${feeDenom.coinMinimalDenom}`),
        });
      } else if (hasToCalculateDynamicFee && feeDenom.coinMinimalDenom === nativeFeeDenom?.coinMinimalDenom) {
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
    gasEstimate,
    userPreferredGasLimit,
    userPreferredGasPrice,
    activeChain,
    selectedNetwork,
    hasToCalculateDynamicFee,
    nativeFeeDenom?.coinMinimalDenom,
  ]);

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
      const gasAdjustmentValue = gasAdjustment * (selectedToken && isCW20Token(selectedToken) ? 2 : 1);
      const stdFee = calculateFee(Math.ceil(gasEstimate * gasAdjustmentValue), gasPriceOption);
      return fromSmall(stdFee.amount[0].amount, feeDenom?.coinDecimals);
    };
    return {
      low: getFeeValue(gasPriceOptions.low as GasPrice),
      medium: getFeeValue(gasPriceOptions.medium as GasPrice),
      high: getFeeValue(gasPriceOptions.high as GasPrice),
    };
  }, [activeChain, gasEstimate, gasPriceOptions, feeDenom?.coinDecimals]);

  // This is the fee used in the transaction.
  const fee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? gasEstimate;
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption];
    if (!_gasPrice) return;
    const isBtcTx = activeChain === 'bitcoin' || activeChain === 'bitcoinSignet';
    const gasAdjustmentValue = isBtcTx ? 1 : gasAdjustment * (selectedToken && isCW20Token(selectedToken) ? 2 : 1);
    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice as GasPrice);
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
        `${activeChainId}-${feeDenom.coinMinimalDenom}`,
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

  const isCexIbcTransferWarningNeeded = useMemo(() => {
    try {
      if (!selectedAddress || !selectedAddress.address || !inputAmount || !selectedToken?.ibcChainInfo) return false;

      const tokenSourceChainId = selectedToken?.ibcChainInfo?.name;

      if (!tokenSourceChainId) return false;
      const tokenSourceChain = Object.values(chains).find(
        (chain) => chain.chainId === tokenSourceChainId || chain.testnetChainId === tokenSourceChainId,
      );

      if (!tokenSourceChain) return false;

      const { prefix: toAddressPrefix } = bech32.decode(selectedAddress.address);
      return toAddressPrefix === tokenSourceChain.addressPrefix;
    } catch {
      return false;
    }
  }, [selectedToken, selectedAddress, inputAmount, chains]);

  const confirmSend = useCallback(
    async (args: Omit<sendTokensParams, 'gasEstimate'>, callback: TxCallback) => {
      const result = await sendTokens({
        ...args,
        ibcChannelId: args.ibcChannelId ?? customIbcChannelId ?? ibcChannelId ?? '',
      });

      if (result.success === true) {
        const denomChainInfo = chains[denoms[selectedToken?.coinMinimalDenom ?? '']?.chain as SupportedChain];
        const txLogAmountDenom = {
          coinGeckoId: denoms[selectedToken?.coinMinimalDenom ?? '']?.coinGeckoId,
          chain: selectedToken?.chain as SupportedChain,
          chainId: getChainId(denomChainInfo, selectedNetwork),
          coinMinimalDenom: selectedToken?.coinMinimalDenom,
        };

        const txLogAmountValue = await getTxnLogAmountValue(inputAmount, txLogAmountDenom);

        if (result.data) {
          const txLog = {
            ...result.data,
            amount: txLogAmountValue,
            forceChain: activeChain,
            forceNetwork: selectedNetwork,
            forceWalletAddress: fromAddress,
            chainId: activeChainId,
            isAptos: isAptosTx,
          };
          txPostToDB(txLog);
        }

        setPendingTx({
          ...result.pendingTx,
          toAddress: args?.toAddress,
          txnLogAmount: txLogAmountValue,
          sourceChain: activeChain,
          sourceNetwork: selectedNetwork,
        });
        callback('success');
      } else {
        if (result.errors.includes('txDeclined')) {
          callback('txDeclined');
        }
        setTxError(getErrorMsg(result.errors.join(',\n'), gasOption, 'send'));
      }
    },
    [
      activeChain,
      gasEstimate,
      sendTokens,
      setPendingTx,
      txPostToDB,
      ibcChannelId,
      customIbcChannelId,
      denoms,
      inputAmount,
      selectedToken?.chain,
      selectedToken?.coinMinimalDenom,
      selectedNetwork,
      chains,
      activeChainId,
    ],
  );

  const confirmSendEth = useCallback(
    async (
      toAddress: string,
      value: string,
      gas: number,
      wallet: EthWallet,
      callback: TxCallback,
      gasPrice?: number,
      options?: SendTokenEthParamOptions,
    ) => {
      const result = await sendTokenEth(fromAddress, toAddress, value, gas, wallet, gasPrice, options);
      if (result.success) {
        if (result.data) {
          const denomChainInfo = chains[denoms[selectedToken?.coinMinimalDenom ?? '']?.chain as SupportedChain];
          const txLogAmountDenom = {
            coinGeckoId: denoms[selectedToken?.coinMinimalDenom ?? '']?.coinGeckoId,
            chain: selectedToken?.chain as SupportedChain,
            chainId: getChainId(denomChainInfo, selectedNetwork),
            coinMinimalDenom: selectedToken?.coinMinimalDenom,
          };

          const txLogAmountValue = await getTxnLogAmountValue(inputAmount, txLogAmountDenom);
          const evmTxHash = result.data.txHash;

          try {
            if (chains[activeChain]?.evmOnlyChain) {
              txPostToDB({
                ...result.data,
                amount: txLogAmountValue,
                txHash: evmTxHash,
                chainId: activeChainId,
                isEvmOnly: true,
                forceWalletAddress: pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]),
              });
            } else {
              // SeiEvmTx.GetCosmosTxHash call fails
              // const cosmosTxHash = await SeiEvmTx.GetCosmosTxHash(evmTxHash, evmJsonRpc ?? '');
              txPostToDB({ ...result.data, amount: txLogAmountValue, txHash: evmTxHash, chainId: activeChainId });
            }
          } catch {
            // GetCosmosTxHash is currently failing
          }
        }

        result.pendingTx &&
          setPendingTx({
            ...result.pendingTx,
            toAddress,
            sourceChain: activeChain,
            sourceNetwork: selectedNetwork,
          });
        callback('success');
      } else {
        result.errors && setTxError(result.errors.join(',\n'));
      }
    },
    [
      activeChain,
      denoms,
      inputAmount,
      fromAddress,
      txPostToDB,
      selectedToken?.chain,
      selectedToken?.coinMinimalDenom,
      selectedNetwork,
      chains,
      activeChainId,
    ],
  );

  const clearTxError = useCallback(() => {
    setTxError(undefined);
  }, []);

  useEffect(() => {
    const fn = async () => {
      if ((activeChain === 'bitcoin' || activeChain === 'bitcoinSignet') && rpcUrl) {
        const utxos = await fetchUtxos(fromAddress, rpcUrl);
        const estimatedVSize = estimateVSize(utxos.length, 2, 'p2wpkh');
        setGasEstimate(estimatedVSize);
        return;
      }

      const defaultIbcGasEstimate =
        defaultGasEstimates[activeChain]?.DEFAULT_GAS_IBC ?? DefaultGasEstimates.DEFAULT_GAS_IBC;

      const defaultNonIbcGasEstimate =
        (defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER) *
        (selectedToken && isCW20Token(selectedToken) ? 2 : 1);

      const inputAmountNumber = new BigNumber(inputAmount);
      setGasEstimate(isIBCTransfer ? defaultIbcGasEstimate : defaultNonIbcGasEstimate);

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

      try {
        if (isSeiEvmTransaction) {
          const erc20Token =
            hasToUsePointerLogic || isERC20Token(Object.keys(erc20Denoms), selectedToken?.coinMinimalDenom);
          const erc20Address = hasToUsePointerLogic ? pointerAddress : selectedToken.coinMinimalDenom;

          try {
            const fromEthAddress = pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]);

            const toAddress = isEthAddress(selectedAddress.address)
              ? selectedAddress.address
              : fetchAccountDetailsData?.pubKey?.key
              ? pubKeyToEvmAddressToShow(fetchAccountDetailsData.pubKey.key)
              : associated0xAddress;

            const gasUsed = await SeiEvmTx.SimulateTransaction(
              toAddress,
              inputAmountNumber.toString(),
              evmJsonRpc,
              undefined,
              undefined,
              fromEthAddress,
              erc20Token ? erc20Address : undefined,
              erc20Token ? selectedToken.coinDecimals : undefined,
            );

            setGasEstimate(gasUsed);
          } catch (_) {
            const { ARCTIC_EVM_GAS_LIMIT } = await getCompassSeiEvmConfigStoreSnapshot();
            setGasEstimate(ARCTIC_EVM_GAS_LIMIT);
          }

          return;
        }

        if (isAptosTx) {
          const aptos = await AptosTx.getAptosClient(lcdUrl ?? '');
          const publicKey = new Ed25519PublicKey(base64.decode(activeWallet?.pubKeys?.[activeChain] ?? ''));
          const normalizedAmount = toSmall(inputAmount.toString(), selectedToken?.coinDecimals ?? 6);

          if (selectedToken?.aptosTokenType === 'v1') {
            const fee = await aptos.simulateSendTokens(
              fromAddress,
              selectedAddress.address,
              [{ amount: normalizedAmount, denom: selectedToken.coinMinimalDenom }],
              memo,
              publicKey,
            );
            setGasEstimate(Number(fee.gasEstimate));
          } else {
            const simpleTx = await aptos.generateFungibleAssetTx(
              fromAddress,
              selectedToken.coinMinimalDenom,
              selectedAddress.address,
              parseInt(normalizedAmount),
            );
            const fee = await aptos.simulateTransaction(simpleTx, publicKey);
            setGasEstimate(Number(fee.gasEstimate));
          }
          return;
        }

        const channelId = customIbcChannelId ?? ibcChannelId ?? '';
        let token = selectedToken.ibcDenom || selectedToken.coinMinimalDenom;

        token = isEthAddress(token) ? `erc20/${token}` : token;
        const amountOfCoins = coin(normalizedAmount, token);

        const fee = getSimulationFee(feeDenom.ibcDenom ?? feeDenom.coinMinimalDenom);
        const toAddress = associatedSeiAddress || selectedAddress.address || '';

        let { gasUsed } = isIBCTransfer
          ? await simulateIbcTransfer(
              lcdUrl ?? '',
              fromAddress,
              toAddress,
              amountOfCoins,
              channelId,
              'transfer',
              Math.floor(Date.now() / 1000) + 120,
              undefined,
              fee,
            )
          : await simulateSend(lcdUrl ?? '', fromAddress, toAddress, [amountOfCoins], fee);

        // Fees is high for evmos non-ibc send txn using ledger
        if (!isIBCTransfer && activeChain === 'evmos' && activeWallet?.walletType === WALLETTYPE.LEDGER) {
          gasUsed = 2200000;
        }
        setGasEstimate(gasUsed);
      } catch (err) {
        //
      }
    };

    fn();
  }, [
    activeChain,
    chains?.chihuahua?.key,
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
    isSeiEvmChain,
    activeWallet?.pubKeys,
    associatedSeiAddress,
    associated0xAddress,
    chains,
    erc20Denoms,
    isSeiEvmTransaction,
    hasToUsePointerLogic,
    isAptosTx,
    pointerAddress,
    fetchAccountDetailsData?.pubKey?.key,
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
    addressWarning,
    setAddressWarning,
    gasError,
    setGasError,
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
    confirmSendEth,
    fetchAccountDetails,
    fetchAccountDetailsLoading,
    fetchAccountDetailsStatus,
    fetchAccountDetailsError,
    fetchAccountDetailsData,
    setFetchAccountDetailsData,
    setSelectedChain,
    selectedChain,
    sendActiveChain: activeChain,
    sendSelectedNetwork: selectedNetwork,
    isSeiEvmTransaction,
    associatedSeiAddress,
    setAssociatedSeiAddress,
    associated0xAddress,
    setAssociated0xAddress,
    isCexIbcTransferWarningNeeded,
    setIsSending,
    hasToUsePointerLogic,
    setHasToUsePointerLogic,
    pointerAddress,
    setPointerAddress,
    hasToUseCw20PointerLogic,
    setHasToUseCw20PointerLogic,
  } as const;
}
