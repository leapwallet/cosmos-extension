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
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'
import { ManageChainsStore } from 'stores/manage-chains-store'

export type UseCheckIbcTransferParams = {
  sendActiveChain: SupportedChain
  selectedAddress: SelectedAddress | null

  associatedSeiAddress: string
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

  associatedSeiAddress,
  sendSelectedNetwork,
  isIbcUnwindingDisabled,
  skipSupportedDestinationChainsIDs,
  selectedToken,

  setAddressError,
  manageChainsStore,
}: UseCheckIbcTransferParams) {
  const { chains } = useChainsStore()
  const addressPrefixes = useAddressPrefixes()

  const isBtcTx = BTC_CHAINS.includes(sendActiveChain)
  const isAptosTx = isAptosChain(sendActiveChain)
  const isSolanaTx = isSolanaChain(sendActiveChain)
  const isSuiTx = isSuiChain(sendActiveChain)
  const activeChainInfo = chains[sendActiveChain]

  useEffect(() => {
    let destinationChain: string | undefined
    let destChainAddrPrefix: string | undefined
    if (isBtcTx || isAptosTx || isSolanaTx || isSuiTx) {
      return
    }

    if (
      chains[sendActiveChain]?.evmOnlyChain &&
      (selectedAddress?.address?.startsWith('0x') || associatedSeiAddress === 'loading')
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
    associatedSeiAddress,
    isBtcTx,
  ])
}
