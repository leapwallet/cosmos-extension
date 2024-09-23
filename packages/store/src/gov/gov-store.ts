import { axiosWrapper, CosmosSDK, getNeutronProposals, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeAutoObservable, makeObservable, observable, reaction, runInAction } from 'mobx';
import qs from 'qs';

import {
  AggregatedChainsStore,
  ChainCosmosSdkStore,
  ChainInfosConfigStore,
  ChainInfosStore,
  NmsStore,
  SpamProposalsStore,
} from '../assets';
import {
  AggregatedSupportedChainType,
  ChainInfosConfigType,
  LoadingStatusType,
  Proposal,
  Proposal2,
  ProposalApi,
  ProposalStatus,
  SelectedNetworkType,
} from '../types';
import { filterSpamProposals, formatProposal, isFeatureExistForChain, proposalHasContentMessages } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';

export class GovStore {
  chainInfosStore: ChainInfosStore;
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  spamProposalsStore: SpamProposalsStore;
  nmsStore: NmsStore;
  aggregatedChainsStore: AggregatedChainsStore;
  chainCosmosSdkStore: ChainCosmosSdkStore;
  chainInfosConfigStore: ChainInfosConfigStore;
  addressStore: AddressStore;

  chainWiseProposals: Record<string, ProposalApi[] | Proposal[]> = {};
  chainWisePaginations: Record<string, { backend: any; node: any }> = {};
  chainWiseShouldUseFallback: Record<string, boolean> = {};
  chainWiseFetchMore: Record<string, () => Promise<void>> = {};
  chainWiseStatus: Record<string, LoadingStatusType> = {};

  constructor(
    chainInfosStore: ChainInfosStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    spamProposalsStore: SpamProposalsStore,
    nmsStore: NmsStore,
    aggregatedChainsStore: AggregatedChainsStore,
    chainCosmosSdkStore: ChainCosmosSdkStore,
    chainInfosConfigStore: ChainInfosConfigStore,
    addressStore: AddressStore,
  ) {
    makeObservable({
      chainWiseProposals: observable.shallow,
      chainWisePaginations: observable.shallow,
      chainWiseShouldUseFallback: observable,
      chainWiseFetchMore: observable,
      chainWiseStatus: observable,
      aggregatedGov: computed.struct,
    });

    this.nmsStore = nmsStore;
    this.chainInfosStore = chainInfosStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.spamProposalsStore = spamProposalsStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.chainCosmosSdkStore = chainCosmosSdkStore;
    this.chainInfosConfigStore = chainInfosConfigStore;
    this.addressStore = addressStore;

    reaction(
      () => this.addressStore.addresses,
      () => this.initialize(),
    );

    reaction(
      () => this.activeChainStore.activeChain,
      (activeChain) => this.loadProposals(activeChain, this.selectedNetworkStore.selectedNetwork),
    );

    reaction(
      () => this.selectedNetworkStore.selectedNetwork,
      (selectedNetwork) => this.loadProposals(this.activeChainStore.activeChain, selectedNetwork),
    );

    reaction(
      () => this.spamProposalsStore.spamProposals,
      () => this.initialize(),
    );

    reaction(
      () => this.chainInfosConfigStore.chainInfosConfig,
      () => this.initialize(),
    );
  }

  get chainProposals() {
    const chainKey = this.getChainKey(this.activeChainStore.activeChain as SupportedChain);

    return {
      data: this.chainWiseProposals[chainKey] ?? [],
      shouldUseFallback: this.chainWiseShouldUseFallback[chainKey] ?? false,
      status: this.chainWiseStatus[chainKey] ?? 'loading',
      fetchMore:
        this.chainWiseFetchMore[chainKey] ??
        async function () {
          await Promise.resolve();
        },
    };
  }

