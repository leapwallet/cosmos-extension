import { axiosWrapper, ClientStateData, getRestUrl, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';

import { useChainsStore } from '../store';

export interface ChannelResponse {
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

export const ibcChannelQuery = async <T = any>({
  baseURL,
  url,
  notFoundError,
  timeout,
  retry = 5,
}: {
  baseURL: string;
  url: string;
  notFoundError?: string;
  timeout?: number;
  retry?: number;
}): Promise<{ success: false; message: string } | { success: true; data: T }> => {
  try {
    const response = await axiosWrapper({
      baseURL,
      method: 'get',
      url,
      timeout,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (e: any) {
    if (e.response?.status === 404) {
      return {
        success: false,
        message: notFoundError ?? 'Channel does not exist',
      };
    }
    // if request timeout
    if (e.code === 'ECONNABORTED') {
      if (retry > 0) {
        return ibcChannelQuery({
          baseURL,
          url,
          notFoundError,
          timeout,
          retry: retry - 1,
        });
      } else {
        return {
          success: false,
          message: 'Failed to validate channel id, please try again',
        };
      }
    }

    return {
      success: false,
      message: 'Failed to fetch channel info',
    };
  }
};

export function useValidateIbcChannelId() {
  const { chains } = useChainsStore();

  const validate = useCallback(
    async (
      channelId: string,
      sourceChainKey: SupportedChain,
      destChainKey: SupportedChain,
      port = 'transfer',
    ): Promise<{ success: false; message: string } | { success: true }> => {
      const destChain = chains[destChainKey];
      const sourceChainLcd = getRestUrl(chains, sourceChainKey, false);

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

      return {
        success: true,
      };
    },
    [chains],
  );

  return validate;
}
