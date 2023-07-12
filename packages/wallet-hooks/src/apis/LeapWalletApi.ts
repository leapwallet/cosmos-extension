/* eslint-disable @typescript-eslint/no-namespace */
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants';
import { format } from 'date-fns';
import { useCallback } from 'react';

import {
  CosmosBlockchain,
  CosmosTxRequest,
  CosmosTxType,
  Currency,
  LeapApi,
  MarketCapsResponse,
  MarketChartPrice,
  MarketPercentageChangesResponse,
  MarketPricesResponse,
  Platform,
} from '../connectors';
import { useActiveChain, useAddress, useAddressStore, useChainsStore } from '../store';
import { useSelectedNetwork } from '../store/useSelectedNetwork';
import { APP_NAME, getAppName, getPlatform } from '../utils';
import { platforms, platformToChain } from './platforms-mapping';

export namespace LeapWalletApi {
  const leapApi = new LeapApi(process.env.LEAP_WALLET_BACKEND_API_URL);

  export type LogInfo = {
    readonly txHash: string;
    readonly txType: CosmosTxType;
    readonly metadata?: object;
    readonly feeDenomination?: string;
    readonly feeQuantity?: string;
  };

  export type OperateCosmosTx = (info: LogInfo) => Promise<void>;

  export type LogCosmosDappTx = (info: LogInfo & { address: string; chain: SupportedChain }) => Promise<void>;

  export async function getAssetDetails(
    token: string,
    chain: SupportedChain,
    preferredCurrency: Currency,
  ): Promise<{
    details: string;
    price: number;
    priceChange: number;
    marketCap: number;
  }> {
    if (!platforms[chain]) {
      throw new Error();
    }

    let details;

    try {
      details = await leapApi.getMarketDescription({
        platform: platforms[chain],
        token: token,
      });
    } catch (_) {
      details = '';
    }

    const priceRes: MarketPricesResponse = await operateMarketPrices([token], chain, preferredCurrency);
    const priceChangeRes: MarketPercentageChangesResponse = await operateMarketPercentChanges([token], chain);
    const marketCapRes: MarketCapsResponse = await leapApi.getMarketCaps({
      platform: platforms[chain],
      tokens: [token],
      currency: preferredCurrency,
    });

    const price = Object.values(priceRes)[0];
    const priceChange = Object.values(priceChangeRes)[0];
    const marketCap = Object.values(marketCapRes)[0];

    return {
      details: details ?? '',
      price,
      priceChange,
      marketCap,
    };
  }

  export async function getMarketChart(
    token: string,
    chain: SupportedChain,
    days: number,
    currency: Currency,
  ): Promise<{ data: MarketChartPrice[]; minMax: MarketChartPrice[] }> {
    if (!platforms[chain]) {
      throw new Error();
    }
    const data = await leapApi.getMarketChart({
      platform: platforms[chain],
      token: token,
      days: days,
      currency: currency,
    });

    const minMax = data.reduce((acc: MarketChartPrice[], val) => {
      acc[0] = acc[0] === undefined || val.price < acc[0].price ? val : acc[0];
      acc[1] = acc[1] === undefined || val.price > acc[1].price ? val : acc[1];
      return acc;
    }, []);

    return {
      data: data.map((v) => {
        const date = new Date(v.date);
        return {
          timestamp: v.date,
          date: format(date, 'H:mma MMM do, yy'),
          smoothedPrice: v.smoothedPrice,
          price: v.smoothedPrice - minMax[0].price, //v.price - minMax[0].price,
        };
      }),
      minMax,
    };
  }

  /** @returns Prices of `tokens` in `Currency`. */
  export async function operateMarketPrices(
    tokens: string[],
    chain: SupportedChain,
    currencySelected?: Currency,
  ): Promise<MarketPricesResponse> {
    try {
      if (!platforms[chain]) {
        throw new Error();
      }
      return await leapApi.getMarketPrices({
        platform: platforms[chain],
        tokens: tokens,
        currency: currencySelected,
      });
    } catch (_) {
      return {};
    }
  }

