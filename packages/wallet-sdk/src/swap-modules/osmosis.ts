import { Decimal } from '@cosmjs/math';
import { coin, Registry } from '@cosmjs/proto-signing';
import { AminoTypes, StdFee } from '@cosmjs/stargate';
import { BigNumber } from 'bignumber.js';
import { FEES, osmosis, osmosisAminoConverters } from 'osmojs';
import { DenomsRecord } from 'types';

import { fetchAccountDetails } from '../accounts';
import { NativeDenom } from '../constants';
import { ChainInfos, SupportedChain } from '../constants/chain-infos';
import { BaseSwapTx } from '../swap/CosmwasmClient';
import { GasPrice } from '../tx';
import { SwapModule, SwapToken } from '../types/swaps';

const chainId = ChainInfos.osmosis.chainId;

/**
 * Osmosis Data
 * Assets List - https://raw.githubusercontent.com/osmosis-labs/assetlists/main/osmosis-1/osmosis-1.assetlist.json
 * Pools Data - https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=false#
 * Tokens Data - https://api-osmosis.imperator.co/tokens/v2/all
 */

type PoolAsset = { symbol: string; denom: string; fees: string; liquidity: number; price: number };

type SwapRoute = { poolId: bigint; tokenOutDenom: string }[];

export class OsmosisSwapModule implements SwapModule {
  chain: SupportedChain = 'osmosis';
  via = 'Osmosis Dex';
  defaultSwapFee = 0.2;
  private poolsCacheEntries: [string, [PoolAsset, PoolAsset]][];
  private coinsCache: SwapToken[];
  private tokenPriceCache: Record<string, BigNumber>;
  private initializerPromise: Promise<[void, void]>;
  private nativeDenomsByTokenSymbol: Record<string, NativeDenom>;

  constructor(denoms: DenomsRecord) {
    this.nativeDenomsByTokenSymbol = Object.values(denoms).reduce(
      (acc, denom: NativeDenom) => ({ ...acc, [denom.coinMinimalDenom]: denom }),
      {},
    );
    this.poolsCacheEntries = [];
    this.coinsCache = [];
    this.tokenPriceCache = {};
    this.initializerPromise = Promise.all([
      fetch('https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=false')
        .then((res) => res.json())
        .then((pools: any) => {
          this.poolsCacheEntries = Object.entries(pools);
          this.tokenPriceCache = this.poolsCacheEntries.reduce((acc, [, [assetA, assetB]]) => {
            const _acc = { ...acc };

            if (assetA) {
              _acc[assetA.symbol] = new BigNumber(assetA.price);
            }

            if (assetB) {
              _acc[assetB.symbol] = new BigNumber(assetB.price);
            }

            return _acc;
          }, {} as Record<string, BigNumber>);
        }),
      fetch('https://assets.leapwallet.io/active-objects/v1/osmosis-1.assetlist.json')
        .then((res) => res.json())
        .then((tokens: any) => {
          this.coinsCache = tokens.assets.map(
            (asset: {
              symbol: string;
              denom_units: { denom: string; aliases?: string[] }[];
              logo_URIs: { png: string };
            }) => {
              return {
                symbol: asset.symbol,
                denom: asset.denom_units[0]?.aliases?.[0] ?? asset.denom_units[0].denom,
                ibcDenom: asset.denom_units[0].denom,
                image: asset.logo_URIs.png,
              };
            },
          );
        }),
    ]);
  }

  setDenoms = (denoms: DenomsRecord) => {
    this.nativeDenomsByTokenSymbol = Object.values(denoms).reduce(
      (acc, denom: NativeDenom) => ({ ...acc, [denom.coinMinimalDenom]: denom }),
      {},
    );
  };

  getTokenUsdPrice = async (tokenSymbol: string): Promise<BigNumber> => {
    await this.initializerPromise;
    return this.tokenPriceCache[tokenSymbol];
  };

  getTargetCoinOptions = async (oneOfPair?: string): Promise<SwapToken[]> => {
    await this.initializerPromise;
    if (!oneOfPair) {
      return this.coinsCache;
    }

    const coins: Record<string, boolean> = {};
    this.poolsCacheEntries.forEach(([, assetPair]) => {
      const [assetA, assetB] = assetPair;
      if (assetA && (assetA.symbol === oneOfPair || assetA.symbol === 'OSMO')) {
        coins[assetB.symbol] = true;
      }
      if (assetB && (assetB.symbol === oneOfPair || assetB.symbol === 'OSMO')) {
        coins[assetA.symbol] = true;
      }
    });

    return this.coinsCache.filter((coin) => coins[coin.symbol]);
  };

