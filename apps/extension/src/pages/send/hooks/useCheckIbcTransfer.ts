import {
  SelectedAddress,
  sliceWord,
  Token,
  useAddressPrefixes,
  useChainsStore,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  BTC_CHAINS,
  getBlockChainFromAddress,
  isAptosAddress,
  isAptosChain,
  isEthAddress,
  isSolanaAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'
import { ManageChainsStore } from 'stores/manage-chains-store'

export type UseCheckIbcTransferParams = {
  sendActiveChain: SupportedChain
  selectedAddress: SelectedAddress | null
  sendSelectedNetwork: 'testnet' | 'mainnet'
  isIbcUnwindingDisabled: boolean
  skipSupportedDestinationChainsIDs: string[]
  selectedToken: Token | null

  setAddressError: React.Dispatch<React.SetStateAction<string | undefined>>
  manageChainsStore: ManageChainsStore
}

export function useCheckIbcTransfer({
  sendActiveChain,
  selectedAddress,
  sendSelectedNetwork,
  isIbcUnwindingDisabled,
  skipSupportedDestinationChainsIDs,
  selectedToken,

  setAddressError,
  manageChainsStore,
}: UseCheckIbcTransferParams) {
  const { chains } = useChainsStore()
  const addressPrefixes = useAddressPrefixes()

  // FIXME: sendactivechain is initially cosmos
  const isBtcTx = BTC_CHAINS.includes(sendActiveChain)
  const activeChainInfo = chains[sendActiveChain]

  useEffect(() => {
    let destinationChain: string | undefined
    let destChainAddrPrefix: string | undefined
    if (
      isBtcTx ||
      isAptosAddress(selectedAddress?.address ?? '') ||
      isEthAddress(selectedAddress?.address ?? '') ||
      isSolanaAddress(selectedAddress?.address ?? '')
    ) {
      return
    }

    if (selectedAddress?.address) {
      destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address)

      if (!destChainAddrPrefix) {
        setAddressError('The entered address is invalid')
        return
      } else {
        destinationChain = addressPrefixes[destChainAddrPrefix]
      }
    } else {
      return
    }

    const isIBC =
      destChainAddrPrefix && destChainAddrPrefix !== chains[sendActiveChain].addressPrefix

    if (!isIBC) {
      setAddressError(undefined)
      return
    }

    // ibc not supported on testnet
    if (isIBC && sendSelectedNetwork === 'testnet') {
      setAddressError(`IBC transfers are not supported on testnet.`)
      return
    }

    // check if destination chain is supported
    if (
      !isIbcUnwindingDisabled &&
      chains[destinationChain as SupportedChain]?.apiStatus === false
    ) {
      setAddressError(
        `IBC transfers are not supported between ${
          chains[destinationChain as SupportedChain]?.chainName || 'this address'
        } and ${activeChainInfo.chainName}.`,
      )
      return
    } else {
      setAddressError(undefined)
    }

    if (
      !isIbcUnwindingDisabled &&
      skipSupportedDestinationChainsIDs?.length > 0 &&
      !skipSupportedDestinationChainsIDs.includes(
        chains[destinationChain as SupportedChain]?.chainId,
      )
    ) {
      setAddressError(
        `IBC transfers are not supported between ${
          chains[destinationChain as SupportedChain]?.chainName || 'this address'
        } and ${activeChainInfo.chainName} for ${sliceWord(selectedToken?.symbol)} token.`,
      )
    } else {
      setAddressError(undefined)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeChainInfo,
    selectedAddress,
    chains,
    addressPrefixes,
    skipSupportedDestinationChainsIDs,
    manageChainsStore.chains,
    isIbcUnwindingDisabled,
    selectedToken?.symbol,
    sendActiveChain,
    sendSelectedNetwork,
    isBtcTx,
  ])
}
