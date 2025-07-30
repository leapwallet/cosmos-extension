import {
  getSourceChannelIdUnsafe,
  SelectedAddress,
  sliceWord,
  Token,
  useAddressPrefixes,
  useChainsStore,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  BTC_CHAINS,
  ChainInfo,
  getBlockChainFromAddress,
  isAptosAddress,
  isAptosChain,
  isEthAddress,
  isSolanaAddress,
  isSolanaChain,
  isSuiChain,
  isValidAddress,
  isValidBtcAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store'
import { SHOW_ETH_ADDRESS_CHAINS } from 'config/constants'
import { isValidSuiAddress } from 'pages/send-v2/hooks/useCheckAddressError'
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

export const getDefaultChannelId = async (
  srcChain: SupportedChain,
  destChain: SupportedChain,
  chains: Record<SupportedChain, ChainInfo>,
) => {
  let defaultChannelId: string | undefined
  try {
    const srcChainRegistryPath = chains?.[srcChain]?.chainRegistryPath
    const destChainRegistryPath = chains?.[destChain]?.chainRegistryPath

    if (!srcChainRegistryPath || !destChainRegistryPath) {
      return undefined
    }

    defaultChannelId = await getSourceChannelIdUnsafe(srcChainRegistryPath, destChainRegistryPath)
  } catch (error) {
    defaultChannelId = undefined
  }
  return defaultChannelId
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
    async function checkAddressAndIBCTransfer() {
      if (!selectedAddress?.address || !sendActiveChain || !selectedToken) {
        return
      }

      /**
       * Bitcoin address validation
       */
      if (isBitcoinChain(sendActiveChain)) {
        if (
          !isValidBtcAddress(
            selectedAddress.address,
            sendSelectedNetwork === 'mainnet' ? 'mainnet' : 'testnet',
          )
        ) {
          setAddressError('The entered address is invalid')
        } else {
          setAddressError(undefined)
        }
        return
      }

      /**
       * EVM address validation
       */
      if (activeChainInfo?.evmOnlyChain) {
        if (!isEthAddress(selectedAddress?.ethAddress || selectedAddress.address)) {
          setAddressError('The entered address is invalid')
        } else {
          setAddressError(undefined)
        }
        return
      }

      /**
       * Move/Aptos address validation
       */
      if (isAptosChain(sendActiveChain)) {
        if (!isAptosAddress(selectedAddress.address)) {
          setAddressError('The entered address is invalid')
        } else {
          setAddressError(undefined)
        }
        return
      }

      /**
       * Sui address validation
       */
      if (isSuiChain(sendActiveChain)) {
        if (!isValidSuiAddress(selectedAddress.address)) {
          setAddressError('The entered address is invalid')
        } else {
          setAddressError(undefined)
        }
        return
      }

      /**
       * Solana address validation
       */
      if (isSolanaChain(sendActiveChain)) {
        if (!isSolanaAddress(selectedAddress.address)) {
          setAddressError('The entered address is invalid')
        } else {
          setAddressError(undefined)
        }
        return
      }

      /**
       * Cosmos address validation
       */
      if (
        selectedAddress.address?.startsWith('bc1q') ||
        selectedAddress.address?.startsWith('tb1q') ||
        (!isValidAddress(selectedAddress.address) &&
          (!SHOW_ETH_ADDRESS_CHAINS.includes(sendActiveChain) ||
            !isEthAddress(selectedAddress?.ethAddress || selectedAddress.address)))
      ) {
        setAddressError('The entered address is invalid')
      }

      let destinationChain: string | undefined
      const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address)

      if (!destChainAddrPrefix) {
        setAddressError('The entered address is invalid')
        return
      } else {
        destinationChain = addressPrefixes[destChainAddrPrefix]
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

      const isDestChainReachableViaSkip =
        skipSupportedDestinationChainsIDs?.length > 0 &&
        skipSupportedDestinationChainsIDs.includes(
          chains[destinationChain as SupportedChain]?.chainId,
        )

      const defaultChannelId = await getDefaultChannelId(
        sendActiveChain,
        destinationChain as SupportedChain,
        chains,
      )

      if (!isIbcUnwindingDisabled && !isDestChainReachableViaSkip && !defaultChannelId) {
        setAddressError(
          `IBC transfers are not supported between ${
            chains[destinationChain as SupportedChain]?.chainName || 'this address'
          } and ${activeChainInfo.chainName} for ${sliceWord(selectedToken?.symbol)} token.`,
        )
      } else {
        setAddressError(undefined)
      }
    }

    checkAddressAndIBCTransfer()

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
    selectedToken?.coinMinimalDenom,
    sendActiveChain,
    sendSelectedNetwork,
    isBtcTx,
  ])
}