  getPoolPricesPairs = async (
    fromTokenIbcDenom: string,
    targetTokenIbcDenoml: string,
  ): Promise<[string, [PoolAsset, PoolAsset]]> => {
    await this.initializerPromise;
    const _from = fromTokenIbcDenom.toLowerCase();
    const _target = targetTokenIbcDenoml.toLowerCase();

    const poolMatch = this.poolsCacheEntries.find(([, assetPair]) => {
      const [assetA, assetB] = assetPair;
      const _assetA = assetA ? assetA.denom.toLowerCase() : '';
      const _assetB = assetB ? assetB.denom.toLowerCase() : '';

      return (_assetA === _from && _assetB === _target) || (_assetA === _target && _assetB === _from);
    });

    if (!poolMatch) {
      throw new Error('no-match');
    }

    return poolMatch;
  };

  getTokenToTokenPrice: SwapModule['getTokenToTokenPrice'] = async ({
    tokenAIbcDenom,
    tokenBIbcDenom,
    tokenAmount,
  }) => {
    await this.initializerPromise;
    // 1. check direct price pair
    try {
      const [, [assetA, assetB]] = await this.getPoolPricesPairs(tokenAIbcDenom, tokenBIbcDenom);
      const [fromToken, targetToken] =
        tokenAIbcDenom.toLowerCase() === assetA.denom.toLowerCase() ? [assetA, assetB] : [assetB, assetA];

      const pricePerUnit = new BigNumber(fromToken.price).div(targetToken.price);
      return pricePerUnit.multipliedBy(tokenAmount);
    } catch (err) {
      if (err.message === 'no-match' && tokenAIbcDenom !== 'uosmo' && tokenBIbcDenom !== 'uosmo') {
        // 2. check tokenA -> OSMO and OSMO -> tokenB
        const valueA = await this.getTokenToTokenPrice({
          tokenAIbcDenom,
          tokenBIbcDenom: 'uosmo',
          tokenAmount,
        });
        const valueB = await this.getTokenToTokenPrice({
          tokenAIbcDenom: 'uosmo',
          tokenBIbcDenom,
          tokenAmount: valueA.toNumber(),
        });
        return valueB;
      }
      throw new Error(err);
    }
  };

  getSwapRoute = async (fromTokenIbcDenom: string, targetTokenIbcDenom: string): Promise<SwapRoute> => {
    await this.initializerPromise;
    try {
      const [poolId, [assetA, assetB]] = await this.getPoolPricesPairs(fromTokenIbcDenom, targetTokenIbcDenom);
      const [, targetToken] =
        fromTokenIbcDenom.toLowerCase() === assetA.denom.toLowerCase() ? [assetA, assetB] : [assetB, assetA];

      return [
        {
          poolId: BigInt(poolId),
          tokenOutDenom: targetToken.denom,
        },
      ];
    } catch (err) {
      const [poolIdA, [assetA, assetB]] = await this.getPoolPricesPairs(fromTokenIbcDenom, 'uosmo');
      const [poolIdB, [assetC, assetD]] = await this.getPoolPricesPairs('uosmo', targetTokenIbcDenom);
      const [, xToken] =
        fromTokenIbcDenom.toLowerCase() === assetA.denom.toLowerCase() ? [assetA, assetB] : [assetB, assetA];
      const [, targetToken] = 'uosmo' === assetC.denom.toLowerCase() ? [assetC, assetD] : [assetD, assetC];

      return [
        {
          poolId: BigInt(poolIdA),
          tokenOutDenom: xToken.denom,
        },
        {
          poolId: BigInt(poolIdB),
          tokenOutDenom: targetToken.denom,
        },
      ];
    }
  };

  getDefaultGasAmount = async (fromTokenIbcDenom: string, toTokenIbcDenom: string) => {
    const swapRoute = await this.getSwapRoute(fromTokenIbcDenom, toTokenIbcDenom);
    // base gas amount + gas amount per hop
    // this is an optimistic estimate, should be adjusted by chain
    // via gas estimation data
    return 180_000 + 60_000 * (swapRoute.length - 1);
  };

