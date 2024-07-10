import { OfflineSigner } from '@cosmjs/proto-signing';
import { calculateFee, Coin, StdFee } from '@cosmjs/stargate';
import {
  fromSmall,
  getSimulationFee,
  LedgerError,
  NativeDenom,
  simulateVote,
  SupportedChain,
  toSmall,
} from '@leapwallet/cosmos-wallet-sdk';
import { INJECTIVE_DEFAULT_STD_FEE } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants/default-gasprice-step';
import { BigNumber } from 'bignumber.js';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { useCallback, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { useGetTokenBalances } from '../bank';
import { CosmosTxType } from '../connectors';
import { useGasAdjustmentForChain } from '../fees';
import { currencyDetail, useformatCurrency, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useActiveWalletStore,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useGetChains,
  usePendingTxState,
  useSelectedNetwork,
} from '../store';
import { useTxHandler } from '../tx';
import { TxCallback, VoteOptions, WALLETTYPE } from '../types';
import { fetchCurrency, formatTokenAmount, getMetaDataForGovVoteTx, useGetGasPrice, useNativeFeeDenom } from '../utils';
import { getNativeDenom } from '../utils/getNativeDenom';
import { useChainId } from '../utils-hooks';

export const getVoteNum = (voteOptions: VoteOptions): VoteOption => {
  switch (voteOptions) {
    case VoteOptions.YES:
      return 1;
    case VoteOptions.ABSTAIN:
      return 2;
    case VoteOptions.NO:
      return 3;
    case VoteOptions.NO_WITH_VETO:
      return 4;
    default:
      return 0;
  }
};

export function useSimulateVote(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const { lcdUrl } = useChainApis(forceChain, forceNetwork);
  const address = useAddress(forceChain);

  return useCallback(
    ({ proposalId, voteOption, fee }: { proposalId: string; voteOption: VoteOptions; fee: Coin[] }) => {
      if (proposalId) {
        return simulateVote(lcdUrl ?? '', address, proposalId, getVoteNum(voteOption), fee);
      }

      return Promise.resolve(null);
    },
    [lcdUrl, address],
  );
}

export type UseGovParams = {
  proposalId: string;
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
};

export function useGov({ proposalId, forceChain, forceNetwork }: UseGovParams) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [ledgerError, setLedgerErrorMsg] = useState<string>();
  const [fees, setFees] = useState<StdFee>();

  const [memo, setMemo] = useState<string>('');
  const [feeUsdValue, setFeeUsdValue] = useState<string>();
  const [feeText, setFeeText] = useState<string>('');
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [_selectedNetwork, forceNetwork]);

  const chainInfos = useGetChains();
  const { activeWallet } = useActiveWalletStore();
  const { allAssets } = useGetTokenBalances(activeChain, selectedNetwork);
  const getTxHandler = useTxHandler({
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  const address = useAddress(activeChain);
  const { setPendingTx } = usePendingTxState();
  const nativeFeeDenom = useNativeFeeDenom(activeChain, selectedNetwork);
  const activeChainId = useChainId(activeChain, selectedNetwork);

  const defaultGasEstimates = useDefaultGasEstimates();
  const [preferredCurrency] = useUserPreferredCurrency();
  const txPostToDB = LeapWalletApi.useOperateCosmosTx();
  const [currencyFormatter] = useformatCurrency();
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const getGasPrice = useGetGasPrice(activeChain, selectedNetwork);
  const gasAdjustment = useGasAdjustmentForChain(activeChain);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const setLedgerError = (error?: string) => {
    setLedgerErrorMsg(error);
    setShowLedgerPopup(false);
  };

  const vote = useCallback(
    async ({
      wallet,
      callback,
      voteOption: _voteOption,
      isSimulation = true,
      customFee,
    }: {
      wallet: OfflineSigner;
      callback: TxCallback;
      voteOption: VoteOptions;
      isSimulation?: boolean;
      customFee?: {
        stdFee: StdFee;
        feeDenom: NativeDenom;
      };
    }) => {
      const voteOption = getVoteNum(_voteOption);
      setFeeText('');
      if (voteOption === undefined) return;

      if (proposalId && activeChain && allAssets) {
        setLoading(true);
        setError(undefined);
        setLedgerError(undefined);

        try {
          const _tx = !isSimulation ? await getTxHandler(wallet) : undefined;
          const denom = getNativeDenom(chainInfos, activeChain, selectedNetwork);

          const nativeDenom = allAssets.find((asset) => {
            if (asset.ibcDenom) {
              return asset.ibcDenom === denom.coinMinimalDenom;
            }
            return asset.coinMinimalDenom === denom.coinMinimalDenom;
          });

          let fee: StdFee;
          let feeDenom: NativeDenom;
          const amount = toSmall(nativeDenom?.amount ?? '0', nativeDenom?.coinDecimals);

          if (customFee !== undefined) {
            fee = customFee.stdFee;
            feeDenom = customFee.feeDenom;
          } else {
            const gasPrice = await getGasPrice();
            let gasEstimate =
              defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ?? defaultGasEstimates.cosmos.DEFAULT_GAS_TRANSFER;

            try {
              const fee = getSimulationFee(gasPrice.denom);
              const { gasUsed } = await simulateVote(lcdUrl ?? '', address, proposalId, voteOption, fee);
              gasEstimate = gasUsed;
            } catch (e) {
              //
            }

            fee = calculateFee(Math.round((gasEstimate ?? 250000) * gasAdjustment), gasPrice);
            if (activeChain === 'injective') {
              fee = INJECTIVE_DEFAULT_STD_FEE;
            }

            if (fee.amount[0].amount === '0') {
              fee = {
                ...fee,
                gas: ((gasEstimate ?? 25_0000) * gasAdjustment).toString(),
              };
            }

            if (new BigNumber(fee.amount[0].amount).gte(amount)) {
              throw new Error('Insufficient funds for fees');
            }

            feeDenom = nativeFeeDenom;
          }

          setFees(fee);

          if (isSimulation) {
            try {
              const feesFiatVal = await fetchCurrency(
                fromSmall(fee.amount[0].amount, feeDenom.coinDecimals),
                feeDenom.coinGeckoId,
                activeChain,
                currencyDetail[preferredCurrency].currencyPointer,
                `${activeChainId}-${feeDenom.coinMinimalDenom}`,
              );

              const feeTokenAmount = formatTokenAmount(
                new BigNumber(fromSmall(fee.amount[0].amount, feeDenom.coinDecimals)).toString(),
                feeDenom.coinDenom,
              );
              const feeValueUsd = currencyFormatter(new BigNumber(feesFiatVal ?? '0'));

              setFeeUsdValue(feesFiatVal ?? '0');
              setFeeText(`Transaction Fee: ${feeTokenAmount} (${feeValueUsd})`);
            } catch (e) {
              setFeeText(
                `Transaction Fee: ${formatTokenAmount(
                  new BigNumber(fromSmall(fee.amount[0].amount, feeDenom.coinDecimals)).toString(),
                  feeDenom.coinDenom,
                )}`,
              );

              setFeeUsdValue(undefined);
            }
            return;
          }

          if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
            setShowLedgerPopup(true);
          }

          if (_tx) {
            const txHash = await _tx.vote(address, proposalId, voteOption, fee, memo);
            if (!txHash) {
              throw new Error('Transaction failed');
            }

            const promise = _tx.pollForTx(txHash);
            const metadata = getMetaDataForGovVoteTx(proposalId, voteOption);

            await txPostToDB({
              txHash: txHash,
              txType: CosmosTxType.GovVote,
              metadata,
              feeDenomination: fee.amount[0].denom,
              feeQuantity: fee.amount[0].amount,
              forceChain: activeChain,
              forceNetwork: selectedNetwork,
              forceWalletAddress: address,
              chainId: activeChainId,
            });

            setPendingTx({
              img: chainInfos[activeChain].chainSymbolImageUrl,
              subtitle1: `Proposal ${proposalId}`,
              title1: _voteOption,
              txStatus: 'loading',
              txType: 'vote',
              promise,
              txHash,
              sourceChain: activeChain,
              sourceNetwork: selectedNetwork,
            });

            callback('success');
            setError(undefined);
            return true;
          }
        } catch (e: any) {
          if (e instanceof LedgerError) {
            setLedgerError(e.message);
          } else {
            setLoading(false);
            setError(e.message.toString());
          }

          return false;
        } finally {
          setLoading(false);
          setShowLedgerPopup(false);
        }
      }
    },
    [
      activeWallet,
      activeChain,
      activeChainId,
      selectedNetwork,
      allAssets,
      getVoteNum,
      address,
      getTxHandler,
      chainInfos,
      memo,
      proposalId,
      txPostToDB,
      setPendingTx,
      lcdUrl,
      currencyDetail,
      preferredCurrency,
      gasAdjustment,
      nativeFeeDenom,
      currencyFormatter,
    ],
  );

  return {
    loading,
    fees,
    feeUsdValue,
    feeText,
    vote,
    error,
    clearError,
    memo,
    setMemo,
    showLedgerPopup,
    ledgerError,
  };
}
