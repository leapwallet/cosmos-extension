import {
  getNftContractInfo,
  getNftTokenIdInfo,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { makeAutoObservable, reaction, runInAction } from 'mobx';

import {
  BetaEvmNftTokenIdsStore,
  BetaNftChainsStore,
  BetaNftsCollectionsStore,
  ChainInfosStore,
  NftChainsStore,
  NmsStore,
} from '../assets';
import {
  AggregatedSupportedChainType,
  BatchRequestData,
  Collection,
  CollectionData,
  LeapServerResponse,
  NftInfo,
  SelectedNetworkType,
  StoredBetaNftCollection,
} from '../types';
import { normalizeImageSrc, sortStringArr } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';

const BATCH_SIZE = 4;

export class NftStore {
  chainInfosStore: ChainInfosStore;
  nmsStore: NmsStore;
  addressStore: AddressStore;
  nftChainsStore: NftChainsStore;
  betaNftChainsStore: BetaNftChainsStore;
  selectedNetworkStore: SelectedNetworkStore;
  betaNftsCollectionsStore: BetaNftsCollectionsStore;
  activeChainStore: ActiveChainStore;
  betaEvmNftTokenIdsStore: BetaEvmNftTokenIdsStore;

  nfts: Record<string, CollectionData> = {};
  loading: boolean = false;
  networkError: boolean = false; // check if network error occured for any API call
  compassSeiApiIsDown: boolean = false;

  constructor(
    chainInfosStore: ChainInfosStore,
    nmsStore: NmsStore,
    addressStore: AddressStore,
    nftChainsStore: NftChainsStore,
    betaNftChainsStore: BetaNftChainsStore,
    selectedNetworkStore: SelectedNetworkStore,
    betaNftsCollectionsStore: BetaNftsCollectionsStore,
    activeChainStore: ActiveChainStore,
    betaEvmNftTokenIdsStore: BetaEvmNftTokenIdsStore,
  ) {
    makeAutoObservable(this);

    this.chainInfosStore = chainInfosStore;
    this.nmsStore = nmsStore;
    this.addressStore = addressStore;
    this.nftChainsStore = nftChainsStore;
    this.betaNftChainsStore = betaNftChainsStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.betaNftsCollectionsStore = betaNftsCollectionsStore;
    this.activeChainStore = activeChainStore;
    this.betaEvmNftTokenIdsStore = betaEvmNftTokenIdsStore;

    reaction(
      () => this.addressStore.addresses,
      () => this.initialize(),
    );

    reaction(
      () => this.activeChainStore.activeChain,
      () => this.loadNfts(undefined, this.activeChainStore.activeChain),
    );

    reaction(
      () => this.selectedNetworkStore.selectedNetwork,
      (selectedNetwork) => this.loadNfts(selectedNetwork),
    );

    reaction(
      () => this.nftChainsStore.nftChains,
      () => this.initialize(),
    );
  }

  get nftDetails() {
    const chainKey = this.getChainKey();

    return {
      collectionData: this.nfts[chainKey],
      loading: this.loading,
      networkError: this.networkError,
    };
  }

  getVisibleCollectionData(hiddenNfts: string[]) {
    const collectionData = this.nftDetails.collectionData;
    if (hiddenNfts.length && collectionData) {
      const tempNfts = { ...collectionData.nfts };

      hiddenNfts.forEach((hiddenNft) => {
        const [address, tokenId] = hiddenNft.split('-:-');

        const collection = collectionData.collections?.find((collection) => collection.address === address);

        if (collection) {
          const { chain } = collection;
          const nfts: NftInfo[] = tempNfts[chain];
          const _nfts = nfts.filter((nft) => (nft.tokenId ?? nft.domain) !== tokenId);

          if (_nfts.length) {
            tempNfts[chain] = _nfts;
          } else {
            delete tempNfts[chain];
          }
        }
      });

      return { collections: collectionData.collections, nfts: tempNfts };
    }

    return collectionData;
  }

  getAreAllNftsHidden(hiddenNft: string[]) {
    const visibleCollectionData = this.getVisibleCollectionData(hiddenNft);
    const collectionData = this.nftDetails.collectionData;

    return (
      Object.keys(visibleCollectionData?.nfts ?? {}).length === 0 &&
      Object.keys(collectionData?.nfts ?? {}).length !== 0
    );
  }

  getSortedCollectionChains(disabledNfts: string[], hiddenNfts: string[]) {
    const visibleCollectionData = this.getVisibleCollectionData(hiddenNfts);

    const collectionChains =
      visibleCollectionData?.collections.reduce((_collectionChains: SupportedChain[], collection) => {
        if (
          collection.totalNfts &&
          !disabledNfts.includes(collection.address) &&
          !_collectionChains.includes(collection.chain) &&
          Object.keys(visibleCollectionData.nfts).includes(collection.chain)
        ) {
          return [..._collectionChains, collection.chain];
        }

        return _collectionChains;
      }, []) ?? [];

    return sortStringArr(collectionChains) as SupportedChain[];
  }

  async initialize() {
    await Promise.all([
      this.nmsStore.readyPromise,
      this.addressStore.readyPromise,
      this.nftChainsStore.readyPromise,
      this.betaNftChainsStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.betaNftsCollectionsStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.betaEvmNftTokenIdsStore.readyPromise,
    ]);

    this.loadNfts();
  }

  async loadNfts(forceNetwork?: SelectedNetworkType, forceChain?: AggregatedSupportedChainType) {
    const nftChainsList = [...this.nftChainsStore.nftChains, ...this.betaNftChainsStore.betaNftChains];
    let batchChainsList: BatchRequestData[] = [];
    let batchedChains: [SupportedChain, string][] = [];
    const activeNetwork = forceNetwork || this.selectedNetworkStore.selectedNetwork;
    const chainKey = this.getChainKey(activeNetwork);

    runInAction(() => {
      this.loading = true;
      this.networkError = false;
      delete this.nfts?.[chainKey];
    });

    nftChainsList.forEach(async (nftChain) => {
      const network = nftChain.forceNetwork;
      const chain = nftChain.forceContractsListChain;
      forceChain = process.env.APP?.includes('compass') ? forceChain || this.activeChainStore.activeChain : undefined;

      if (forceChain && forceChain !== chain) return;
      if (process.env.APP?.includes('compass') && !this.activeChainStore.isSeiEvm(chain)) return;

      const isTestnet = network === 'testnet';
      const chainInfo = this.chainInfosStore.chainInfos[chain];
      const chainId = isTestnet ? chainInfo?.testnetChainId : chainInfo?.chainId;

      if (activeNetwork === network && chainId) {
        const nodeUrlKey = isTestnet ? 'rpcTest' : 'rpc';
        const hasEntryInNms = this.nmsStore.rpcEndPoints[chainId] && this.nmsStore.rpcEndPoints[chainId].length > 0;

        const rpcUrl = hasEntryInNms ? this.nmsStore.rpcEndPoints[chainId][0].nodeUrl : chainInfo?.apis[nodeUrlKey];
        const collections = this.betaNftsCollectionsStore.getBetaNftsCollections(chain, network);

        const address = this.addressStore.addresses?.[chain];
        const pubKey = this.addressStore.pubKeys?.[chain];
        const walletAddress = chainInfo?.evmOnlyChain ? pubKeyToEvmAddressToShow(pubKey) : address;

        const isSeiEvmChain = process.env.APP?.includes('compass') && this.activeChainStore.isSeiEvm(chain);
        batchedChains = [...batchedChains, [chain, chainId]];

        batchChainsList = [
          ...batchChainsList,
          {
            'chain-id': chainId,
            'wallet-address': walletAddress,
            'evm-address': isSeiEvmChain ? pubKeyToEvmAddressToShow(pubKey) : '',
            'is-testnet': String(isTestnet),
            'rpc-url': rpcUrl ?? '',
            collections,
          },
        ];
      }
    });

    const promises = [];

    if (batchChainsList.length > BATCH_SIZE) {
      let startIndex = 0;
      let endIndex = BATCH_SIZE;

      while (startIndex < batchChainsList.length) {
        promises.push(this.makeNftBatchCall(batchChainsList.slice(startIndex, endIndex), activeNetwork, batchedChains));

        startIndex += BATCH_SIZE;
        endIndex += BATCH_SIZE;
      }
    } else {
      promises.push(this.makeNftBatchCall(batchChainsList, activeNetwork, batchedChains));
    }

    const response = await Promise.allSettled(promises);
    response.forEach((res) => {
      if (res.status === 'rejected' && this.checkNetworkError(res.reason.message)) {
        runInAction(() => {
          this.networkError = true;
        });
      }
    });

    for (const [chain] of batchedChains) {
      const chainInfo = this.chainInfosStore.chainInfos[chain];
      const isEvmOnlyChain = chainInfo?.evmOnlyChain;

      const isSeiEvmChain =
        process.env.APP?.includes('compass') && this.activeChainStore.isSeiEvm(chain) && this.compassSeiApiIsDown;

      if (isEvmOnlyChain || isSeiEvmChain) {
        const collections = this.betaNftsCollectionsStore.getBetaNftsCollections(chain, activeNetwork);

        const evmJsonRpcUrl =
          activeNetwork === 'testnet'
            ? chainInfo.apis.evmJsonRpcTest ?? chainInfo.apis.evmJsonRpc
            : chainInfo.apis.evmJsonRpc;

        const evmBetaCollections = collections.reduce((_evmBetaCollections, collection: StoredBetaNftCollection) => {
          if (!collection.address.toLowerCase().startsWith('0x')) {
            return _evmBetaCollections;
          }

          return [..._evmBetaCollections, collection];
        }, [] as StoredBetaNftCollection[]);

        if (evmBetaCollections.length > 0 && evmJsonRpcUrl) {
          try {
            await this.getEvmNfts(evmJsonRpcUrl, evmBetaCollections, chain, activeNetwork);
          } catch (_) {
            //
          }
        }
      }
    }

    runInAction(() => {
      this.loading = false;
    });
  }

  private async makeNftBatchCall(
    chains: BatchRequestData[],
    activeNetwork: SelectedNetworkType,
    batchedChains: [SupportedChain, string][],
  ) {
    const response = await axios.post(
      'https://api.leapwallet.io/nft/cosmos/batch',
      {
        'pagination-limit': '50',
        'pagination-offset': '0',
        'is-compass-wallet': process.env.APP?.includes('compass') ? true : false,
        'skip-cache': true,
        chains,
      },
      {
        timeout: 15 * 1000, // 15 seconds
      },
    );

    const nftsResponse: LeapServerResponse[] = [...response.data.data];
    let collections: Collection[] = [];
    let nfts: CollectionData['nfts'] = {};

    batchedChains.forEach(([chain, chainId]) => {
      const details = nftsResponse?.find((info) => info.chainId === chainId);
      this.compassSeiApiIsDown = details?.seiApiIsDown || false;

      if (details && details.nftDetails?.length) {
        let _collections: Collection[] = [];
        let _nfts: NftInfo[] = [];

        details.nftDetails.forEach((nftDetail) => {
          const collection = _collections.find((_collection) => _collection.address === nftDetail.collection?.address);
          const collectionInfo = {
            name: (nftDetail.collection?.name || nftDetail.name) ?? '',
            address: nftDetail.collection?.address ?? '',
            image: normalizeImageSrc(
              nftDetail.collection?.image || nftDetail.media?.image?.url || nftDetail.media?.video?.url || '',
            ),
          };

          if (collection) {
            collection.totalNfts += 1;
          } else {
            _collections = [
              ..._collections,
              {
                chain,
                totalNfts: 1,
                ...collectionInfo,
              },
            ];
          }

          const _nftInfo = {
            ...nftDetail,
            name: nftDetail.name ?? '',
            extension: nftDetail.extension,
            image: normalizeImageSrc(nftDetail.media?.video?.url || nftDetail.media?.image?.url || ''),
            tokenUri: nftDetail.tokenUri ?? '',
            tokenId: nftDetail.tokenId ?? '',
            description: nftDetail.description || '',
            collection: collectionInfo,
            domain: nftDetail.extension?.domain || nftDetail.media?.text || nftDetail.tokenId,
            media_type: nftDetail.media?.video?.type || nftDetail.media?.image?.type || '',
            attributes: nftDetail.attributes ?? [],
            server_response: nftDetail,
          };

          _nfts = [..._nfts, _nftInfo];
        });

        collections = [...collections, ..._collections];
        nfts = { ...nfts, [chain]: _nfts };
      }
    });

    const chainKey = this.getChainKey(activeNetwork);
    const uniqueCollections = this.getUniqueCollections(chainKey, collections);

    runInAction(() => {
      this.nfts[chainKey] = {
        collections: uniqueCollections,
        nfts: {
          ...(this.nfts?.[chainKey]?.nfts ?? {}),
          ...nfts,
        },
      };

      this.loading = false;
    });
  }

  private async getEvmNfts(
    evmJsonRpc: string,
    collections: StoredBetaNftCollection[],
    chain: SupportedChain,
    network: SelectedNetworkType,
  ) {
    const walletAddress = pubKeyToEvmAddressToShow(this.addressStore.pubKeys?.[chain]);

    const promises = collections.map(async (nftContract) => {
      const { address } = nftContract;
      const tokenIds = this.betaEvmNftTokenIdsStore.betaEvmNftTokenIds?.[address]?.[walletAddress] ?? [];

      if (tokenIds.length !== 0) {
        const contractInfo = await getNftContractInfo(address, evmJsonRpc);

        const nfts = await Promise.allSettled(
          tokenIds.map(async (tokenId) => {
            const { tokenURI } = await getNftTokenIdInfo(address, tokenId, walletAddress, evmJsonRpc);
            let nftDisplayInfo = {
              name: '',
              description: '',
              image: '',
              attributes: [],
            };

            try {
              const res = await fetch(normalizeImageSrc(tokenURI, address));
              nftDisplayInfo = await JSON.parse((await res.text()).trim());
            } catch (_) {
              //
            }

            const nftImage = nftDisplayInfo.image ? normalizeImageSrc(nftDisplayInfo.image, address) : tokenURI;

            const nft = {
              extension: null,
              collection: {
                name: contractInfo.name,
                address,
                image: nftImage,
              },
              description: nftDisplayInfo.description ?? '',
              name: nftDisplayInfo.name ?? '',
              image: nftImage,
              tokenId,
              tokenUri: tokenURI,
              attributes: nftDisplayInfo.attributes,
            };

            return nft;
          }),
        );

        const allFulfilldNfts = nfts.reduce((acc: NftInfo[], nft) => {
          if (nft.status === 'fulfilled') {
            acc.push(nft.value);
          }

          if (nft.status === 'rejected' && this.checkNetworkError(nft.reason.message)) {
            runInAction(() => {
              this.networkError = true;
            });
          }

          return acc;
        }, []);

        if (allFulfilldNfts.length === 0) return;

        const chainKey = this.getChainKey(network);
        const _collections = this.getUniqueCollections(chainKey, []);

        const prevCollections = _collections.filter((collection) => collection.address !== address);
        const newCollection: Collection = {
          name: contractInfo.name,
          address,
          image: allFulfilldNfts[0]?.image ?? '',
          totalNfts: allFulfilldNfts?.length ?? 1,
          chain,
        };

        const prevNfts = this.nfts?.[chainKey]?.nfts ?? {};
        const prevChainNfts = prevNfts[chain] ?? [];

        const newNfts = allFulfilldNfts.filter((nft) => {
          return prevChainNfts.every((prevChainNft) => prevChainNft.tokenId !== nft.tokenId);
        });

        runInAction(() => {
          this.nfts[chainKey] = {
            collections: [...prevCollections, newCollection],
            nfts: {
              ...prevNfts,
              [chain]: [...prevChainNfts, ...newNfts],
            },
          };

          this.loading = false;
        });
      }
    });

    await Promise.allSettled(promises);
  }

  private getUniqueCollections(chainKey: string, newCollections: Collection[]) {
    return [...(this.nfts?.[chainKey]?.collections ?? []), ...newCollections].reduce(
      (_uniqueCollections, collection) => {
        if (!_uniqueCollections.find((_collection) => _collection.address === collection.address)) {
          return [..._uniqueCollections, collection];
        }

        return _uniqueCollections;
      },
      [] as Collection[],
    );
  }

  private checkNetworkError(message: string) {
    return 'network error' === message.toLowerCase() || message.toLowerCase().includes('timeout');
  }

  private getChainKey(network?: SelectedNetworkType) {
    const cosmosAddress = this.addressStore.addresses?.cosmos;
    network = network || this.selectedNetworkStore.selectedNetwork;

    const chain = process.env.APP?.includes('compass') ? this.activeChainStore.activeChain : undefined;
    const chainInfo = this.chainInfosStore.chainInfos[chain as SupportedChain];
    const chainId = network === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId;

    return `${cosmosAddress}-${chainId}-${network}`;
  }
}
