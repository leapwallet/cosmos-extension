import { ClientStateData, getRestUrl, IBCData, StorageLayer, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainInfosStore } from 'assets';
import axios, { AxiosError } from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

import { getClientTimestamp, ibcChannelQuery, parseDuration } from './utils';

export const CUSTOM_CHANNELS_STORE = 'custom-channels-store';

interface ChannelResponse {
  channel: {
    state: 'STATE_UNINITIALIZED_UNSPECIFIED' | 'STATE_INIT' | 'STATE_TRYOPEN' | 'STATE_OPEN' | 'STATE_CLOSED';
    ordering: 'ORDER_NONE_UNSPECIFIED' | 'ORDER_UNORDERED' | 'ORDER_ORDERED';
    counterparty: {
      port_id: string;
      channel_id: string;
    };
    connection_hops: string[];
    version: string;
  };
}

const baseUrl = 'https://assets.leapwallet.io/ibc-support-db/pairs';
const backupUrl = 'https://proxy.atomscan.com/directory/_IBC';

// Custom channel types
type Channel = {
  chain: string;
  counterPartyChain: string;
  channelId: string;
};

type ChannelsStore = Record<string, Channel[]>;

export class IbcDataStore {
  private chainInfoStore: ChainInfosStore;
  private storageLayer: StorageLayer;
  private ibcData: Record<string, IBCData> = {};
  private ibcChains: Record<string, Record<string, boolean>> = {};
  private customChannels: ChannelsStore = {};

  constructor(chainInfoStore: ChainInfosStore, storageLayer: StorageLayer) {
    makeAutoObservable(this);
    this.chainInfoStore = chainInfoStore;
    this.storageLayer = storageLayer;
  }

  async loadIbcData(sourceChain: SupportedChain, recipientChain: SupportedChain, url: string = baseUrl) {
    const sourceChainPath = this.chainInfoStore.chainInfos[sourceChain]?.chainRegistryPath;
    const recipientChainPath = this.chainInfoStore.chainInfos[recipientChain]?.chainRegistryPath;
    const chainOrder = [sourceChainPath, recipientChainPath].sort((a, b) => a.localeCompare(b));
    const filePath = chainOrder.join('-');
    if (this.ibcData[filePath]) return;
    try {
      const response = await axios(`${url}/${filePath}.json`);
      const ibcData: IBCData = await response.data;
      runInAction(() => {
        this.ibcData[filePath] = ibcData;
      });
    } catch (e) {
      if (e instanceof AxiosError && (e.response?.status === 404 || e.response?.status === 403)) {
        throw new Error('not-supported');
      }
      if (url !== backupUrl) {
        await this.loadIbcData(sourceChain, recipientChain, backupUrl);
        return;
      } else {
        throw e;
      }
    }
  }

  async loadIbcChains(chain: SupportedChain) {
    const path = this.chainInfoStore.chainInfos[chain]?.chainRegistryPath;
    if (!path) return;
    if (chain === 'seiDevnet') return;
    if (this.ibcChains[path]) return;
    try {
      const { data: supportedChains } = await axios<string[]>(
        `https://assets.leapwallet.io/ibc-support-db/chains/${path}.json`,
      );
      runInAction(() => {
        this.ibcChains[path] = supportedChains.reduce((acc, curr) => {
          return { ...acc, [curr]: true };
        }, {});
      });
    } catch (error) {
      console.error(`Failed to load IBC chains for ${chain}:`, error);
      return;
    }
  }

  getIbcChains(chain: SupportedChain) {
    const path = this.chainInfoStore.chainInfos[chain]?.chainRegistryPath;
    if (!path) return {};
    if (chain === 'seiDevnet') return {};
    return this.ibcChains[path] ?? {};
  }

  getSourceChainChannelId(sourceChain: SupportedChain, recipientChain: SupportedChain) {
    const sourceChainPath = this.chainInfoStore.chainInfos[sourceChain]?.chainRegistryPath;
    const recipientChainPath = this.chainInfoStore.chainInfos[recipientChain]?.chainRegistryPath;
    const chainOrder = [sourceChainPath, recipientChainPath].sort((a, b) => a.localeCompare(b));
    const filePath = chainOrder.join('-');
    const ibcData = this.ibcData[filePath];
    const [chain1] = chainOrder;
    if (!ibcData) return '';
    const [channel] = ibcData.channels;
    return chain1 === sourceChain ? channel['chain_1']['channel_id'] : channel['chain_2']['channel_id'];
  }

