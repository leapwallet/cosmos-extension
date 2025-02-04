import { ChainInfo, SupportedChain } from '../constants';
import { getTopNode } from '../healthy-nodes';

const removeTrailingSlash = (url: string | undefined) => url?.replace(/\/$/, '');

export const getChainApis = (
  activeChain: SupportedChain,
  selectedNetwork: 'mainnet' | 'testnet',
  chains: Record<SupportedChain, ChainInfo>,
  isTestnetRpcAvailable?: boolean,
) => {
  if (!activeChain || !chains[activeChain]) return { rpcUrl: '', lcdUrl: '' };

  const mainnetLcdUrl = chains[activeChain].apis.rest;
  const mainnetRpcUrl = chains[activeChain].apis.rpc;

  const testnetLcdUrl =
    !isTestnetRpcAvailable && chains[activeChain].apis.alternateRestTest
      ? chains[activeChain].apis.alternateRestTest
      : chains[activeChain].apis.restTest;
  const testnetRpcUrl =
    !isTestnetRpcAvailable && chains[activeChain].apis.alternateRpcTest
      ? chains[activeChain].apis.alternateRpcTest
      : chains[activeChain].apis.rpcTest;

  const fallbackRpcURL =
    selectedNetwork === 'testnet' && chains[activeChain].apis.rpcTest
      ? removeTrailingSlash(testnetRpcUrl)
      : removeTrailingSlash(mainnetRpcUrl);
  const fallbackRestURL =
    selectedNetwork === 'testnet' && chains[activeChain].apis.restTest
      ? removeTrailingSlash(testnetLcdUrl)
      : removeTrailingSlash(mainnetLcdUrl);

  const activeChainId =
    (selectedNetwork === 'testnet' ? chains[activeChain].testnetChainId : chains[activeChain].chainId) ?? '';
  const restNode = getTopNode('rest', activeChainId);
  const { nodeUrl: rest } = restNode ?? {};

  const rpcNode = getTopNode('rpc', activeChainId);
  const { nodeUrl: rpc } = rpcNode ?? {};

  const evmJsonRpc =
    selectedNetwork === 'testnet'
      ? chains[activeChain].apis.evmJsonRpcTest ?? chains[activeChain].apis.evmJsonRpc
      : chains[activeChain].apis.evmJsonRpc;

  return {
    rpcUrl: rpc && rpc.length ? rpc : fallbackRpcURL,
    lcdUrl: rest && rest.length ? rest : fallbackRestURL,
    grpcUrl:
      selectedNetwork === 'testnet' && chains[activeChain].apis.grpcTest
        ? removeTrailingSlash(chains[activeChain].apis.grpcTest)
        : removeTrailingSlash(chains[activeChain].apis.grpc),
    txUrl: chains[activeChain].txExplorer?.[selectedNetwork]?.txUrl,
    evmJsonRpc,
  };
};