  get aggregatedGov() {
    let perChainShouldUseFallback: { [key: string]: boolean } = {};
    let perChainGovernance: { [key: string]: Proposal[] | ProposalApi[] } = {};
    const aggregatedChains = this.aggregatedChainsStore.aggregatedChainsData;

    for (const chain of aggregatedChains) {
      const chainKey = this.getChainKey(chain as SupportedChain);

      perChainShouldUseFallback = {
        ...perChainShouldUseFallback,
        [chain]: this.chainWiseShouldUseFallback[chainKey],
      };

      perChainGovernance = {
        ...perChainGovernance,

        // store unique IDs only
        [chain]:
          this.chainWiseProposals[chainKey]?.reduce((acc, proposal) => {
            if (acc.find((p) => p.proposal_id === proposal.proposal_id)) {
              return acc;
            }

            return [...acc, { ...proposal, chain }] as Proposal[] | ProposalApi[];
          }, [] as Proposal[] | ProposalApi[]) ?? [],
      };
    }

    const allProposals = Object.values(perChainGovernance).reduce(
      (acc, proposals) => [...acc, ...proposals] as Proposal[] | ProposalApi[],
      [],
    );

    const votingProposals: (Proposal | ProposalApi)[] = allProposals.filter((proposal) =>
      [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD, ProposalStatus.PROPOSAL_STATUS_IN_PROGRESS].includes(
        proposal.status as ProposalStatus,
      ),
    );

    const nonVotingProposals: (Proposal | ProposalApi)[] = allProposals.filter(
      (proposal) =>
        ![ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD, ProposalStatus.PROPOSAL_STATUS_IN_PROGRESS].includes(
          proposal.status as ProposalStatus,
        ),
    );

    return {
      votingProposals,
      nonVotingProposals,
      perChainShouldUseFallback,
    };
  }

  async initialize() {
    await Promise.all([
      this.activeChainStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.spamProposalsStore.readyPromise,
      this.nmsStore.readyPromise,
      this.aggregatedChainsStore.readyPromise,
      this.chainCosmosSdkStore.readyPromise,
      this.chainInfosConfigStore.readyPromise,
      this.addressStore.readyPromise,
    ]);

    this.loadProposals();
  }

  async loadProposals(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType) {
    chain = chain || this.activeChainStore.activeChain;
    network = network || this.selectedNetworkStore.selectedNetwork;

    if (chain === 'aggregated') {
      this.aggregatedChainsStore.aggregatedChainsData.forEach((chain) => {
        const chainKey = this.getChainKey(chain as SupportedChain);

        if (!this.chainWiseProposals[chainKey]) {
          runInAction(() => (this.chainWiseStatus[chainKey] = 'loading'));
          this.fetchChainProposals(chain as SupportedChain, network ?? 'mainnet');
        }
      });
    } else {
      const chainKey = this.getChainKey(chain);

      if (!this.chainWiseProposals[chainKey]) {
        this.chainWiseStatus[chainKey] = 'loading';
        this.fetchChainProposals(chain, network);
      }
    }
  }

