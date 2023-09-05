import { NODE_URLS } from './index';

export function changeTopNode(endpointType: 'rest' | 'rpc', activeChainId: string, previousEndpoint: string) {
  const nodeURLs = NODE_URLS[endpointType] ?? {};
  const activeChainNodes = nodeURLs[activeChainId];
  const lastNode = activeChainNodes[activeChainNodes.length - 1];
  if (previousEndpoint === lastNode.nodeUrl) return;
  const changedNodes = [...activeChainNodes.slice(1), activeChainNodes[0]];
  nodeURLs[activeChainId] = changedNodes;
}
