import {
  SelectedAddress,
  sliceWord,
  Token,
  useAddressPrefixes,
  useChainsStore,
  useIsSeiEvmChain,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  BTC_CHAINS,
  getBlockChainFromAddress,
  isAptosChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'
import { ManageChainsStore } from 'stores/manage-chains-store'
import { isCompassWallet } from 'utils/isCompassWallet'

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
  const isSeiEvmChain = useIsSeiEvmChain()
  const { chains } = useChainsStore()
  const addressPrefixes = useAddressPrefixes()

  const isBtcTx = BTC_CHAINS.includes(sendActiveChain)
  const isAptosTx = isAptosChain(sendActiveChain)
  const activeChainInfo = chains[sendActiveChain]

  useEffect(() => {
    let destinationChain: string | undefined
    let destChainAddrPrefix: string | undefined
    if (isBtcTx || isAptosTx) {
      return
    }

    if (
      (isSeiEvmChain || chains[sendActiveChain]?.evmOnlyChain) &&
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

    if (isIBC && destinationChain && isCompassWallet()) {
      const compassChains = manageChainsStore.chains.filter((chain) => chain.chainName !== 'cosmos')

      if (!compassChains.find((chain) => chain.chainName === destinationChain)) {
        const destinationChainName = chains[destinationChain as SupportedChain].chainName
        const sourceChainName = activeChainInfo.chainName

        setAddressError(
          `IBC transfers are not supported between ${destinationChainName} and ${sourceChainName}`,
        )
        return
      }
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
    isSeiEvmChain,
    sendActiveChain,
    sendSelectedNetwork,
    associatedSeiAddress,
    isBtcTx,
  ])
}
