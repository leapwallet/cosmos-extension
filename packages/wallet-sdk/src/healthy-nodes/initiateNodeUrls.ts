type NMSUrls = {
  [key: string]: { nodeUrl: string; nodeProvider: null }[];
};

type NodeUrls = { rest: NMSUrls | null; rpc: NMSUrls | null };

export let NODE_URLS: NodeUrls = { rest: null, rpc: null };

const S3_REST_NMS_ENDPOINT = 'https://assets.leapwallet.io/cosmos-registry/v1/node-management-service/nms-REST.json';
const S3_RPC_NMS_ENDPOINT = 'https://assets.leapwallet.io/cosmos-registry/v1/node-management-service/nms-RPC.json';

export async function initiateNodeUrls(restEndpoint?: string, rpcEndpoint?: string) {
  const responses = await Promise.allSettled(
    [restEndpoint ?? S3_REST_NMS_ENDPOINT, rpcEndpoint ?? S3_RPC_NMS_ENDPOINT].map(async (endpoint) => {
      const res = await fetch(endpoint);
      const data = await res.json();

      return { data, key: endpoint.includes('REST') ? 'rest' : 'rpc' };
    }),
  );

  const response = responses.reduce(
    (_response: NodeUrls, currentResponse) => {
      if (currentResponse.status === 'fulfilled') {
        return {
          ..._response,
          [currentResponse.value.key]: currentResponse.value.data,
        };
      }

      return _response;
    },
    { rest: null, rpc: null },
  );

  NODE_URLS = response;
}
