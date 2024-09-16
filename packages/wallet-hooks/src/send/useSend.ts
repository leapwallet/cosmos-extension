import { coins } from '@cosmjs/amino';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, StdFee } from '@cosmjs/stargate';
import {
  DenomsRecord,
  fromSmall,
  getBlockChainFromAddress,
  getSimulationFee,
  isValidAddressWithPrefix,
  NativeDenom,
  SigningSscrt,
  simulateIbcTransfer,
  simulateSend,
  Sscrt,
  SupportedChain,
  SupportedDenoms,
  toSmall,
} from '@leapwallet/cosmos-wallet-sdk';
import { transactionDeclinedError } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import currency from 'currency.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Wallet } from 'secretjs';
import { Token } from 'types/bank';

import { LeapWalletApi } from '../apis';
import { useGetTokenSpendableBalances, useSnipGetSnip20TokenBalances } from '../bank';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import { useGetIbcChannelId } from '../ibc';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useDenoms,
  useGetChains,
  useSelectedNetwork,
  useTxMetadata,
} from '../store';
import { usePendingTxState } from '../store';
import { useScrtTxHandler, useTxHandler } from '../tx';
import { TxCallback, WALLETTYPE } from '../types';
import { fetchCurrency, getMetaDataForIbcTx, getMetaDataForSendTx, useGetGasPrice, useNativeFeeDenom } from '../utils';
import { sliceAddress } from '../utils';
import { useChainId, useChainInfo } from '../utils-hooks';

