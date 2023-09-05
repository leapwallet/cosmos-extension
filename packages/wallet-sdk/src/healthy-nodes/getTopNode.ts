import { NODE_URLS } from './index';

export function getTopNode(endpointType: 'rest' | 'rpc', activeChainId: string) {
  const activeChainNodes = (NODE_URLS[endpointType] ?? {})[activeChainId] ?? [];
  return activeChainNodes.length ? activeChainNodes[0] : null;
}