  async fetchChainProposals(chain: SupportedChain, network: SelectedNetworkType) {
    const activeChainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;
    const address = this.addressStore.addresses?.[chain];

    if (!activeChainId || !address || this.chainInfosStore.chainInfos[chain]?.evmOnlyChain) return;
    const chainKey = this.getChainKey(chain);

    const isFeatureComingSoon = isFeatureExistForChain(
      'comingSoon',
      'governance',
      'Extension',
      activeChainId,
      this.chainInfosConfigStore.chainInfosConfig as ChainInfosConfigType,
    );

    const isFeatureNotSupported = isFeatureExistForChain(
      'notSupported',
      'governance',
      'Extension',
      activeChainId,
      this.chainInfosConfigStore.chainInfosConfig as ChainInfosConfigType,
    );

    if (isFeatureComingSoon || isFeatureNotSupported) {
      runInAction(() => {
        this.chainWiseStatus[chainKey] = 'success';
        this.chainWiseProposals[chainKey] = [];
      });

      return;
    }

    const spamProposals = this.spamProposalsStore.spamProposals[chain];
    try {
      const { proposals, key } = await this.fetchProposalsFromBackend(
        activeChainId,
        spamProposals,
        this.chainWiseProposals[chainKey] as ProposalApi[],
        this.chainWisePaginations[chainKey]?.backend,
      );

      if (proposals?.length === 0) {
        throw new Error('No proposals found in API');
      }

      runInAction(() => {
        this.chainWiseStatus[chainKey] = 'success';

        this.chainWiseProposals[chainKey] = proposals;
        this.chainWiseShouldUseFallback[chainKey] = false;
        this.chainWisePaginations[chainKey] = {
          ...(this.chainWisePaginations[chainKey] ?? {}),
          backend: key,
        };

        this.chainWiseFetchMore[chainKey] = async () => {
          runInAction(() => {
            this.chainWiseStatus[chainKey] = 'fetching-more';
          });

          if (this.chainWisePaginations[chainKey]?.backend) {
            await this.fetchChainProposals(chain, this.selectedNetworkStore.selectedNetwork);
          } else {
            runInAction(() => {
              this.chainWiseStatus[chainKey] = 'success';
            });
          }
        };
      });
    } catch (_) {
      try {
        runInAction(() => (this.chainWiseShouldUseFallback[chainKey] = true));
        const [nodeUrlKey, rpcNodeUrlKey] = network === 'testnet' ? ['restTest', 'rpcTest'] : ['rest', 'rpc'];

        const hasEntryInNms =
          this.nmsStore.restEndpoints[activeChainId] && this.nmsStore.restEndpoints[activeChainId].length > 0;
        const hadEntryInRpcNms =
          this.nmsStore.rpcEndPoints[activeChainId] && this.nmsStore.rpcEndPoints[activeChainId].length > 0;

        const lcdUrl = hasEntryInNms
          ? this.nmsStore.restEndpoints[activeChainId][0].nodeUrl
          : this.chainInfosStore.chainInfos[chain].apis[nodeUrlKey as 'rest' | 'restTest'];
        const rpcUrl = hadEntryInRpcNms
          ? this.nmsStore.rpcEndPoints[activeChainId][0].nodeUrl
          : this.chainInfosStore.chainInfos[chain].apis[rpcNodeUrlKey as 'rpc' | 'rpcTest'];

        const chainCosmosSdk =
          this.chainCosmosSdkStore.chainCosmosSdk[activeChainId]?.cosmosSDK ??
          this.chainInfosStore.chainInfos[chain]?.cosmosSDK;

        if (chain === 'saga' || chain === 'noble') return;
        if (!rpcUrl) return;
        if (!lcdUrl) return;

        const { proposals, key } =
          chain === 'neutron'
            ? await this.fetchNeutronProposalsFromContract(rpcUrl, spamProposals)
            : await this.fetchProposalsFromNodes(
                lcdUrl,
                spamProposals,
                this.chainWiseProposals[chainKey] as Proposal[],
                this.chainWisePaginations[chainKey]?.node,
                30,
                chainCosmosSdk as CosmosSDK,
                activeChainId,
              );

        runInAction(() => {
          this.chainWiseStatus[chainKey] = 'success';
          this.chainWiseProposals[chainKey] = proposals;
          this.chainWisePaginations[chainKey] = {
            ...(this.chainWisePaginations[chainKey] ?? {}),
            node: key,
          };

          this.chainWiseFetchMore[chainKey] = async () => {
            runInAction(() => {
              this.chainWiseStatus[chainKey] = 'fetching-more';
            });

            if (this.chainWisePaginations[chainKey]?.node) {
              await this.fetchChainProposals(chain, this.selectedNetworkStore.selectedNetwork);
            } else {
              runInAction(() => {
                this.chainWiseStatus[chainKey] = 'success';
              });
            }
          };
        });
      } catch (_) {
        runInAction(() => {
          this.chainWiseProposals[chainKey] = [];
          this.chainWiseStatus[chainKey] = 'error';
        });
      }
    }
  }

