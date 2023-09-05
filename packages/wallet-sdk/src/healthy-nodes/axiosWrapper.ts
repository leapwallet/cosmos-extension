import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { changeTopNode, getTopNode, NODE_URLS } from './index';

const removeTrailingSlash = (url: string | undefined) => {
  return url?.replace(/\/$/, '');
};

const RETRY_COUNT = 4;
const TIMEOUT_MILLI_SECONDS = 3000;

export async function axiosWrapper<T = any>(options: AxiosRequestConfig, retryCount = 1): Promise<AxiosResponse<T>> {
  /**
   * To pass "options" properly, can refer to this doc - https://axios-http.com/docs/req_config
   */

  const _options = {
    ...options,
    headers: {
      ...options.headers,
      'x-requested-with': 'leap-client',
    },
  };

  try {
    const response = await axios({ ..._options, timeout: options.timeout ?? TIMEOUT_MILLI_SECONDS });
    return response;
  } catch (error: any) {
    if (retryCount > RETRY_COUNT) {
      return error;
    }

    if (
      error.response &&
      (error.response.status >= 500 || error.response.status === 429 || error.response.status === 403)
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
        return axiosWrapper({ ..._options, baseURL: removeTrailingSlash(newTopNode?.nodeUrl) }, retryCount + 1);
      }
    }

    return axiosWrapper(options, retryCount + 1);
  }
}
