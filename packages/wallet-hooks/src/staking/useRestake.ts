import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, StdFee } from '@cosmjs/stargate';
import {
  axiosWrapper,
  ChainInfos,
  DefaultGasEstimates,
  EthermintTxHandler,
  fromSmall,
  GasPrice,
  INJECTIVE_DEFAULT_STD_FEE,
  InjectiveTx,
  SeiTxHandler,
  simulateGrantRestake,
  simulateRevokeRestake,
  SupportedChain,
  transactionDeclinedError,
  Tx,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import { useMemo } from 'react';

import { LeapWalletApi } from '../apis';
import { CosmosTxType } from '../connectors';
import { currencyDetail, useformatCurrency, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useGetChains,
  usePendingTxState,
} from '../store';
import { useTxHandler } from '../tx';
import { TxCallback, WALLETTYPE } from '../types';
import { fetchCurrency, formatTokenAmount, getMetaDataForRestakeTx, sliceAddress, useLowGasPriceStep } from '../utils';

export function useRestake() {
  // HOOKS
  const chainInfos = useGetChains();
  const activeChain = useActiveChain();
  const getTxHandler = useTxHandler({ forceChain: activeChain });
  const { activeWallet } = useActiveWalletStore();
  const address = useAddress();
  const [preferredCurrency] = useUserPreferredCurrency();
  const [formatCurrency] = useformatCurrency();
  const { setPendingTx } = usePendingTxState();
  const lowGasPriceStep = useLowGasPriceStep();
  const defaultGasEstimates = useDefaultGasEstimates();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const denom = Object.values(ChainInfos[activeChain].nativeDenoms)[0];

  // STATES
  const [memo, setMemo] = useState<string>('');
  const [fees, setFees] = useState<StdFee>();
  const [currencyFees, setCurrencyFees] = useState<string>();
  const [maxTokens, setMaxTokens] = useState<any>();
  const [expiryDate, setExpiryDate] = useState<string>();
  const [selectedValidator, setSelectedValidator] = useState<Validator>();
  const [error, setError] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);

  const { lcdUrl } = useChainApis(activeChain);
  const { data: validatorsData, status: validatorsStatus } = useQuery(['validators', activeChain], async () => {
    const res = await axios.get(
      `https://validators.cosmos.directory/chains/${ChainInfos[activeChain].chainRegistryPath}`,
    );
    return res?.data?.validators;
  });

  const {
    data: restakeData,
    status: restakeDataStatus,
    refetch: refetchRestakeData,
  } = useQuery(
    ['restake', selectedValidator?.operator_address, activeChain],
    async () => {
      const validator = validatorsData.find(
        (v: any) =>
          v?.operator_address === selectedValidator?.operator_address ||
          v?.address === selectedValidator?.operator_address,
      );
      return validator?.restake;
    },
    { enabled: !!selectedValidator && validatorsStatus === 'success' },
  );

  const canRestake = useMemo(() => !!restakeData, [restakeData]);

  const {
    data: grantData,
    status: grantDataStatus,
    refetch: refetchGrantData,
  } = useQuery(
    ['grants', restakeData?.address, activeChain, address],
    async () => {
      const res = await axiosWrapper({
        baseURL: lcdUrl,
        method: 'get',
        url: `/cosmos/authz/v1beta1/grants?grantee=${restakeData?.address}&granter=${address}`,
      });

      const data = res.data;
      return (
        data.grants.find(
          (grant: any) =>
            grant?.authorization['@type'] === '/cosmos.staking.v1beta1.StakeAuthorization' &&
            grant?.authorization?.allow_list?.address.includes(selectedValidator?.operator_address),
        ) ?? false
      );
    },
    { enabled: canRestake && restakeDataStatus === 'success' && !!restakeData && !!selectedValidator },
  );

  const hasGrant = useMemo(() => !!grantData, [grantData]);

  // FUNCTIONS
  const onTxSuccess = async (mode: 'grant' | 'revoke', promise: any, txHash: string, callback?: TxCallback) => {
    setPendingTx({
      img: chainInfos[activeChain].chainSymbolImageUrl,
      sentUsdValue: '',
      subtitle1: `${selectedValidator?.name ?? selectedValidator?.moniker ?? sliceAddress(selectedValidator?.address)}`,
      title1: mode === 'grant' ? 'Granted Auto-compounding' : 'Revoked Auto-compounding',
      txStatus: 'loading',
      txType: mode,
      promise,
      txHash,
    });
    showLedgerPopup && setShowLedgerPopup(false);
    callback && callback('success');
  };

  const simulateGrantTx = useCallback(async () => {
    return await simulateGrantRestake(lcdUrl ?? '', address, {
      botAddress: restakeData?.address ?? '',
      validatorAddress: selectedValidator?.operator_address ?? '',
      maxTokens: maxTokens,
      expiryDate: expiryDate ?? '',
    });
  }, [address, memo, selectedValidator, maxTokens, expiryDate, restakeData]);

  const simulateRevokeTx = useCallback(async () => {
    return await simulateRevokeRestake(lcdUrl ?? '', address, restakeData?.address ?? '');
  }, [address, memo, selectedValidator, restakeData]);

  const executeRevokeTx = useCallback(
    async (fee: StdFee, txHandler: Tx | InjectiveTx | EthermintTxHandler) => {
      return await (txHandler as Tx).revokeRestake(address, restakeData?.address ?? '', fee, memo);
    },
    [address, memo, selectedValidator?.operator_address, maxTokens, expiryDate, restakeData],
  );

  const executeGrantTx = useCallback(
    async (fee: StdFee, txHandler: Tx | InjectiveTx | EthermintTxHandler) => {
      return await txHandler.grantRestake(
        address,
        {
          botAddress: restakeData?.address ?? '',
          validatorAddress: selectedValidator?.operator_address ?? '',
          maxTokens: maxTokens,
          expiryDate: expiryDate ?? '',
        },
        fee,
        memo,
      );
    },
    [address, memo, selectedValidator?.operator_address, maxTokens, expiryDate, restakeData],
  );

  const getGasPrice = useCallback(() => {
    return { gasPrice: GasPrice.fromString(`${lowGasPriceStep}${denom.coinMinimalDenom}`) };
  }, [lowGasPriceStep, denom.coinMinimalDenom]);

  const executeRestakeTx = async ({
    mode,
    wallet,
    callback,
    isSimulation = true,
  }: {
    mode: 'grant' | 'revoke';
    wallet?: OfflineSigner;
    callback?: TxCallback;
    isSimulation: boolean;
  }) => {
    if (isLoading || !address || !activeChain) {
      return;
    }

    setError('');
    if (mode === 'grant' && (!selectedValidator || !expiryDate || !canRestake)) {
      setFees(undefined);
      setCurrencyFees('');
      return;
    }

    if (mode === 'revoke' && (!selectedValidator || !hasGrant)) {
      setFees(undefined);
      setCurrencyFees('');
      return;
    }

    setLoading(true);
    try {
      const tx = !isSimulation && wallet ? await getTxHandler(wallet) : undefined;

      const { gasPrice } = getGasPrice();

      const defaultGasStake =
        defaultGasEstimates[activeChain]?.DEFAULT_GAS_STAKE || DefaultGasEstimates.DEFAULT_GAS_STAKE;
      let gasEstimate = defaultGasStake;

      try {
        const { gasUsed, gasWanted } = mode === 'grant' ? await simulateGrantTx() : await simulateRevokeTx();
        if (activeChain === 'chihuahua') {
          gasEstimate = gasWanted;
        } else {
          gasEstimate = gasUsed;
        }
      } catch (e: any) {
        console.error(e?.message ?? e);
      }

      // FEES
      let fee = calculateFee(Math.round((gasEstimate ?? defaultGasStake) * 1.5), gasPrice);
      if (activeChain === 'injective') {
        fee = INJECTIVE_DEFAULT_STD_FEE;
      }
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

        /** do not support restake for sei atlantic 2 yet till restake support is added */
        if (tx instanceof SeiTxHandler) {
          return;
        }

        const txHash = mode === 'grant' ? await executeGrantTx(fee, tx) : await executeRevokeTx(fee, tx);
        const metadata =
          mode === 'grant'
            ? getMetaDataForRestakeTx(restakeData.address, ['/cosmos.staking.v1beta1.StakeAuthorization'])
            : getMetaDataForRestakeTx(restakeData.address, ['/cosmos.staking.v1beta1.MsgDelegate']);

        await txPostToDB({
          txHash,
          txType: mode === 'grant' ? CosmosTxType.AuthZGrant : CosmosTxType.AuthZRevoke,
          metadata,
          feeDenomination: fee.amount[0].denom,
          feeQuantity: fee.amount[0].amount,
        });
        const txResult = tx.pollForTx(txHash);

        if (txResult) onTxSuccess(mode, txResult, txHash, callback);
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

  const onReviewGrantTransaction = async (wallet: OfflineSigner, callback: TxCallback, isSimulation: boolean) => {
    executeRestakeTx({ mode: 'grant', wallet, callback, isSimulation });
  };

  const onReviewRevokeTransaction = async (wallet: OfflineSigner, callback: TxCallback, isSimulation: boolean) => {
    executeRestakeTx({ mode: 'revoke', wallet, callback, isSimulation });
  };

  const onSimulateGrantTx = async () => {
    executeRestakeTx({ mode: 'grant', isSimulation: true });
  };

  const onSimulateRevokeTx = async () => {
    executeRestakeTx({ mode: 'revoke', isSimulation: true });
  };

  useEffect(() => {
    if (selectedValidator && expiryDate) {
      executeRestakeTx({ mode: 'grant', isSimulation: true });
    }
    if (selectedValidator && hasGrant) {
      executeRestakeTx({ mode: 'revoke', isSimulation: true });
    }
  }, [selectedValidator, maxTokens, expiryDate]);

  const displayFeeText = !fees
    ? 'Enter expiry date to see the transaction fee'
    : `Transaction fee: ${formatTokenAmount(fromSmall(fees?.amount[0]?.amount, denom?.coinDecimals), '', 5)} ${
        denom?.coinDenom
      } (${formatCurrency(new BigNumber(currencyFees ?? '0'))})`;

  return {
    onReviewGrantTransaction,
    onReviewRevokeTransaction,
    refetchRestakeData,
    refetchGrantData,
    fees,
    setFees,
    displayFeeText,
    error,
    memo,
    setMemo,
    onSimulateGrantTx,
    onSimulateRevokeTx,
    isLoading,
    showLedgerPopup,
    hasGrant,
    canRestake,
    restakeData,
    restakeDataStatus,
    grantData,
    grantDataStatus,
    maxTokens,
    setMaxTokens,
    expiryDate,
    setExpiryDate,
    selectedValidator,
    setSelectedValidator,
  };
}
