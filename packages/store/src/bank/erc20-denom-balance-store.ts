import {
  DenomsRecord,
  fetchERC20Balances,
  fromSmall,
  getEthereumAddress,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AggregatedSupportedChainType, SelectedNetworkType } from 'types';

import {
  AggregatedChainsStore,
  BetaERC20DenomsStore,
  ChainInfosStore,
  CompassSeiEvmConfigStore,
  DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  ERC20DenomsStore,
  Erc404DenomsStore,
  NmsStore,
} from '../assets';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { PriceStore } from './balance-store';
import { Token } from './balance-types';

export class ERC20DenomBalanceStore {
  chainInfosStore: ChainInfosStore;
  nmsStore: NmsStore;
  addressStore: AddressStore;
  denomsStore: DenomsStore;
  erc20DenomsStore: ERC20DenomsStore;
  selectedNetworkStore: SelectedNetworkStore;
  enabledCW20DenomsStore: EnabledCW20DenomsStore;
  priceStore: PriceStore;
  disabledCW20DenomsStore: DisabledCW20DenomsStore;
  betaERC20DenomsStore: BetaERC20DenomsStore;
  activeChainStore: ActiveChainStore;
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore;
  aggregatedChainsStore: AggregatedChainsStore;
  erc404DenomsStore: Erc404DenomsStore;

  chainWiseBalances: Record<string, Record<string, Token>> = {};
  rawBalances: Record<string, Record<string, any>> = {};
  aggregatedLoadingStatus: boolean = false;
  chainWiseLoadingStatus: Record<string, boolean> = {};

  constructor(
    chainInfosStore: ChainInfosStore,
    nmsStore: NmsStore,
    activeChainStore: ActiveChainStore,
    addressStore: AddressStore,
    selectedNetworkStore: SelectedNetworkStore,
    denomsStore: DenomsStore,
    erc20DenomsStore: ERC20DenomsStore,
    priceStore: PriceStore,
    betaERC20DenomsStore: BetaERC20DenomsStore,
    disabledCW20DenomsStore: DisabledCW20DenomsStore,
    enabledCW20DenomsStore: EnabledCW20DenomsStore,
    compassSeiEvmConfigStore: CompassSeiEvmConfigStore,
    aggregatedChainsStore: AggregatedChainsStore,
    erc404DenomsStore: Erc404DenomsStore,
  ) {
    makeAutoObservable(this);

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.nmsStore = nmsStore;
    this.denomsStore = denomsStore;
    this.erc20DenomsStore = erc20DenomsStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.betaERC20DenomsStore = betaERC20DenomsStore;
    this.enabledCW20DenomsStore = enabledCW20DenomsStore;
    this.disabledCW20DenomsStore = disabledCW20DenomsStore;
    this.priceStore = priceStore;
    this.compassSeiEvmConfigStore = compassSeiEvmConfigStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.erc404DenomsStore = erc404DenomsStore;
  }

  async initialize() {
    await Promise.all([
      this.nmsStore.readyPromise,
      this.denomsStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.erc20DenomsStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.disabledCW20DenomsStore.readyPromise,
      this.enabledCW20DenomsStore.readyPromise,
      this.betaERC20DenomsStore.readyPromise,
      this.addressStore.readyPromise,
      this.priceStore.readyPromise,
      this.compassSeiEvmConfigStore.readyPromise,
      this.aggregatedChainsStore.readyPromise,
      this.erc404DenomsStore.readyPromise,
    ]);
  }

  async fetchChainBalances(forceChain?: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType) {
    const _activeChain = this.activeChainStore.activeChain;
    const activeChain = forceChain ?? _activeChain;
    const _network = this.selectedNetworkStore.selectedNetwork;
    const network = forceNetwork ?? _network;

    if (activeChain === 'forma') {
      await this.fetchFormaErc20TokenBalances();
      return;
    }

    if (activeChain === 'lightlink') {
      await this.fetchLightLinkErc20TokenBalances();
      return;
    }

    if (activeChain === 'manta') {
      await this.fetchMantaErc20TokenBalances();
      return;
    }

    if (activeChain === 'ethereum') {
      return this.fetchEthereumERC20TokenBalances();
    }

    const isSeiEvm = this.activeChainStore.isSeiEvm(activeChain);
    if (isSeiEvm && activeChain !== 'aggregated' && activeChain !== 'seiDevnet') {
      const balanceKey = this.getBalanceKey(activeChain, network);
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = true;
      });