export function useSend(denoms: DenomsRecord, toAddress: string) {
  const chainsInfos = useGetChains();

  let feeDenom = useNativeFeeDenom(denoms);

  const [inputAmount, setInputAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [selectedDenom, setSelectedDenom] = useState<Token>();

  const [error, setError] = useState<string>('');
  const [signingError, setSigningError] = useState('');
  const [fees, setFees] = useState<StdFee>();

  const [isLoading, setLoading] = useState<boolean>(false);
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);

  const { allAssets, nativeTokensStatus, s3IbcTokensStatus } = useGetTokenSpendableBalances();
  const { snip20Tokens, snip20TokensStatus } = useSnipGetSnip20TokenBalances();
  const selectedNetwork = useSelectedNetwork();
  const activeChain = useActiveChain();

  const { activeWallet } = useActiveWalletStore();
  const address = useAddress();
  const getIbcChannelId = useGetIbcChannelId();
  const getTxHandler = useTxHandler();
  const txMetadata = useTxMetadata();
  const getScrtTxHandler = useScrtTxHandler();
  const { setPendingTx } = usePendingTxState();
  const defaultGasEstimates = useDefaultGasEstimates();
  const [preferredCurrency] = useUserPreferredCurrency();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const { lcdUrl } = useChainApis();
  const chainInfo = useChainInfo();
  const getGasPrice = useGetGasPrice(activeChain);
  const gasAdjustment = useGasAdjustmentForChain();
  const activeChainId = useChainId(activeChain, selectedNetwork);

  const assets = useMemo(() => {
    if (snip20Tokens && isValidAddressWithPrefix(toAddress, 'secret')) {
      return allAssets.concat(snip20Tokens);
    }
    return allAssets;
  }, [allAssets, snip20Tokens]);

  const simulationRequestId = useRef(1);

  const { data: denomFiatValue } = useQuery(
    ['input-fiat-value', selectedDenom, currency],
    async () => {
      return parseFloat(selectedDenom?.usdPrice ?? '0') > 0 ? selectedDenom?.usdPrice : undefined;
    },
    { enabled: !!selectedDenom },
  );

  const { data: feeDenomFiatValue } = useQuery(['fee-fiat-value'], async () => {
    return await fetchCurrency(
      fromSmall('1', feeDenom.coinDecimals),
      feeDenom.coinGeckoId,
      feeDenom.chain as unknown as SupportedChain,
      currencyDetail[preferredCurrency].currencyPointer,
      `${activeChainId}-${feeDenom.coinMinimalDenom}`,
    );
  });

  useEffect(() => {
    if (s3IbcTokensStatus === 'success' && nativeTokensStatus === 'success') {
      const tokensWithBalance = assets.filter((token) => new BigNumber(token.amount).gt(0));
      setSelectedDenom(tokensWithBalance[0]);
    }
  }, [s3IbcTokensStatus, nativeTokensStatus, snip20TokensStatus]);

  const getTxData = useCallback(() => {
    const fromAddress = address;
    const sourceChain = getBlockChainFromAddress(fromAddress);
    const recipientChain = getBlockChainFromAddress(toAddress);
    const isIBCTx = sourceChain !== recipientChain;
    const isSnip20Tx = isValidAddressWithPrefix(selectedDenom?.coinMinimalDenom ?? '', 'secret');

    const amount = coins(
      toSmall(inputAmount, selectedDenom?.coinDecimals),
      selectedDenom?.ibcDenom ? selectedDenom.ibcDenom : selectedDenom?.coinMinimalDenom ?? '',
    );
    return { fromAddress, isIBCTx, amount, isSnip20Tx };
  }, [selectedDenom, address, toAddress, inputAmount]);

  const sendSnip20 = useCallback(
    async (wallet: Wallet, callback: TxCallback, _txHandler?: SigningSscrt) => {
      setLoading(true);
      setSigningError('');
      try {
        const { fromAddress, amount } = getTxData();
        const txHandler = _txHandler ?? (await getScrtTxHandler(wallet));
        const promise = txHandler.transfer(fromAddress, selectedDenom?.coinMinimalDenom ?? '', {
          transfer: { recipient: toAddress, amount: amount[0].amount },
        });

        setPendingTx({
          img: chainsInfos[activeChain].chainSymbolImageUrl,
          sentAmount: inputAmount,
          sentTokenInfo: selectedDenom as unknown as NativeDenom,
          sentUsdValue: inputUsdValue,
          subtitle1: `to ${sliceAddress(toAddress)}`,
          title1: `Sent ${selectedDenom?.symbol ?? ''}`,
          txStatus: 'loading',
          txType: 'secretTokenTransfer',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          promise,
        });
        callback('success');
      } catch (e: any) {
        if (e.message === transactionDeclinedError) {
          callback('txDeclined');
          // navigate('/home?txDeclined=true');
        } else {
          setSigningError(e.message);
          setShowLedgerPopup(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [toAddress, selectedDenom, inputAmount, activeChain, selectedNetwork, fees, chainsInfos],
  );

  const confirmSend = useCallback(
    async (wallet: OfflineSigner, callback: TxCallback, memo?: string) => {
      if (!fees) {
        return;
      }
      setLoading(true);
      setSigningError('');
      try {
        const { fromAddress, amount, isIBCTx } = getTxData();
        const _tx = await getTxHandler(wallet);
        const inputUsdValue = new BigNumber(inputAmount).multipliedBy(denomFiatValue ?? 0).toString();

        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          setShowLedgerPopup(true);
        }

        const ibcChannelId = isIBCTx ? await getIbcChannelId(toAddress) : '';
        if (!_tx) {
          throw new Error('Something went wrong. Please try again.');
        }

        const txHash = isIBCTx
          ? await _tx?.sendIBCTokens(
              fromAddress,
              toAddress,
              amount[0],
              'transfer',
              ibcChannelId?.[0] ?? '',
              undefined,
              Math.floor(Date.now() / 1000) + 120,
              fees,
              memo,
            )
          : await _tx?.sendTokens(fromAddress, toAddress, amount, fees, memo);

        const txType = isIBCTx ? CosmosTxType.IbcSend : CosmosTxType.Send;
        if (showLedgerPopup) {
          setShowLedgerPopup(false);
        }

        const promise = _tx?.pollForTx(txHash);

        let metadata = isIBCTx
          ? await getMetaDataForIbcTx(ibcChannelId?.[0] ?? '', toAddress, {
              denom: selectedDenom?.coinMinimalDenom ?? amount[0].denom,
              amount: amount[0].amount,
            })
          : getMetaDataForSendTx(toAddress, amount[0]);

        metadata = { ...metadata, ...txMetadata };

        await txPostToDB({
          txHash,
          txType,
          metadata,
          feeDenomination: fees?.amount[0].denom,
          feeQuantity: fees?.amount[0].amount,
          chainId: activeChainId,
        });

        setPendingTx({
          img: chainsInfos[activeChain].chainSymbolImageUrl,
          sentAmount: inputAmount,
          sentTokenInfo: selectedDenom as unknown as NativeDenom,
          sentUsdValue: inputUsdValue,
          subtitle1: sliceAddress(toAddress),
          title1: `${inputAmount} ${selectedDenom?.symbol}`,
          txStatus: 'loading',
          txType: isIBCTx ? 'ibc/transfer' : 'send',
          promise,
        });
        callback('success');
        // navigate('/activity', { state: { fromTx: true } });
        setSigningError('');
      } catch (e: any) {
        if (e.message === transactionDeclinedError) {
          callback('txDeclined');
          // navigate('/home?txDeclined=true');
        } else {
          setSigningError(e.message);
          setShowLedgerPopup(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [toAddress, selectedDenom, inputAmount, activeChain, selectedNetwork, fees, txMetadata, chainsInfos, activeChainId],
  );

  const simulate = useCallback(async () => {
    setError('');

    const sufficientBalance = new BigNumber(inputAmount).lte(new BigNumber(selectedDenom?.amount ?? 0));
    const requestId = simulationRequestId.current;

    if (!inputAmount || new BigNumber(inputAmount).lte(0) || !sufficientBalance) {
      setFees(undefined);

      simulationRequestId.current += 1;
      return;
    }

    if (toAddress && selectedDenom && inputAmount && activeChain) {
      setLoading(true);
      try {
        const isSnip20Tx = isValidAddressWithPrefix(selectedDenom.coinMinimalDenom ?? '', 'secret');
        const { isIBCTx, amount } = getTxData();

        if (requestId !== simulationRequestId.current) {
          return;
        }

        if (!feeDenom) {
          feeDenom = Object.values(chainInfo.nativeDenoms)[0];
        }

        const gasPrice = await getGasPrice();

        const defaultGasIbc =
          defaultGasEstimates[activeChain]?.DEFAULT_GAS_IBC ?? defaultGasEstimates.cosmos.DEFAULT_GAS_IBC;
        const defaultGasSend =
          defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? defaultGasEstimates.cosmos.DEFAULT_GAS_TRANSFER;

        let gasEstimate = isIBCTx ? defaultGasIbc : defaultGasSend;

        const ibcChannelId = isIBCTx ? await getIbcChannelId(toAddress) : '';

        if (isSnip20Tx) {
          try {
            const sscrt = await Sscrt.create(chainsInfos.secret.apis.grpc ?? '', chainsInfos.secret.chainId, address);
            const { gasUsed } = await sscrt.simulate(address, selectedDenom?.coinMinimalDenom, {
              transfer: { recipient: toAddress, amount: amount[0].amount },
            });

            gasEstimate = parseInt(gasUsed.toString());
          } catch (e) {
            //
          }
        } else {
          try {
            const fee = getSimulationFee(feeDenom.coinMinimalDenom);
            const { gasUsed } = isIBCTx
              ? await simulateIbcTransfer(
                  lcdUrl ?? '',
                  address,
                  toAddress,
                  amount[0],
                  ibcChannelId?.[0] ?? '',
                  'transfer',
                  Math.floor(Date.now() / 1000) + 120,
                  undefined,
                  fee,
                )
              : await simulateSend(lcdUrl ?? '', address, toAddress, amount, fee);
            gasEstimate = gasUsed;
          } catch (e) {
            //
          }
        }

        const fee = calculateFee(Math.round(gasEstimate * gasAdjustment), gasPrice.toString());

        const feedDenomValue = allAssets.find((asset) => {
          if (asset.ibcDenom) {
            return asset.ibcDenom === feeDenom.coinMinimalDenom;
          }
          return asset.coinMinimalDenom === feeDenom.coinMinimalDenom;
        });

        if (
          new BigNumber(fee.amount[0].amount).gt(
            new BigNumber(toSmall(feedDenomValue?.amount ?? '0', feedDenomValue?.coinDecimals ?? 6)),
          )
        ) {
          setError('Insufficient funds for fees.');
        } else {
          setFees(fee);
          setError('');
        }
      } catch (e: any) {
        setLoading(false);

        if (e.message.toString().includes('Given amount is not a safe integer.')) {
          setError('Please enter valid amount');
        } else if (e.message.toString().includes('insufficient funds')) {
          setError('Insufficient funds');
        } else setError('Unable to get fees for this transaction.');
      } finally {
        setLoading(false);
      }
    }
  }, [activeWallet, toAddress, selectedDenom, inputAmount, activeChain, selectedNetwork, chainsInfos, getGasPrice]);

  useEffect(() => {
    if (selectedDenom && inputAmount) {
      simulate();
    }
  }, [inputAmount, selectedDenom]);

  const inputUsdValue = inputAmount ? new BigNumber(inputAmount).multipliedBy(denomFiatValue ?? 0).toString() : '';

  const feeUsdValue = fees
    ? new BigNumber(
        fromSmall(fees.amount[0].amount, denoms[fees.amount[0].denom as unknown as SupportedDenoms].coinDecimals),
      )
        .multipliedBy(feeDenomFiatValue ?? 0)
        .toString()
    : '';

  return {
    inputAmount,
    setInputAmount,
    selectedDenom,
    feeUsdValue,
    inputUsdValue,
    setSelectedDenom,
    address,
    toAddress,
    fees,
    setFees,
    memo,
    setMemo,
    simulateSend: simulate,
    confirmSend,
    balances: assets,
    error,
    setError,
    isLoading,
    loading: s3IbcTokensStatus !== 'success' && nativeTokensStatus !== 'success',
    showLedgerPopup,
    signingError,
    sendSnip20,
  };
}
