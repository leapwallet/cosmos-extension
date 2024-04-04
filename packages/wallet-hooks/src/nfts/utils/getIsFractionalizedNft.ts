import { getFractionalizedNftContractsStoreSnapshot } from '../../store';

export async function getIsFractionalizedNft(collectionAddress: string) {
  const fractionalizedNftContracts = await getFractionalizedNftContractsStoreSnapshot();
  return fractionalizedNftContracts.includes(collectionAddress);
}