  getChannelIds(sourceChain: SupportedChain, recipientChain: SupportedChain) {
    const chainOrder = [sourceChain, recipientChain].sort((a, b) => a.localeCompare(b));
    const filePath = chainOrder.join('-');
    const ibcData = this.ibcData[filePath];
    if (!ibcData) return [];
    const [chain1, chain2] = chainOrder;

    return ibcData.channels.reduce((channels: Array<string>, channel) => {
      if (chain1 === sourceChain) {
        channels.push(channel['chain_1']['channel_id']);
      } else if (chain2 === sourceChain) {
        channels.push(channel['chain_2']['channel_id']);
      }
      return channels;
    }, []);
  }

  getCustomChannels(chain: string): Channel[] {
    return this.customChannels[chain] ?? [];
  }

  setCustomChannels(channels: ChannelsStore) {
    this.customChannels = channels;
  }

  async initCustomChannels() {
    if (!this.storageLayer) return;

    try {
      const customChannelsStore = await this.storageLayer.get(CUSTOM_CHANNELS_STORE);
      if (!customChannelsStore) {
        await this.storageLayer.set(CUSTOM_CHANNELS_STORE, '{}');
        this.setCustomChannels({});
      } else {
        const store = JSON.parse(customChannelsStore);
        this.setCustomChannels(store);
      }
    } catch {
      this.setCustomChannels({});
    }
  }

  async addCustomChannel(
    sourceChain: string,
    targetChain: string,
    inputChannelId: string,
    defaultChannelId?: string,
  ): Promise<
    | {
        success: false;
        message: string;
      }
    | {
        success: true;
        message: string;
        channel: string;
      }
  > {
    const channelIdMatcher = /^channel-(\d+)$/;
    const trimmedChannelId = inputChannelId.trim();
    const lcdUrl = getRestUrl(this.chainInfoStore.chainInfos, sourceChain as SupportedChain, false);

    if (!trimmedChannelId) {
      return {
        success: false,
        message: 'Channel ID cannot be empty',
      };
    }

    let channelId: string;
    if (Number.isInteger(Number(trimmedChannelId))) {
      channelId = `channel-${trimmedChannelId}`;
    } else if (channelIdMatcher.test(trimmedChannelId)) {
      channelId = trimmedChannelId;
    } else {
      return {
        success: false,
        message: 'Invalid channel ID',
      };
    }

    if (channelId === defaultChannelId) {
      return {
        success: false,
        message: 'Channel ID already exists',
      };
    }

    const targetChainInfo = this.chainInfoStore.chainInfos[targetChain as SupportedChain];
    const existingChannelsForSourceChain = this.customChannels[sourceChain] ?? [];
    const existingChannelsForTargetChain = this.customChannels[targetChain] ?? [];

    if (
      existingChannelsForSourceChain.findIndex(
        (c) => c.channelId === channelId && c.counterPartyChain === targetChain,
      ) !== -1
    ) {
      return {
        success: false,
        message: 'Channel ID already exists',
      };
    }

    let counterPartyChannelId: string;

    try {
      const [channelResponse, clientStateResponse] = await Promise.all([
        ibcChannelQuery<ChannelResponse>({
          baseURL: lcdUrl ?? '',
          url: `/ibc/core/channel/v1/channels/${channelId}/ports/transfer`,
        }),
        ibcChannelQuery<Record<string, any>>({
          baseURL: lcdUrl ?? '',
          url: `/ibc/core/channel/v1/channels/${channelId}/ports/transfer/client_state`,
        }),
      ]);

      if (!channelResponse.success) {
        return channelResponse;
      }

      if (!clientStateResponse.success) {
        return clientStateResponse;
      }

      if (channelResponse.data.channel?.state !== 'STATE_OPEN') {
        return {
          success: false,
          message: 'Channel is not on OPEN STATE',
        };
      }

      if (clientStateResponse.data.identified_client_state.client_state.chain_id !== targetChainInfo.chainId) {
        return {
          success: false,
          message: `Channel is not for ${targetChain} (${targetChainInfo.chainId})`,
        };
      }

      counterPartyChannelId = channelResponse.data.channel.counterparty.channel_id;

      const clientStatusResponse = await ibcChannelQuery({
        baseURL: lcdUrl ?? '',
        url: `/ibc/core/client/v1/client_status/${clientStateResponse.data.identified_client_state.client_id}`,
        notFoundError: 'IBC client does not exist',
      });

      if (!clientStatusResponse.success) {
        return clientStatusResponse;
      }

      if (clientStatusResponse.data.status !== 'Active') {
        return {
          success: false,
          message: 'Channel is not Active',
        };
      }
    } catch (e: any) {
      if (e.response?.status === 404) {
        return {
          success: false,
          message: 'Channel does not exist',
        };
      }

      return {
        success: false,
        message: e instanceof Error ? e.message : `Error: ${e}`,
      };
    }

    const updatedChannels: ChannelsStore = {
      ...this.customChannels,
      [sourceChain]: [
        ...existingChannelsForSourceChain,
        {
          chain: sourceChain,
          channelId: channelId,
          counterPartyChain: targetChainInfo.key,
        },
      ],
      [targetChainInfo.key]: [
        ...existingChannelsForTargetChain,
        { chain: targetChainInfo.key, channelId: counterPartyChannelId, counterPartyChain: sourceChain },
      ],
    };

    if (this.storageLayer) {
      await this.storageLayer.set(CUSTOM_CHANNELS_STORE, JSON.stringify(updatedChannels));
    }

    this.setCustomChannels(updatedChannels);

    return {
      success: true,
      message: 'Channel added successfully',
      channel: channelId,
    };
  }