  export async function operateMarketPricesV2(
    tokens: { platform: SupportedChain; tokenAddresses: string[] }[],
    currencySelected?: Currency,
  ): Promise<{ [supportedChain: string]: { [tokenAddress: string]: string } }> {
    const platformTokenAddresses = formatPlatforms(tokens);
    if (platformTokenAddresses.length === 0) return Promise.resolve({});
    const marketPrices = await leapApi.getV2MarketPrices({
      currency: currencySelected,
      platformTokenAddresses,
    });
    const entries = Object.entries(marketPrices);

    return entries.reduce((acc, [key, value]) => {
      return {
        ...acc,
        [platformToChain[key as Platform]]: value,
      };
    }, {});
  }

  // eslint-disable-next-line no-inner-declarations
  function formatPlatforms(tokens: { platform: SupportedChain; tokenAddresses: string[] }[]) {
    return tokens
      .map((token) => {
        return {
          ...token,
          platform: platforms[token.platform],
        };
      })
      .filter((token) => !!token.platform);
  }

  export async function operateMarketPercentChanges(tokens: string[], chain: SupportedChain) {
    try {
      if (platforms[chain]) {
        return await leapApi.getMarketPercentageChanges({ platform: platforms[chain], tokens });
      } else {
        return {};
      }
    } catch (_) {
      return {};
    }
  }

  export async function operateMarketPercentagesV2(
    tokens: { platform: SupportedChain; tokenAddresses: string[] }[],
    currency?: Currency,
  ): Promise<{ [key: string]: { [tokenAddr: string]: number } }> {
    const platformTokenAddresses = formatPlatforms(tokens);
    if (platformTokenAddresses.length === 0) return Promise.resolve({});
    const marketPercentages = await leapApi.getV2MarketPercentageChanges({
      platformTokenAddresses,
      currency,
    });
    const entries = Object.entries(marketPercentages);
    return entries.reduce((acc, [key, value]) => {
      return {
        ...acc,
        [platformToChain[key as Platform]]: value,
      };
    }, {});
  }

  // eslint-disable-next-line no-inner-declarations
  export function getCosmosNetwork(activeChain: SupportedChain) {
    const blockchains: Record<SupportedChain, CosmosBlockchain> = {
      akash: CosmosBlockchain.Akash,
      assetmantle: CosmosBlockchain.AssetMantle,
      axelar: CosmosBlockchain.Axelar,
      comdex: CosmosBlockchain.Comdex,
      crescent: CosmosBlockchain.Cresent,
      cryptoorg: CosmosBlockchain.CryptoOrgChain,
      emoney: CosmosBlockchain.EMoney,
      irisnet: CosmosBlockchain.IrisNet,
      juno: CosmosBlockchain.Juno,
      osmosis: CosmosBlockchain.Osmosis,
      persistenceNew: CosmosBlockchain.Persistence,
      persistence: CosmosBlockchain.Persistence,
      secret: CosmosBlockchain.Secret,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      secretnetwork: CosmosBlockchain.Secret,
      sifchain: CosmosBlockchain.Sifchain,
      sommelier: CosmosBlockchain.Sommelier,
      stargaze: CosmosBlockchain.Stargaze,
      starname: CosmosBlockchain.Starname,
      umee: CosmosBlockchain.Umee,
      cosmos: CosmosBlockchain.CosmosHub,
      injective: CosmosBlockchain.Injective,
      kujira: CosmosBlockchain.Kujira,
      sei: CosmosBlockchain.Sei,
      mars: CosmosBlockchain.Mars,
      stride: CosmosBlockchain.Stride,
      agoric: CosmosBlockchain.Agoric,
      cheqd: CosmosBlockchain.Cheqd,
      likecoin: CosmosBlockchain.LikeCoin,
      gravitybridge: CosmosBlockchain.GravityBridge,
      chihuahua: CosmosBlockchain.Chihuahua,
      fetchhub: CosmosBlockchain.FetchHub,
      teritori: CosmosBlockchain.Teritori,
      desmos: CosmosBlockchain.Desmos,
      jackal: CosmosBlockchain.Jackal,
      bitsong: CosmosBlockchain.BitSong,
      evmos: CosmosBlockchain.Evmos,
      bitcanna: CosmosBlockchain.Bitcanna,
      canto: CosmosBlockchain.Canto,
      decentr: CosmosBlockchain.Decentr,
      carbon: CosmosBlockchain.Carbon,
      cudos: CosmosBlockchain.Cudos,
      kava: CosmosBlockchain.Kava,
      omniflix: CosmosBlockchain.OmniFlix,
      passage: CosmosBlockchain.Passage,
      terra: CosmosBlockchain.Terra,
      quasar: CosmosBlockchain.Quasar,
      neutron: CosmosBlockchain.Neutron,
      coreum: CosmosBlockchain.Coreum,
      mainCoreum: CosmosBlockchain.Coreum,
      quicksilver: CosmosBlockchain.QuickSilver,
      onomy: CosmosBlockchain.Onomy,
      seiTestnet2: CosmosBlockchain.Sei,
      migaloo: CosmosBlockchain.Migaloo,
      kyve: CosmosBlockchain.Kyve,
      archway: CosmosBlockchain.Archway,
      noble: CosmosBlockchain.Noble,
      impacthub: CosmosBlockchain.Ixo,
      planq: CosmosBlockchain.Planq,
      nomic: CosmosBlockchain.Nomic,
      nibiru: CosmosBlockchain.Nibiru,
      mayachain: CosmosBlockchain.mayaChain,
      empowerchain: CosmosBlockchain.EmpowerChain,
      dydx: 'DYDX' as CosmosBlockchain,
    };
    return blockchains[activeChain];
  }