      const isApiDown = await this.fetchSeiEvmERC20TokenBalances(activeChain, network);

      if (isApiDown) {
        return this.fetchERC20TokenBalances(activeChain, network);
      } else {
        await this.fetchERC20TokenBalances(
          activeChain,
          network,
          Object.keys(this.erc404DenomsStore.denoms[activeChain] ?? []),
        );

        runInAction(() => {
          this.chainWiseLoadingStatus[balanceKey] = false;
        });
        return;
      }
    }

    if (activeChain === 'aggregated') {
      runInAction(() => {
        this.aggregatedLoadingStatus = true;
      });
      await Promise.allSettled(
        this.aggregatedChainsStore.aggregatedChainsData.map((chain) =>
          this.fetchERC20TokenBalances(chain as SupportedChain, network),
        ),
      );
      runInAction(() => {
        this.aggregatedLoadingStatus = false;
      });
      return;
    }

    await this.fetchERC20TokenBalances(activeChain, network);
  }

  async fetchERC20TokenBalances(
    activeChain: SupportedChain,
    network: SelectedNetworkType,
    forceERC20Denoms?: string[],
  ) {
    const erc20DenomAddresses = forceERC20Denoms ?? this.getERC20DenomAddresses(activeChain);
    const chainInfo = this.chainInfosStore.chainInfos[activeChain];

    const address = this.addressStore.addresses[chainInfo.key];
    const pubKey = this.addressStore.pubKeys?.[activeChain];

    const evmJsonRpcUrl =
      network === 'testnet' ? chainInfo.apis.evmJsonRpcTest ?? chainInfo.apis.evmJsonRpc : chainInfo.apis.evmJsonRpc;

    const isSeiEvm = this.activeChainStore.isSeiEvm(activeChain);
    const isEvmChain = isSeiEvm || chainInfo?.evmOnlyChain;

    if (!address || !pubKey) {
      return;
    }

    const ethWalletAddress = isEvmChain ? pubKeyToEvmAddressToShow(pubKey) : getEthereumAddress(address);
    const balanceKey = this.getBalanceKey(activeChain, network);
    if (!chainInfo) {
      return;
    }
    if (!evmJsonRpcUrl || !ethWalletAddress || !erc20DenomAddresses || erc20DenomAddresses.length === 0) {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
      return;
    }

    runInAction(() => {
      if (!this.chainWiseBalances[balanceKey]) {
        this.chainWiseLoadingStatus[balanceKey] = true;
      }
    });

    const formattedBalances: Token[] = [];
    let rawBalances: {
      denom: string;
      amount: BigNumber;
    }[] = [];

    try {
      rawBalances = await fetchERC20Balances(evmJsonRpcUrl, ethWalletAddress, erc20DenomAddresses);

      if (rawBalances && rawBalances.length > 0) {
        await Promise.allSettled(
          rawBalances.map(async (balance) => {
            try {
              const formattedToken = this.formatBalance(balance, activeChain);
              if (formattedToken) {
                formattedBalances.push(formattedToken);
              }
            } catch (e) {
              console.error('Error while formatting balance', e);
            }
          }),
        );
      }
    } catch (e) {
      console.error('Error while fetching erc20 balances', e);
    }

    runInAction(() => {
      rawBalances.forEach((balance) => {
        if (!this.rawBalances[balanceKey]) {
          this.rawBalances[balanceKey] = {};
        }
        this.rawBalances[balanceKey][balance.denom] = balance;
      });
      formattedBalances.forEach((balance) => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }
        this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
      });
      this.chainWiseLoadingStatus[balanceKey] = false;
    });
  }

  async fetchFormaErc20TokenBalances() {
    const balanceKey = this.getBalanceKey('forma');
    runInAction(() => {
      this.chainWiseLoadingStatus[balanceKey] = true;
    });

    const pubKey = this.addressStore.pubKeys?.forma;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const url = `https://explorer.forma.art/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      const formattedBalances = data.items.map((item: any) => {
        const token = {
          address: item.token.address,
          decimals: item.token.decimals,
          name: item.token.name,
          symbol: item.token.symbol,
          icon_url: item.token.icon_url || '',
          value: item.value,
        };

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'forma');
      });

      this.denomsStore.setDenoms({ ...denoms, ...tokensToAddInDenoms });
      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    } catch (e) {
      console.error('Error while fetching forma erc20 balances', e);
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    }
  }

  async fetchLightLinkErc20TokenBalances() {
    const balanceKey = this.getBalanceKey('lightlink');
    runInAction(() => {
      this.chainWiseLoadingStatus[balanceKey] = true;
    });

    const pubKey = this.addressStore.pubKeys?.lightlink;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const explorer =
      this.selectedNetworkStore.selectedNetwork === 'mainnet'
        ? 'https://phoenix.lightlink.io'
        : 'https://pegasus.lightlink.io';
    const url = `${explorer}/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      const formattedBalances = data.items.map((item: any) => {
        const token = {
          address: item.token.address,
          decimals: item.token.decimals,
          name: item.token.name,
          symbol: item.token.symbol,
          icon_url: item.token.icon_url || '',
          value: item.value,
        };

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'lightlink');
      });

      this.denomsStore.setDenoms({ ...denoms, ...tokensToAddInDenoms });
      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    } catch (e) {
      console.error('Error while fetching lightlink erc20 balances', e);
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    }
  }

  async fetchMantaErc20TokenBalances() {
    const balanceKey = this.getBalanceKey('manta');
    runInAction(() => {
      this.chainWiseLoadingStatus[balanceKey] = true;
    });

    const pubKey = this.addressStore.pubKeys?.manta;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const explorer =
      this.selectedNetworkStore.selectedNetwork === 'mainnet'
        ? 'https://pacific-explorer.manta.network'
        : 'https://pacific-explorer.sepolia-testnet.manta.network';
    const url = `${explorer}/api/v2/addresses/${walletAddress}/tokens?type=ERC-20`;

    try {
      const { data } = await axios.get(url);
      const tokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      const formattedBalances = data.items.map((item: any) => {
        const token = {
          address: item.token.address,
          decimals: item.token.decimals,
          name: item.token.name,
          symbol: item.token.symbol,
          icon_url: item.token.icon_url || '',
          value: item.value,
        };

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'manta');
      });

      this.denomsStore.setDenoms({ ...denoms, ...tokensToAddInDenoms });
      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    } catch (e) {
      console.error('Error while fetching manta erc20 balances', e);
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    }
  }

  async fetchEthereumERC20TokenBalances() {
    const balanceKey = this.getBalanceKey('ethereum');
    runInAction(() => {
      this.chainWiseLoadingStatus[balanceKey] = true;
    });

    const pubKey = this.addressStore.pubKeys?.ethereum;
    const walletAddress = pubKeyToEvmAddressToShow(pubKey);
    const url = `https://black-rough-hill.quiknode.pro/807a4042fd7a06946309b99a1aad5aed80affdcb`;

    try {
      const { data } = await axios.post(
        url,
        {
          id: 67,
          jsonrpc: '2.0',
          method: 'qn_getWalletTokenBalance',
          params: [
            {
              wallet: walletAddress,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const tokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      const formattedBalances = data.result.result.map((item: any) => {
        const token = {
          address: item.address,
          decimals: item.decimals,
          name: item.name,
          symbol: item.symbol,
          icon_url: item.icon_url || '',
          value: item.totalBalance,
        };

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, 'ethereum');
      });

      this.denomsStore.setDenoms({ ...denoms, ...tokensToAddInDenoms });
      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    } catch (e) {
      console.error('Error while fetching ethereum erc20 balances', e);
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    }
  }

  async fetchSeiEvmERC20TokenBalances(chain: SupportedChain, network: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;

    const pubKey = this.addressStore.pubKeys?.[chain];
    const ethAddress = pubKeyToEvmAddressToShow(pubKey);

    try {
      const url = `https://seitrace.com/insights/api/v2/token/erc20/balances?limit=50&offset=0&chain_id=${chainId}&address=${ethAddress}`;
      const { data } = await axios.get(url, {
        headers: {
          'x-api-key': process.env.ERC_20_API_KEY,
        },
      });

      const tokensToAddInDenoms: Record<string, any> = {};
      const denoms = this.denomsStore.denoms;

      const formattedBalances = data.items.map((item: any) => {
        const token = {
          address: item.token_contract,
          decimals: item.token_decimals,
          name: item.token_name,
          symbol: item.token_symbol,
          icon_url: item.token_logo || '',
          value: item.raw_amount,
        };

        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, chain);
      });

      this.denomsStore.setDenoms({ ...denoms, ...tokensToAddInDenoms });
      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        this.chainWiseLoadingStatus[balanceKey] = false;
      });

      return false;
    } catch (e) {
      console.error('Error while fetching sei evm erc20 balances', e);
      return true;
    }
  }

  private getBalanceKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const chainKey = this.getChainKey(chain, forceNetwork);
    const address = this.addressStore.addresses[chain];
    return `${chainKey}-${address}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;
    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;
    return `${chain}-${chainId}`;
  }

  formatBalance(balance: { amount: BigNumber; denom: string }, chain: SupportedChain) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const coingeckoPrices = this.priceStore.data;
    const chainInfo = chainInfos[chain];

    let _denom = balance.denom;
    if (chain === 'noble' && _denom === 'uusdc') {
      _denom = 'usdc';
    }

    const rootDenoms = this.denomsStore.denoms ?? {};
    const betaERC20Denoms = this.betaERC20DenomsStore.getBetaERC20DenomsForChain(chain) ?? {};
    const allDenoms: Record<string, any> = { ...rootDenoms, ...betaERC20Denoms };

    const denomInfo = allDenoms[_denom];
    if (!denomInfo) {
      return null;
    }

    const amount = fromSmall(new BigNumber(balance.amount).toString(), denomInfo?.coinDecimals);

    let usdValue;
    if (parseFloat(amount) > 0) {
      if (coingeckoPrices) {
        let tokenPrice;
        const coinGeckoId = denomInfo.coinGeckoId;
        const alternateCoingeckoKey = `${chainInfo.chainId}-${denomInfo.coinMinimalDenom}`;

        if (coinGeckoId) {
          tokenPrice = coingeckoPrices[coinGeckoId];
        }
        if (!tokenPrice) {
          tokenPrice = coingeckoPrices[alternateCoingeckoKey];
        }
        if (tokenPrice) {
          usdValue = new BigNumber(amount).times(tokenPrice).toString();
        }
      }
    }

    const usdPrice = parseFloat(amount) > 0 && usdValue ? (Number(usdValue) / Number(amount)).toString() : '0';

    const formattedBalance: Token = {
      chain: denomInfo?.chain ?? '',
      name: denomInfo?.name,
      amount,
      symbol: denomInfo?.coinDenom,
      usdValue: usdValue ?? '',
      coinMinimalDenom: denomInfo?.coinMinimalDenom ?? balance.denom,
      img: denomInfo?.icon,
      ibcDenom: '',
      usdPrice,
      coinDecimals: denomInfo?.coinDecimals,
      coinGeckoId: denomInfo?.coinGeckoId,
      tokenBalanceOnChain: chain as SupportedChain,
    };

    return formattedBalance;
  }

  formatApiBalance(token: any, tokensToAddInDenoms: Record<string, any>, denoms: DenomsRecord, chain: SupportedChain) {
    const contract = token.address;
    let decimals = token.decimals;
    let name = token.name;
    let symbol = token.symbol;
    let icon = token.icon_url || '';

    const [, denomInfo] =
      Object.entries(denoms).find(([key, value]) => {
        if (key.toLowerCase() === contract.toLowerCase()) {
          return value;
        }
      }) ?? [];

    if (!denomInfo) {
      tokensToAddInDenoms[contract] = {
        name,
        coinDenom: symbol,
        coinMinimalDenom: contract,
        coinDecimals: decimals,
        coinGeckoId: '',
        icon,
        chain,
      };
    } else {
      name = denomInfo.name;
      symbol = denomInfo.coinDenom;
      icon = denomInfo.icon;
      decimals = denomInfo.coinDecimals;
    }

    const coinGeckoPrices = this.priceStore.data;
    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const amount = fromSmall(token.value, decimals);
    let usdValue;

    if (coinGeckoPrices && denomInfo?.coinGeckoId && parseFloat(amount) > 0) {
      let tokenPrice;
      const coinGeckoId = denomInfo.coinGeckoId;
      const alternateCoingeckoKey = `${chainInfo.chainId}-${contract}`;

      if (coinGeckoId) {
        tokenPrice = coinGeckoPrices[coinGeckoId];
      }
      if (!tokenPrice) {
        tokenPrice = coinGeckoPrices[alternateCoingeckoKey];
      }
      if (tokenPrice) {
        usdValue = new BigNumber(amount).times(tokenPrice).toString();
      }
    }

    const usdPrice = parseFloat(amount) > 0 && usdValue ? (Number(usdValue) / Number(amount)).toString() : '0';
    return {
      chain,
      name,
      amount,
      symbol,
      usdValue: usdValue ?? '',
      coinMinimalDenom: contract,
      img: icon,
      ibcDenom: '',
      usdPrice,
      coinDecimals: decimals,
      coinGeckoId: '',
      tokenBalanceOnChain: chain,
    };
  }

  private filterDisplayERC20Tokens(tokens: Token[], chain: SupportedChain) {
    const erc20DenomAddresses = this.getERC20DenomAddresses(chain);
    const disabledCW20Tokens = this.disabledCW20DenomsStore.getDisabledCW20DenomsForChain(chain);
    const enabledCW20Tokens = this.enabledCW20DenomsStore.getEnabledCW20DenomsForChain(chain);

    return tokens.filter((token) =>
      erc20DenomAddresses.includes(token.coinMinimalDenom) && String(token.amount) === '0'
        ? enabledCW20Tokens.includes(token.coinMinimalDenom)
        : !disabledCW20Tokens.includes(token.coinMinimalDenom),
    );
  }

  getERC20DenomAddresses(chain: string): string[] {
    const erc20Denoms = this.erc20DenomsStore.denoms;
    const address = this.addressStore.addresses[chain];
    const disabledCW20Denoms = this.disabledCW20DenomsStore.denoms?.[address] ?? [];

    const enabledERC20Denoms = Object.keys(erc20Denoms?.[chain] ?? {}).filter(
      (denom) => !disabledCW20Denoms.includes(denom),
    );

    const betaERC20Denoms = Object.keys(this.betaERC20DenomsStore.denoms?.[chain] ?? {});
    return [...enabledERC20Denoms, ...betaERC20Denoms];
  }

  get erc20Tokens() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.allERC20Tokens;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    const erc20Tokens = this.filterDisplayERC20Tokens(
      Object.values(this.chainWiseBalances[balanceKey] ?? {}),
      activeChain,
    );

    return sortTokenBalances(erc20Tokens);
  }

  getAggregatedERC20Tokens = computedFn((network: SelectedNetworkType) => {
    let allTokens: Token[] = [];
    const chains = Object.keys(this.chainInfosStore?.chainInfos);

    chains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
      const erc20Tokens = this.filterDisplayERC20Tokens(
        Object.values(this.chainWiseBalances[balanceKey] ?? {}),
        chain as SupportedChain,
      );
      allTokens = allTokens.concat(erc20Tokens);
    });

    return sortTokenBalances(allTokens);
  });

  get allERC20Tokens() {
    let allTokens: Token[] = [];
    const chains = Object.keys(this.chainInfosStore?.chainInfos);

    chains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain as SupportedChain);
      const erc20Tokens = this.filterDisplayERC20Tokens(
        Object.values(this.chainWiseBalances[balanceKey] ?? {}),
        chain as SupportedChain,
      );
      allTokens = allTokens.concat(erc20Tokens);
    });

    return sortTokenBalances(allTokens);
  }

  getERC20TokensForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    const erc20Tokens = this.filterDisplayERC20Tokens(Object.values(this.chainWiseBalances[balanceKey] ?? {}), chain);
    return sortTokenBalances(erc20Tokens ?? []);
  });

  getLoadingStatusForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseLoadingStatus[balanceKey] ?? true;
  });

  get loading() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.aggregatedLoadingStatus;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    return this.chainWiseLoadingStatus[balanceKey] ?? true;
  }
}
