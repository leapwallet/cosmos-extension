import { AddressLinkState } from '../utils-hooks';

export function hasToAddEvmDetails(
  isSeiEvmChain: boolean,
  addressLinkState: AddressLinkState,
  isEvmOnlyChain: boolean,
) {
  const seiAddressLinkPending = isSeiEvmChain && !['done', 'unknown'].includes(addressLinkState);
  const addEvmDetails = seiAddressLinkPending || isEvmOnlyChain;
  return addEvmDetails;
}