  async validateIbcChannelId(
    channelId: string,
    sourceChainKey: SupportedChain,
    destChainKey: SupportedChain,
    port = 'transfer',
  ): Promise<{ success: false; message: string } | { success: true }> {
    const destChain = this.chainInfoStore.chainInfos[destChainKey];
    const sourceChainLcd = getRestUrl(this.chainInfoStore.chainInfos, sourceChainKey, false);

    const [channelResponse, clientStateResponse] = await Promise.all([
      ibcChannelQuery<ChannelResponse>({
        baseURL: sourceChainLcd,
        url: `/ibc/core/channel/v1/channels/${channelId}/ports/${port}`,
        timeout: 5_000,
      }),
      ibcChannelQuery<ClientStateData>({
        baseURL: sourceChainLcd,
        url: `/ibc/core/channel/v1/channels/${channelId}/ports/${port}/client_state`,
        timeout: 5_000,
      }),
    ]);

    if (!channelResponse.success) {
      return channelResponse;
    }

    if (!clientStateResponse.success) {
      return clientStateResponse;
    }

    if (channelResponse.data.channel?.state !== 'STATE_OPEN') {
      return {
        success: false,
        message: 'Channel is not on OPEN STATE',
      };
    }

    if (clientStateResponse.data.identified_client_state.client_state.chain_id !== destChain.chainId) {
      return {
        success: false,
        message: `Channel is not for ${destChain.chainName} (${destChain.chainId})`,
      };
    }

    const timestamp = await getClientTimestamp(
      sourceChainLcd,
      clientStateResponse.data.identified_client_state.client_id,
      clientStateResponse.data.identified_client_state.client_state,
    );

    if (!timestamp.success) {
      return {
        success: false,
        message: timestamp.error,
      };
    }

    const now = Date.now() * 1000000; // nanoseconds
    const trustingPeriodNs = parseDuration(
      clientStateResponse.data.identified_client_state.client_state.trusting_period,
    );
    const latestTime = timestamp.timestamp;
    const expiryTime = latestTime + trustingPeriodNs;

    if (now >= expiryTime) {
      return {
        success: false,
        message: 'Client state is expired',
      };
    }

    return {
      success: true,
    };
  }
}
