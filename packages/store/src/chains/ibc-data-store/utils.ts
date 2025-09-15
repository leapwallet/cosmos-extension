import { axiosWrapper, ClientState } from '@leapwallet/cosmos-wallet-sdk';

export function parseDuration(duration: string) {
  if (duration.endsWith('s')) {
    return parseInt(duration.slice(0, -1)) * 1000000000;
  }
  if (duration.endsWith('ns')) {
    return parseInt(duration.slice(0, -2));
  }
  return parseInt(duration);
}

export async function ibcChannelQuery<T = any>({
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
}): Promise<{ success: false; message: string } | { success: true; data: T }> {
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
}

export async function getClientTimestamp(
  restEndpoint: string,
  clientId: string,
  clientState: ClientState,
): Promise<{ success: false; error: string } | { success: true; timestamp: number }> {
  try {
    const latestHeight = clientState.latest_height;
    const consensusUrl = `${restEndpoint}/ibc/core/client/v1/consensus_states/${clientId}/revision/${latestHeight.revision_number}/height/${latestHeight.revision_height}`;

    const response = await axiosWrapper({ baseURL: consensusUrl, method: 'get' });
    if (!response.data) {
      return { success: false, error: 'Could not fetch consensus state' };
    }

    const consensusState = response.data.consensus_state;

    if (consensusState.timestamp) {
      const timestamp = new Date(consensusState.timestamp).getTime() * 1000000;
      if (!isNaN(timestamp)) {
        return { success: true, timestamp };
      }
    }

    return { success: false, error: 'No valid timestamp found in consensus state' };
  } catch (error: any) {
    return { success: false, error: `Failed to get consensus state: ${error?.message}` };
  }
}
