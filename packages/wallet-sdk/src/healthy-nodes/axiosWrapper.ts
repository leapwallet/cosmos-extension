import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { sleep } from '../utils';
import { changeTopNode, getTopNode, NODE_URLS } from './index';

const removeTrailingSlash = (url: string | undefined) => {
  return url?.replace(/\/$/, '');
};

const RETRY_COUNT = 5;
const TIMEOUT_MILLI_SECONDS = 4000;

export async function axiosWrapper<T = any>(
  options: AxiosRequestConfig,
  retryCount = 1,
  callFor?: string,
): Promise<AxiosResponse<T>> {
  /**
   * To pass "options" properly, can refer to this doc - https://axios-http.com/docs/req_config
   */

  const _options = {
    ...options,
    headers: {
      ...options.headers,
    },
  };

  try {
    const response = await axios({ ..._options, timeout: options.timeout ?? TIMEOUT_MILLI_SECONDS });
    return response;
  } catch (error: any) {
    if (
      callFor === 'proposals-votes' &&
      (error.response.data.code === 3 || error.response.data.error?.code === -32700)
    ) {
      throw error;
    }

    if (callFor === 'cancel-undelegation') {
      return error;
    }

    if (retryCount > RETRY_COUNT) {
      throw error;
    }

    if (
      (error.response || error.message) &&
      (error.response?.status >= 500 ||
        error.response?.status === 429 ||
        error.response?.status === 403 ||
        error.message?.includes('timeout of'))
    ) {
      let isRestURL = false;
      let prevTopNodeChainId = '';

      outerLoop: for (const endpointType in NODE_URLS) {
        const nodeURLs = NODE_URLS[endpointType as 'rest' | 'rpc'];
        for (const chainId in nodeURLs) {
          for (const node of nodeURLs[chainId]) {
            if (node.nodeUrl === options.baseURL) {
              prevTopNodeChainId = chainId;
              isRestURL = endpointType === 'rest';
              break outerLoop;
            }
          }
        }
      }

      if (prevTopNodeChainId) {
        changeTopNode(isRestURL ? 'rest' : 'rpc', prevTopNodeChainId, _options.baseURL ?? '');
        const newTopNode = getTopNode(isRestURL ? 'rest' : 'rpc', prevTopNodeChainId);
        await sleep(200 * (retryCount ?? 1));
        return axiosWrapper({ ..._options, baseURL: removeTrailingSlash(newTopNode?.nodeUrl) }, retryCount + 1);
      }
    }

    return axiosWrapper(options, retryCount + 1);
  }
}