  export function useOperateCosmosTx(): OperateCosmosTx {
    const { chains } = useChainsStore();
    const isCompassWallet = getAppName() === APP_NAME.Compass;

    const activeChain = useActiveChain();
    const address = useAddress();
    const selectedNetwork = useSelectedNetwork();
    const { primaryAddress } = useAddressStore();

    return useCallback(
      async ({ txHash, txType, metadata, feeDenomination, feeQuantity }) => {
        const logReq = {
          app: getPlatform(),
          txHash,
          blockchain: getCosmosNetwork(chains[activeChain].key),
          isMainnet: selectedNetwork === 'mainnet',
          wallet: primaryAddress ?? address,
          walletAddress: address,
          type: txType,
          metadata,
          feeDenomination,
          feeQuantity,
        } as CosmosTxRequest;

        try {
          if (isCompassWallet) {
            await leapApi.operateSeiTx(logReq);
          } else {
            await leapApi.operateCosmosTx(logReq);
          }
        } catch (err) {
          console.error(err);
        }
      },
      [activeChain, selectedNetwork, primaryAddress, address, chains],
    );
  }

  export function useLogCosmosDappTx(): LogCosmosDappTx {
    const { primaryAddress } = useAddressStore();
    const isCompassWallet = getAppName() === APP_NAME.Compass;
    const selectedNetwork = useSelectedNetwork();

    return useCallback(
      async (logInfo: LogInfo & { chain: SupportedChain; address: string }) => {
        const { chain, address, txHash, metadata, feeDenomination, feeQuantity, txType } = logInfo;
        try {
          const logReq = {
            app: getPlatform(),
            txHash,
            blockchain: getCosmosNetwork(chain),
            // is set to true since we do not support dapp transactions for testnet
            isMainnet: selectedNetwork === 'mainnet',
            wallet: primaryAddress ?? address,
            walletAddress: address,
            type: txType,
            metadata,
            feeDenomination,
            feeQuantity,
          } as CosmosTxRequest;

          if (isCompassWallet) {
            await leapApi.operateSeiTx(logReq);
          } else {
            await leapApi.operateCosmosTx(logReq);
          }
        } catch (err) {
          console.error(err);
        }
      },
      [primaryAddress],
    );
  }
}
