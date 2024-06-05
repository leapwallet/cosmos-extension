import { OfflineSigner } from '@cosmjs/proto-signing';
import { StdFee } from '@cosmjs/stargate';
import { ChainInfos, getSwapModule, NativeDenom, SupportedChain, SwapToken } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { useGetTokenSpendableBalances } from '../bank';
import { CosmosTxType } from '../connectors';
import { useActiveWallet, useAddress, useDenoms } from '../store';
import { WALLETTYPE } from '../types';

export const useSwapModule = ({
  chain,
  rpcUrl,
  lcdUrl,
  getWallet,
}: {
  chain: SupportedChain;
  rpcUrl: string;
  lcdUrl: string;
  getWallet: (chain: string) => Promise<OfflineSigner>;
}) => {
  const [selectedToken, setSelectedToken] = useState<SwapToken | undefined>(undefined);
  const [selectedTargetToken, setSelectedTargetToken] = useState<SwapToken | undefined>(undefined);
  const [slippagePercentage, setSlippagePercentage] = useState<number>(2);
  const [amountValue, setAmountValue] = useState<string | undefined>(undefined);
  const [targetTokenUsdPrice, setTargetTokenUsdPrice] = useState<BigNumber | undefined>(undefined);
  const [selectedTokenUsdPrice, setSelectedTokenUsdPrice] = useState<BigNumber | undefined>(undefined);
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);

  const txPostToDB = LeapWalletApi.useOperateCosmosTx();

  const denoms = useDenoms();
  const address = useAddress();
  const walletType = useActiveWallet()?.walletType;

  /**
   * Instance of a class that implements the SwapModule interface.
   * It handles the swap related business logic for each chain.
   */
  const swapper = useMemo(() => getSwapModule(chain, denoms), [chain]);

  useEffect(() => {
    swapper.setDenoms(denoms);
  }, [denoms]);

  const defaultSwapFee = swapper.defaultSwapFee;

  const { allAssets } = useGetTokenSpendableBalances();
  const { data: supportedTokensForSwap, isLoading: isSupportedTokensForSwapLoading } = useQuery<SwapToken[]>({
    queryKey: ['support-tokens-for-swap', swapper.chain, selectedToken?.symbol],
    queryFn: () => swapper.getTargetCoinOptions(selectedToken?.symbol),
  });

  const { data: currentTokenPrice, isLoading: isCurrentTokenPriceLoading } = useQuery<BigNumber>({
    queryKey: ['token-to-token-price', selectedToken?.symbol, selectedTargetToken?.symbol, amountValue],
    queryFn: () => {
      return swapper.getTokenToTokenPrice({
        tokenAIbcDenom: selectedToken?.ibcDenom?.toUpperCase() ?? '',
        tokenBIbcDenom: selectedTargetToken?.ibcDenom?.toUpperCase() ?? '',
        tokenAmount: Number(amountValue),
      });
    },
    enabled: selectedToken !== undefined && selectedTargetToken !== undefined && amountValue !== undefined,
  });

  const { data: defaultGasAmount } = useQuery({
    queryKey: ['swap-route', selectedToken?.symbol, selectedTargetToken?.symbol],
    queryFn: () => {
      try {
        return swapper.getDefaultGasAmount(selectedToken?.ibcDenom ?? '', selectedTargetToken?.ibcDenom ?? '');
      } catch {
        return 150_000;
      }
    },
    initialData: 150_000,
    enabled: selectedToken !== undefined && selectedTargetToken !== undefined,
  });

  const nativeCurrency = useMemo(() => ChainInfos[chain].denom, [chain]);

  const feesInUsd = useMemo(() => {
    const selectedTokenSymbol = selectedToken?.symbol.toLowerCase();
    if (!selectedTokenSymbol) {
      return '-';
    }
    const selectedTokenUsdPrice = new BigNumber(
      allAssets.find((asset) => asset.symbol.toLowerCase() === selectedTokenSymbol)?.usdPrice ?? '-',
    );
    const _fee = amountValue ? new BigNumber(amountValue).multipliedBy(defaultSwapFee / 100) : new BigNumber(0);
    if (_fee.isNaN() || selectedTokenUsdPrice.isNaN()) {
      return '-';
    }
    return _fee.multipliedBy(selectedTokenUsdPrice).toString();
  }, [allAssets, nativeCurrency, amountValue, defaultSwapFee]);

  const unitConversionPrice = useMemo(() => {
    const amountBigNumber = new BigNumber(amountValue ?? 1);
    return isCurrentTokenPriceLoading || currentTokenPrice === undefined
      ? new BigNumber(0)
      : new BigNumber(currentTokenPrice).dividedBy(amountBigNumber.isNaN() ? 1 : amountBigNumber);
  }, [amountValue, currentTokenPrice, isCurrentTokenPriceLoading]);

  const selectedTokenBalance = useMemo(() => {
    const tokenBalance = allAssets.find((asset) => {
      if (selectedToken?.ibcDenom && asset?.ibcDenom) {
        return selectedToken.ibcDenom === asset.ibcDenom;
      }

      return selectedToken?.denom === asset.coinMinimalDenom;
    })?.amount;
    return tokenBalance ?? '0';
  }, [allAssets, selectedToken?.symbol]);

  useEffect(() => {
    if (!selectedToken) {
      return setSelectedTokenUsdPrice(undefined);
    }
    swapper.getTokenUsdPrice(selectedToken.symbol).then(setSelectedTokenUsdPrice);
  }, [selectedToken, swapper]);

  useEffect(() => {
    if (!selectedTargetToken) {
      return setTargetTokenUsdPrice(undefined);
    }
    swapper.getTokenUsdPrice(selectedTargetToken.symbol).then(setTargetTokenUsdPrice);
  }, [selectedTargetToken, swapper]);

  const interchangeTokens = useCallback(() => {
    if (!selectedToken || !selectedTargetToken) {
      return;
    }
    const selectedTokenClone = { ...selectedToken };
    const selectedTargetTokenClone = { ...selectedTargetToken };
    setSelectedToken(selectedTargetTokenClone);
    setSelectedTargetToken(selectedTokenClone);
  }, [selectedToken, selectedTargetToken]);

  const setMaxAmount = useCallback(() => {
    const selectedTokenBalanceValue = new BigNumber(selectedTokenBalance);
    setAmountValue(selectedTokenBalanceValue.toFixed());
  }, [nativeCurrency, selectedToken?.symbol, selectedTokenBalance]);

  const performSwap = useCallback(
    async (customFee?: { stdFee: StdFee; feeDenom: NativeDenom }) => {
      if (!selectedTargetToken || !selectedToken || !address || !rpcUrl || !currentTokenPrice || !amountValue) {
        return;
      }
      const wallet = await getWallet(chain);

      if (walletType === WALLETTYPE.LEDGER) {
        setShowLedgerPopup(true);
      }

      try {
        // sign the tx and broadcast it once.
        const response = await swapper.swapTokens({
          swap: {
            fromTokenSymbol: selectedToken.symbol,
            fromTokenDenom: selectedToken.denom,
            fromTokenIbcDenom: selectedToken.ibcDenom ?? '',
            fromTokenAmount: amountValue,
            targetTokenSymbol: selectedTargetToken.symbol,
            targetTokenDenom: selectedTargetToken.denom,
            targetTokenIbcDenom: selectedTargetToken.ibcDenom ?? '',
            targetTokenAmount: currentTokenPrice.toFixed(8),
            slippage: slippagePercentage,
          },
          fromAddress: address,
          signer: wallet,
          rpcEndpoint: rpcUrl,
          lcdEndpoint: lcdUrl,
          customFee,
        });

        // post the tx to our analytics db
        txPostToDB({
          txHash: response.txHash,
          txType: CosmosTxType.Swap,
          metadata: response.data,
          feeDenomination: response.fees.denom,
          feeQuantity: response.fees.amount,
        }).catch((e) => {
          console.log('Failed to post swap tx to db', e.message);
        });

        setShowLedgerPopup(false);
        return response;
      } catch (e) {
        setShowLedgerPopup(false);
        throw new Error((e as Error).message);
      }
    },
    [
      address,
      amountValue,
      chain,
      currentTokenPrice,
      getWallet,
      rpcUrl,
      selectedTargetToken,
      selectedToken,
      slippagePercentage,
      swapper,
      txPostToDB,
      walletType,
    ],
  );

  const actions = useMemo(
    () => ({
      // Set the selected token
      setSelectedToken,
      // Set the selected target token
      setSelectedTargetToken,
      // Set the slippage percentage
      setSlippagePercentage,
      // Set the amount to swap
      setAmountValue,
      // Interchange the selected tokens
      interchangeTokens,
      // Set the amount to the maximum amount available in the user's wallet adjusted by the fee
      setMaxAmount,
      // Perform the swap
      performSwap,
      // get token Usd Price
      getTokenUsdPrice: (symbol: string) => swapper.getTokenUsdPrice(symbol),
    }),
    [interchangeTokens, performSwap, setMaxAmount],
  );

  const state = {
    // Name of the Swap Provider for the given swap context
    via: swapper.via,
    // Default swap fee for the swap provider
    defaultSwapFee,
    // If the UI needs to show th ledger popup
    showLedgerPopup,
    // The symbol of the native currency of the chain
    nativeCurrency,
    // The amount of the selected token to swap
    amountValue,
    // The balance of the selected token in user's wallet
    selectedTokenBalance,
    // The selected {@link Coin} to swap from
    selectedToken,
    // The price of the selected token in USD
    selectedTokenUsdPrice,
    // The selected {@link Coin} to swap to
    selectedTargetToken,
    // The price of the selected target token in USD
    targetTokenUsdPrice,
    // The price of the selected target token for the given amount of source token
    currentTokenPrice,
    // If {@link currentTokenPrice} is loading
    isCurrentTokenPriceLoading,
    // The price of the selected token in terms of the selected target token
    unitConversionPrice,
    // The slippage percentage
    slippagePercentage,
    // The list of all the tokens in the user's wallet
    allAssets,
    // The list of all the tokens supported for swap
    supportedTokensForSwap,
    // If {@link supportedTokensForSwap} is loading
    isSupportedTokensForSwapLoading,
    // The tx and swap fee in the native currency of the chain
    feesInUsd,
    // default gas amount
    defaultGasAmount,
  } as const;

  return [state, actions] as const;
};
