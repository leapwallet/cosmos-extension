import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export function getNftContractsEndpoint(
  network: 'mainnet' | 'testnet',
  chain: SupportedChain,
  isCompassWallet?: boolean,
) {
  const baseEndpoint = 'https://assets.leapwallet.io/cosmos-registry/v1';
  const folder = `nft-contracts${isCompassWallet ? '-compass' : ''}`;
  const file = `${chain}.json`;

  return `${baseEndpoint}/${folder}/${network}/${file}`;
}