  async fetchProposalsFromBackend(
    activeChainId: string,
    spamProposals: number[] = [],
    previousData: ProposalApi[] = [],
    paginationKey: number = 0,
    paginationLimit: number = 30,
  ) {
    const query = qs.stringify({
      timestamp: Date.now(),
      count: paginationLimit,
      offset: Number(paginationKey ?? 0),
    });

    const response = await fetch(`https://api.leapwallet.io/gov/proposals/${activeChainId}?${query}`, {
      method: 'POST',
    });
    const data = await response.json();

    const proposals = data?.proposals?.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id));
    const updatedProposals = [
      ...previousData,
      ...(proposals ?? [])
        .filter((proposal: any) => filterSpamProposals(proposal, spamProposals))
        .sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id)),
    ];

    return {
      proposals: updatedProposals,
      key: data?.key,
    };
  }

  async fetchProposalsFromNodes(
    lcdUrl: string,
    spamProposals: number[] = [],
    previousData: Proposal[] = [],
    paginationKey: string = '',
    paginationLimit: number = 30,
    activeChainCosmosSDK?: CosmosSDK,
    activeChainId?: string,
  ) {
    const urlPrefix = activeChainId === 'govgen-1' ? '/govgen' : '/cosmos';
    let url = `${urlPrefix}/gov/v1beta1/proposals`;

    switch (activeChainCosmosSDK) {
      case CosmosSDK.Version_Point_46:
      case CosmosSDK.Version_Point_47:
        url = `${urlPrefix}/gov/v1/proposals`;
        break;
    }

    const params = {
      'pagination.limit': paginationLimit,
      'pagination.reverse': true,
      'pagination.key': paginationKey,
    };
    const query = qs.stringify(params);

    const { data } = await axiosWrapper({
      baseURL: lcdUrl,
      method: 'get',
      url: `${url}?${query}`,
    });

    let proposals = [];
    switch (activeChainCosmosSDK) {
      case CosmosSDK.Version_Point_46: {
        const proposalsWithMetadata = data.proposals.filter(
          (proposal: { metadata: string; messages?: any }) => proposal.metadata || proposalHasContentMessages(proposal),
        );
        const formattedProposals = await Promise.all(
          proposalsWithMetadata.map(
            async (proposal: Proposal2.Proposal) => await formatProposal(CosmosSDK.Version_Point_46, proposal),
          ),
        );

        proposals = formattedProposals.filter((proposal: Proposal2.Proposal) =>
          filterSpamProposals(proposal, spamProposals),
        );
        break;
      }

      case CosmosSDK.Version_Point_47: {
        const formattedProposals = await Promise.all(
          data.proposals.map(async (proposal: any) => await formatProposal(CosmosSDK.Version_Point_47, proposal)),
        );

        proposals = formattedProposals.filter((proposal: any) => filterSpamProposals(proposal, spamProposals));
        break;
      }

      default: {
        proposals = data.proposals
          .filter((p: { content: Proposal['content'] | undefined | null }) => p.content)
          .filter((proposal: any) => filterSpamProposals(proposal, spamProposals));

        break;
      }
    }

    return {
      proposals: [
        ...previousData,
        ...proposals.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id)),
      ],
      key: data.pagination.next_key,
    };
  }

  async fetchNeutronProposalsFromContract(rpcUrl: string, spamProposals: number[] = []) {
    const proposals = await getNeutronProposals(rpcUrl);
    return { proposals: proposals.filter((proposal: any) => filterSpamProposals(proposal, spamProposals)), key: null };
  }

  private getChainKey(chain: SupportedChain) {
    const cosmosAddress = this.addressStore.addresses?.cosmos;
    const chainId =
      this.selectedNetworkStore.selectedNetwork == 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;

    return `${cosmosAddress}-${chain}-${chainId}`;
  }
}
