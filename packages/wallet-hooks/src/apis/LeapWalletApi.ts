/* eslint-disable @typescript-eslint/no-namespace */
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants';
import axios from 'axios';
import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';

import { TX_LOG_COSMOS_BLOCKCHAIN_MAP } from '../config';
import {
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
  V2TxOperation,
  V2TxRequest,
} from '../connectors';
import {
  getCoingeckoPricesStoreSnapshot,
  getTxLogCosmosBlockchainMapStoreSnapshot,
  useActiveChain,
  useAddress,
  useAddressStore,
  useChainsStore,
} from '../store';
import { useSelectedNetwork } from '../store/useSelectedNetwork';
import { APP_NAME, getAppName, getChainId, getLeapapiBaseUrl, getPlatform } from '../utils';
import { platforms, platformToChain } from './platforms-mapping';
import { TransactionMetadata } from './types/txLoggingTypes';

export namespace LeapWalletApi {
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
    readonly forceNetwork?: 'mainnet' | 'testnet';
    readonly amount?: number; // $value of in-amount
    readonly isEvmOnly?: boolean;
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
    const leapApiBaseUrl = getLeapapiBaseUrl();
    const leapApi = new LeapApi(leapApiBaseUrl);
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
    const leapApiBaseUrl = getLeapapiBaseUrl();
    const leapApi = new LeapApi(leapApiBaseUrl);
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
      const leapApiBaseUrl = getLeapapiBaseUrl();
      const leapApi = new LeapApi(leapApiBaseUrl);
      const coingeckoPrices = await getCoingeckoPricesStoreSnapshot();
      currencySelected = currencySelected ?? Currency.Usd;

      if (coingeckoPrices[currencySelected] && coingeckoPrices[currencySelected][tokens[0]]) {
        return { [tokens[0]]: coingeckoPrices[currencySelected][tokens[0]] };
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

  export async function getActivity(walletAddress: string, offset: number, chainId: string) {
    const leapApiBaseUrl = getLeapapiBaseUrl();
    const { data } = await axios.get(
      `${leapApiBaseUrl}/v2/activity?chain-id=${chainId}&wallet-address=${walletAddress}&use-ecostake-proxy=false&pagination-offset=${offset}`,
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
    const leapApiBaseUrl = getLeapapiBaseUrl();
    const leapApi = new LeapApi(leapApiBaseUrl);
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
      const leapApiBaseUrl = getLeapapiBaseUrl();
      const leapApi = new LeapApi(leapApiBaseUrl);
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
    const leapApiBaseUrl = getLeapapiBaseUrl();
    const leapApi = new LeapApi(leapApiBaseUrl);
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

  export function getCosmosNetwork(activeChain: SupportedChain, txLogMap: Record<string, string> = {}) {
    const blockchains: Record<string, string> = {
      ...TX_LOG_COSMOS_BLOCKCHAIN_MAP,
      ...txLogMap,
    };

    return blockchains[activeChain];
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
    const _selectedNetwork = useSelectedNetwork();
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
        forceNetwork,
        amount,
        isEvmOnly,
      }) => {
        const leapApiBaseUrl = getLeapapiBaseUrl();
        const txnLeapApi = new LeapApi(`${leapApiBaseUrl}/v2`);
        const walletAddress = forceWalletAddress || address;
        const wallet = forcePrimaryAddress || (primaryAddress ?? address);
        const activeChain = (forceChain || _activeChain) as SupportedChain;
        const selectedNetwork = forceNetwork || _selectedNetwork;

        const _chainId = chainId || getChainId(chains[activeChain], selectedNetwork);
        const isMainnet = _chainId ? !testnetChainIds.includes(_chainId) : selectedNetwork === 'mainnet';

        const txLogMap = await getTxLogCosmosBlockchainMapStoreSnapshot();
        const blockchain = getCosmosNetwork(activeChain, txLogMap);

        const logReq = {
          app: getPlatform(),
          txHash,
          isMainnet,
          wallet,
          walletAddress,
          type: txType,
          metadata: formatMetadata(metadata),
          feeDenomination,
          feeQuantity,
          chainId: _chainId ?? '',
        } as V2TxRequest;

        if (amount !== undefined) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          logReq.amount = amount;
        }

        if (blockchain !== undefined) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          logReq.blockchain = blockchain;
        }

        try {
          if (isEvmOnly) {
            const txnLeapApi = new LeapApi(leapApiBaseUrl);
            await txnLeapApi.operateV2Tx(logReq, V2TxOperation.Evm);
          } else if (isCompassWallet) {
            await txnLeapApi.operateSeiTx(logReq as unknown as CosmosTxRequest);
          } else {
            await txnLeapApi.operateCosmosTx(logReq as unknown as CosmosTxRequest);
          }
        } catch (err) {
          console.error(err);
        }
      },
      [_activeChain, _selectedNetwork, primaryAddress, address, chains, testnetChainIds, isCompassWallet],
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
      async ({
        chain,
        chainId,
        address,
        txHash,
        metadata,
        feeDenomination,
        feeQuantity,
        txType,
        isEvmOnly,
      }: LogInfo & { chain: SupportedChain; address: string }) => {
        const leapApiBaseUrl = getLeapapiBaseUrl();
        const txnLeapApi = new LeapApi(`${leapApiBaseUrl}/v2`);
        const _chainId = chainId || getChainId(chains[chain], selectedNetwork);
        const isMainnet = _chainId ? !testnetChainIds.includes(_chainId) : selectedNetwork === 'mainnet';

        const txLogMap = await getTxLogCosmosBlockchainMapStoreSnapshot();
        const blockchain = getCosmosNetwork(chain, txLogMap);

        try {
          const logReq = {
            app: getPlatform(),
            txHash,
            isMainnet,
            wallet: primaryAddress ?? address,
            walletAddress: address,
            type: txType,
            metadata: formatMetadata(metadata),
            feeDenomination,
            feeQuantity,
            chainId: _chainId ?? '',
          } as V2TxRequest;

          if (blockchain !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            logReq.blockchain = blockchain;
          }

          if (isEvmOnly) {
            const txnLeapApi = new LeapApi(leapApiBaseUrl);
            await txnLeapApi.operateV2Tx(logReq, V2TxOperation.Evm);
          } else if (isCompassWallet) {
            await txnLeapApi.operateSeiTx(logReq as unknown as CosmosTxRequest);
          } else {
            await txnLeapApi.operateCosmosTx(logReq as unknown as CosmosTxRequest);
          }
        } catch (err) {
          console.error(err);
        }
      },
      [primaryAddress, chains, selectedNetwork, testnetChainIds, isCompassWallet],
    );
  }
}
