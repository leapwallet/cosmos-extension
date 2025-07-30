export const handleTestnetChainName = (
  chainName: string,
  sendSelectedNetwork: 'mainnet' | 'testnet',
) => {
  if (!chainName) {
    return chainName
  }

  if (sendSelectedNetwork === 'mainnet') {
    return chainName
  }

  return chainName.includes('Testnet') ? chainName : `${chainName} Testnet`
}