  swapTokens: SwapModule['swapTokens'] = async ({ swap, fromAddress, signer, rpcEndpoint, lcdEndpoint, customFee }) => {
    await this.initializerPromise;

    const {
      fromTokenSymbol,
      fromTokenDenom,
      fromTokenIbcDenom,
      targetTokenSymbol,
      targetTokenDenom,
      targetTokenIbcDenom,
      fromTokenAmount,
      targetTokenAmount,
      slippage,
    } = swap;

    const fee: StdFee = customFee?.stdFee ?? FEES.osmosis.swapExactAmountIn('medium');

    const tokenInMinimalDenom = this.coinsCache.find((coin) => coin.denom === fromTokenDenom)?.denom;
    const tokenInIBCDenom = this.coinsCache.find((coin) => coin.ibcDenom === fromTokenIbcDenom)?.ibcDenom;

    if (!tokenInMinimalDenom || !tokenInIBCDenom)
      throw new Error(`Swap pair is not supported: ${fromTokenSymbol} -> ${targetTokenSymbol}`);
    const tokenInNativeDenom = this.nativeDenomsByTokenSymbol[tokenInMinimalDenom];

    if (!tokenInNativeDenom) throw new Error(`Swap pair is not supported: ${fromTokenSymbol} -> ${targetTokenSymbol}`);
    const tokenInCoinDecimals = tokenInNativeDenom.coinDecimals;
    const tokenInAmountInMinimalDenom = new BigNumber(fromTokenAmount)
      .multipliedBy(10 ** tokenInCoinDecimals)
      .decimalPlaces(0)
      .toString();

    const tokenOutMinimalDenom = this.coinsCache.find((coin) => coin.denom === targetTokenDenom)?.denom;
    if (!tokenOutMinimalDenom)
      throw new Error(`Swap pair is not supported: ${fromTokenSymbol} -> ${targetTokenSymbol}`);

    const tokenOutNativeDenom = this.nativeDenomsByTokenSymbol[tokenOutMinimalDenom];
    if (!tokenOutNativeDenom) throw new Error(`Swap pair is not supported: ${fromTokenSymbol} -> ${targetTokenSymbol}`);

    const tokenOutCoinDecimals = tokenOutNativeDenom.coinDecimals;
    const tokenOutAmountInMinimalDenom = new BigNumber(targetTokenAmount).multipliedBy(10 ** tokenOutCoinDecimals);

    const tokenOutMinAmount = tokenOutAmountInMinimalDenom
      .multipliedBy(1 - slippage / 100)
      .decimalPlaces(0)
      .toString();

    const { swapExactAmountIn } = osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl;
    const swapRoute = await this.getSwapRoute(fromTokenIbcDenom, targetTokenIbcDenom);

    const msg = swapExactAmountIn({
      sender: fromAddress,
      routes: swapRoute,
      tokenIn: coin(tokenInAmountInMinimalDenom, tokenInIBCDenom),
      tokenOutMinAmount,
    });

    const client = new BaseSwapTx(rpcEndpoint, lcdEndpoint, signer, {
      registry: new Registry(osmosis.poolmanager.v1beta1.registry),
      aminoTypes: new AminoTypes(osmosisAminoConverters),
      gasPrice: new GasPrice(Decimal.fromUserInput(fee.amount[0].amount, 18), fee.amount[0].denom),
    });

    await client.initClient();

    const accountDetails = await fetchAccountDetails(lcdEndpoint, fromAddress);

    const txHash = await client.signAndBroadcastTx(fromAddress, [msg], fee, 'swap via leapwallet', {
      accountNumber: parseInt(accountDetails.accountNumber),
      sequence: parseInt(accountDetails.sequence),
      chainId,
    });

    return {
      txHash,
      fees: {
        amount: fee.amount[0].amount,
        denom: fee.amount[0].denom,
      },
      txType: msg.typeUrl,
      data: {
        liquidityPool: swapRoute.map((p) => p.poolId.toString()).join(','),
        dexName: 'osmosis',
        fromToken: {
          amount: tokenInAmountInMinimalDenom.toString(),
          denom: tokenInMinimalDenom,
        },
        toToken: {
          amount: tokenOutAmountInMinimalDenom.toString(),
          denom: tokenOutMinimalDenom,
        },
      },
      pollPromise: client.pollForTx(txHash),
    };
  };
}
