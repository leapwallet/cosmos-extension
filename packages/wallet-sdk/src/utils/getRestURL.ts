import { ChainInfo, SupportedChain } from '../constants';
import { getTopNode } from '../healthy-nodes';

export function getRestUrl(chainInfos: Record<SupportedChain, ChainInfo>, chain: SupportedChain, isTestnet: boolean) {
  const chainId = isTestnet ? chainInfos[chain].testnetChainId : chainInfos[chain].chainId;
  const topNode = getTopNode('rest', chainId ?? '');

  const terniaryCondition = topNode?.nodeUrl && topNode.nodeUrl.length;
  const fallbackRestURL = !isTestnet ? chainInfos[chain].apis.rest : chainInfos[chain].apis.restTest;

  return (terniaryCondition ? topNode.nodeUrl : fallbackRestURL) ?? '';
}
