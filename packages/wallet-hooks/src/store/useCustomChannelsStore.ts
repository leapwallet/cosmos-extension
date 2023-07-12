import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';
import create from 'zustand';

import { useDefaultChannelId } from '../ibc';
import { ChannelResponse, ibcChannelQuery } from '../ibc/useValidateIbcChannelId';
import { CUSTOM_CHANNELS_STORE, useGetStorageLayer } from '../utils';
import { useActiveChain } from './useActiveChain';
import { useChainsStore } from './useChainsStore';
import { useChainApis } from './useRpcUrl';

type Channel = {
  // destination chain e.g. cosmos
  chain: string;
  // counter-party chain e.g. osmosis
  counterPartyChain: string;
  // source chain channel id e.g. (osmosis) channel-0
  channelId: string;
};

// mapping of activeChain to list of channels for that chain -> destinationChain
type ChannelsStore = Record<string, Channel[]>;

type CustomChannelStoreState = {
  channels: ChannelsStore;
  setChannels: (_: ChannelsStore) => void;
};

export const useCustomChannelsStore = create<CustomChannelStoreState>((set) => ({
  channels: {},
  setChannels: (channels: ChannelsStore) =>
    set(() => ({
      channels,
    })),
}));

export function useCustomChannels(forceChain?: string) {
  const _activeChain = useActiveChain();

  const activeChain = forceChain ?? _activeChain;

  return useCustomChannelsStore((store) => store.channels[activeChain] ?? []);
}

const channelIdMatcher = /^channel-(\d+)$/;

export function useAddCustomChannel({ sourceChain, targetChain }: { sourceChain?: string; targetChain: string }) {
  const _activeChain = useActiveChain();
  const activeChain = sourceChain ?? _activeChain;

  const { lcdUrl } = useChainApis('osmosis');
  const { chains } = useChainsStore();

  const getStorageLayer = useGetStorageLayer();
  const { channels, setChannels } = useCustomChannelsStore();
  const { data: defaultChannelId } = useDefaultChannelId(activeChain, targetChain);

  const addCustomChannel = useCallback(
    async (
      inputChannelId: string,
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
    > => {
      const trimmedChannelId = inputChannelId.trim();
      if (!trimmedChannelId) {
        return {
          success: false,
          message: 'Channel ID cannot be empty',
        };
      }

      let channelId: string;
      // check if channel ID is a number
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

      const targetChainInfo = chains[targetChain as SupportedChain];

      const existingChannelsForActiveChain = channels[activeChain] ?? [];
      const existingChannelsForTargetChain = channels[targetChain] ?? [];

      if (
        existingChannelsForActiveChain.findIndex(
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
        // check if channel exists
        const [channelResponse, clientStateResponse] = await Promise.all([
          ibcChannelQuery<ChannelResponse>({
            getUrl: () => {
              return `${lcdUrl}/ibc/core/channel/v1/channels/${channelId}/ports/transfer`;
            },
          }),
          ibcChannelQuery<Record<string, any>>({
            getUrl: () => {
              return `${lcdUrl}/ibc/core/channel/v1/channels/${channelId}/ports/transfer/client_state`;
            },
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
          getUrl: () => {
            return `${lcdUrl}/ibc/core/client/v1/client_status/${clientStateResponse.data.identified_client_state.client_id}`;
          },
          notFoundError: 'IBC client does not exist',
        });

        if (!clientStateResponse.success) {
          return clientStateResponse;
        }

        // @ts-expect-error not sure why ts is complaining
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
        ...channels,
        [activeChain]: [
          ...existingChannelsForActiveChain,
          {
            chain: activeChain,
            channelId: channelId,
            counterPartyChain: targetChainInfo.key,
          },
        ],
        [targetChainInfo.key]: [
          ...existingChannelsForTargetChain,
          { chain: targetChainInfo.key, channelId: counterPartyChannelId, counterPartyChain: activeChain },
        ],
      };

      await getStorageLayer.set(CUSTOM_CHANNELS_STORE, JSON.stringify(updatedChannels));

      setChannels(updatedChannels);

      return {
        success: true,
        message: 'Channel added successfully',
        channel: channelId,
      };
    },
    [channels, setChannels, activeChain, lcdUrl, getStorageLayer, chains],
  );

  return addCustomChannel;
}
