/* eslint-disable @typescript-eslint/no-namespace */
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants';
import axios from 'axios';
import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';

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
  V2MarketPricesResponse,
} from '../connectors';
import { getCoingeckoPricesStoreSnapshot, useActiveChain, useAddress, useAddressStore, useChainsStore } from '../store';
import { useSelectedNetwork } from '../store/useSelectedNetwork';
import { APP_NAME, getAppName, getLeapapiBaseUrl, getPlatform } from '../utils';
import { platforms, platformToChain } from './platforms-mapping';
import { TransactionMetadata } from './types/txLoggingTypes';

export namespace LeapWalletApi {
  const leapApi = new LeapApi(process.env.LEAP_WALLET_BACKEND_API_URL);

  export type LogInfo = {
    readonly txHash: string;
    readonly txType: CosmosTxType;
    readonly metadata?: TransactionMetadata;
    readonly feeDenomination?: string;
    readonly feeQuantity?: string;
    readonly chainId?: string;
    readonly forcePrimaryAddress?: string;
    readonly forceWalletAddress?: string;
    readonly forceChain?: string;
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
    let platform = platforms[chain];
    if (!platform) {
      platform = 'DEFAULT' as Platform;
    }

    let details;

    try {
      details = await leapApi.getMarketDescription({
        platform,
        token: token,
      });
    } catch (_) {
      details = '';
    }

    const priceRes: MarketPricesResponse = await operateMarketPrices([token], chain, preferredCurrency);
    const priceChangeRes: MarketPercentageChangesResponse = await operateMarketPercentChanges([token], chain);
    const marketCapRes: MarketCapsResponse = await leapApi.getMarketCaps({
      platform,
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

  export async function getIbcDenomData(ibcDenom: string, lcdUrl: string, chainId: string) {
    const leapApiBaseUrl = getLeapapiBaseUrl();
    const data = await axios.post(
      `${leapApiBaseUrl}/denom-trace`,
      {
        ibcDenom: ibcDenom,
        lcdUrl: lcdUrl,
        chainId: chainId,
      },
      {
        timeout: 10000,
      },
    );

    return data.data.ibcDenomData;
  }

  export async function getMarketChart(
    token: string,
    chain: SupportedChain,
    days: number,
    currency: Currency,
  ): Promise<{ data: MarketChartPrice[]; minMax: MarketChartPrice[] }> {
    let platform = platforms[chain];
    if (!platform) {
      platform = 'DEFAULT' as Platform;
    }

    const data = await leapApi.getMarketChart({
      platform,
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
      const coingeckoPrices = await getCoingeckoPricesStoreSnapshot();

      if (coingeckoPrices[tokens[0]]) {
        return { [tokens[0]]: coingeckoPrices[tokens[0]] };
      } else {
        if (!platforms[chain]) {
          throw new Error();
        }

        return await leapApi.getMarketPrices({
          platform: platforms[chain],
          tokens: tokens,
          currency: currencySelected,
        });
      }
    } catch (_) {
      return {};
    }
  }

  export async function getEcosystemMarketPrices(
    currency = 'USD',
    ecosystem = 'cosmos-ecosystem',
  ): Promise<{ data: { [key: string]: number } }> {
    try {
      const leapApiBaseUrl = getLeapapiBaseUrl();
      const response = await fetch(
        `${leapApiBaseUrl}/market/prices/ecosystem?currency=${currency}&ecosystem=${ecosystem}`,
      );
      const data = await response.json();

      return { data };
    } catch (_) {
      return { data: {} };
    }
  }

  export async function getActivity(walletAddress: string, limit: number, chainId: string) {
    const leapApiBaseUrl = getLeapapiBaseUrl();
    const { data } = await axios.get(
      `${leapApiBaseUrl}/activity?chain-id=${chainId}&wallet-address=${walletAddress}&use-ecostake-proxy=false&pagination-offset=${limit}`,
      {
        timeout: 30000,
      },
    );
    return { data: data.txs };
  }

  export async function operateMarketPricesV2(
    tokens: { platform: SupportedChain; tokenAddresses: string[] }[],
    currencySelected?: Currency,
  ): Promise<{ [supportedChain: string]: { [tokenAddress: string]: string } }> {
    const platformTokenAddresses = formatPlatforms(tokens);
    if (platformTokenAddresses.length === 0) return Promise.resolve({});

    const marketPrices = await Promise.race([
      leapApi.getV2MarketPrices({
        currency: currencySelected,
        platformTokenAddresses,
      }),
      new Promise<V2MarketPricesResponse>((resolve) => setTimeout(() => resolve({}), 10000)),
    ]);

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
        let platform = platforms[token.platform];
        if (!platform) {
          platform = 'DEFAULT' as Platform;
        }

        return {
          ...token,
          platform,
        };
      })
      .filter((token) => !!token.platform);
  }

  export async function operateMarketPercentChanges(tokens: string[], chain: SupportedChain) {
    try {
      let platform = platforms[chain];
      if (!platform) {
        platform = 'DEFAULT' as Platform;
      }

      return await leapApi.getMarketPercentageChanges({ platform, tokens });
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
      provenance: CosmosBlockchain.Provenance,
      kichain: CosmosBlockchain.Ki,
      sentinel: CosmosBlockchain.Sentinel,
      bandchain: CosmosBlockchain.Band,
      dydx: 'DYDX' as CosmosBlockchain,
      sge: 'SGE' as CosmosBlockchain,
      celestia: 'CELESTIA' as CosmosBlockchain,
      gitopia: CosmosBlockchain.Gitopia,
      xpla: 'XPLA' as CosmosBlockchain,
      aura: 'AURA' as CosmosBlockchain,
      chain4energy: CosmosBlockchain.chain4Energy,
      composable: 'COMPOSABLE' as CosmosBlockchain,
      nolus: CosmosBlockchain.Nolus,
      dymension: 'DYMENSION' as CosmosBlockchain,
      pryzmtestnet: 'PRYZM' as CosmosBlockchain,
      thorchain: 'THOR_CHAIN' as CosmosBlockchain,
      odin: 'ODIN_CHAIN' as CosmosBlockchain,
    };
    return blockchains[activeChain] ?? activeChain.toUpperCase();
  }

  export function sanitizeUrl(url: string) {
    if (url.startsWith('chrome-extension://')) {
      return url;
    }
    const trimmedUrl = url.replace(/^.*:\/\//, '').replace(/^www\./, '');
    const arr = trimmedUrl.split('/');
    return arr[0];
  }

  export function formatMetadata(metadata?: TransactionMetadata) {
    /**
     * Sanitize Dapp Tx urls
     */
    if (metadata && 'dapp_url' in metadata) {
      metadata.dapp_url = sanitizeUrl(metadata.dapp_url ?? '');
    }
    return metadata;
  }

  export function useOperateCosmosTx(): OperateCosmosTx {
    const { chains } = useChainsStore();
    const isCompassWallet = getAppName() === APP_NAME.Compass;

    const _activeChain = useActiveChain();
    const address = useAddress();
    const selectedNetwork = useSelectedNetwork();
    const { primaryAddress } = useAddressStore();
    const testnetChainIds = useMemo(() => {
      return Object.values(chains).map((c) => {
        if (c.testnetChainId) return c.testnetChainId;
      });
    }, [chains]);

    return useCallback(
      async ({
        txHash,
        chainId,
        txType,
        metadata,
        feeDenomination,
        feeQuantity,
        forcePrimaryAddress,
        forceWalletAddress,
        forceChain,
      }) => {
        const walletAddress = forceWalletAddress || address;
        const wallet = forcePrimaryAddress || (primaryAddress ?? address);
        const activeChain = (forceChain || _activeChain) as SupportedChain;

        const isMainnet = chainId ? !testnetChainIds.includes(chainId) : selectedNetwork === 'mainnet';
        const blockchain = getCosmosNetwork(chains[activeChain].key);

        const logReq = {
          app: getPlatform(),
          txHash,
          blockchain,
          isMainnet,
          wallet,
          walletAddress,
          type: txType,
          metadata: formatMetadata(metadata),
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
      [_activeChain, selectedNetwork, primaryAddress, address, chains],
    );
  }

  export function useLogCosmosDappTx(): LogCosmosDappTx {
    const { chains } = useChainsStore();
    const { primaryAddress } = useAddressStore();
    const isCompassWallet = getAppName() === APP_NAME.Compass;
    const selectedNetwork = useSelectedNetwork();
    const testnetChainIds = useMemo(() => {
      return Object.values(chains).map((c) => {
        if (c.testnetChainId) return c.testnetChainId;
      });
    }, [chains]);

    return useCallback(
      async (logInfo: LogInfo & { chain: SupportedChain; address: string }) => {
        const { chain, chainId, address, txHash, metadata, feeDenomination, feeQuantity, txType } = logInfo;
        try {
          const logReq = {
            app: getPlatform(),
            txHash,
            blockchain: getCosmosNetwork(chain),
            // is set to true since we do not support dapp transactions for testnet
            isMainnet: chainId ? !testnetChainIds.includes(chainId) : selectedNetwork === 'mainnet',
            wallet: primaryAddress ?? address,
            walletAddress: address,
            type: txType,
            metadata: formatMetadata(metadata),
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
