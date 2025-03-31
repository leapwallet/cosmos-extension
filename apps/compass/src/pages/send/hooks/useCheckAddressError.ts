/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AddressWarning,
  checkToUsePointerLogic,
  INITIAL_ADDRESS_WARNING,
  isERC20Token,
  Token,
  useActiveWallet,
  useAddress,
  useChainApis,
  useChainsStore,
  useIsSeiEvmChain,
  useSeiLinkedAddressState,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  AccountDetails,
  BTC_CHAINS,
  isAptosChain,
  isEthAddress,
  isValidAddress,
  isValidBtcAddress,
  SeiEvmTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from 'config/constants'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { Wallet } from 'hooks/wallet/useWallet'
import { ReactElement, useCallback, useEffect, useMemo } from 'react'

export type UseCheckAddressErrorParams = {
  setAssociatedSeiAddress: React.Dispatch<React.SetStateAction<string>>
  setAssociated0xAddress: React.Dispatch<React.SetStateAction<string>>

  setAddressError: React.Dispatch<React.SetStateAction<string | undefined>>
  setAddressWarning: React.Dispatch<React.SetStateAction<AddressWarning>>
  setFetchAccountDetailsData: React.Dispatch<React.SetStateAction<AccountDetails | undefined>>
  fetchAccountDetails: (address: string) => Promise<void>

  selectedToken: Token | null
  recipientInputValue: string
  allCW20Denoms: Record<string, any>
  allERC20Denoms: Record<string, any>
  addressWarningElementError: ReactElement
  showNameServiceResults: boolean
  compassEvmToSeiMapping: Record<string, string>
  compassSeiToEvmMapping: Record<string, string>

  sendActiveChain: SupportedChain
  sendSelectedNetwork: 'mainnet' | 'testnet'
  setHasToUsePointerLogic: React.Dispatch<React.SetStateAction<boolean>>
  setPointerAddress: React.Dispatch<React.SetStateAction<string>>
  setHasToUseCw20PointerLogic: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedToken: React.Dispatch<React.SetStateAction<Token | null>>
}

export function useCheckAddressError({
  setAssociated0xAddress,
  setAssociatedSeiAddress,

  setAddressError,
  setAddressWarning,
  setFetchAccountDetailsData,
  fetchAccountDetails,

  selectedToken,
  recipientInputValue,
  allCW20Denoms,
  allERC20Denoms,
  addressWarningElementError,
  showNameServiceResults,
  compassEvmToSeiMapping,
  compassSeiToEvmMapping,

  sendActiveChain,
  sendSelectedNetwork,
  setHasToUsePointerLogic,
  setPointerAddress,
  setHasToUseCw20PointerLogic,
  setSelectedToken,
}: UseCheckAddressErrorParams) {
  const { chains } = useChainsStore()
  const walletAddresses = useGetWalletAddresses()
  const { evmJsonRpc } = useChainApis(sendActiveChain, sendSelectedNetwork)

  const currentWalletAddress = useAddress()
  const activeWallet = useActiveWallet()
  const isSeiEvmChain = useIsSeiEvmChain()
  const isBtcTx = BTC_CHAINS.includes(sendActiveChain)
  const isAptosTx = isAptosChain(sendActiveChain)

  const getWallet = Wallet.useGetWallet()
  const { addressLinkState } = useSeiLinkedAddressState(getWallet)

  const isErc20token = useMemo(() => {
    return isERC20Token(Object.keys(allERC20Denoms), selectedToken?.coinMinimalDenom ?? '')
  }, [allERC20Denoms, selectedToken?.coinMinimalDenom])

  /**
   * Check Has To Use Pointer Logic
   */
  const checkHasToUsePointerLogic = useCallback(async () => {
    setHasToUsePointerLogic(false)

    if (selectedToken?.ibcDenom) {
      return false
    }

    const [hasToUsePointerLogic, pointerAddress, errorMsg] = await checkToUsePointerLogic(
      selectedToken?.coinMinimalDenom ?? '',
      Object.keys(allCW20Denoms),
      compassEvmToSeiMapping,
      compassSeiToEvmMapping,
    )

    if (errorMsg) {
      setAddressError(errorMsg)
      return true
    }

    if (hasToUsePointerLogic) {
      setHasToUsePointerLogic(true)
      setPointerAddress(pointerAddress)
      return true
    }

    return false

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCW20Denoms, selectedToken?.coinMinimalDenom])

  /**
   * Check Has To Use CW-20 Pointer Logic
   */
  const checkHasToUseCw20PointerLogic = useCallback(async () => {
    setHasToUseCw20PointerLogic(false)

    const [hasToUseCw20PointerLogic, cw20PointerAddress] = await checkToUsePointerLogic(
      selectedToken?.coinMinimalDenom ?? '',
      [],
      compassEvmToSeiMapping,
      compassSeiToEvmMapping,
      'CW20',
    )

    if (hasToUseCw20PointerLogic) {
      setHasToUseCw20PointerLogic(true)
      setAddressWarning(INITIAL_ADDRESS_WARNING)
      setFetchAccountDetailsData(undefined)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedToken((prev: any) => {
        return {
          ...(prev ?? {}),
          coinMinimalDenom: cw20PointerAddress,
        }
      })
    } else {
      await fetchAccountDetails(recipientInputValue)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedToken?.coinMinimalDenom,
    compassEvmToSeiMapping,
    compassSeiToEvmMapping,
    recipientInputValue,
  ])

  /**
   * Check Bitcoin Address Error
   */
  const checkBitcoinAddressError = useCallback(() => {
    const network = sendActiveChain === 'bitcoin' ? 'mainnet' : 'testnet'
    const isValidAddress = isValidBtcAddress(recipientInputValue, network)
    if (!isValidAddress) {
      setAddressError('The entered address is invalid')
    } else {
      setAddressError(undefined)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientInputValue, sendActiveChain])

  /**
   * Check Sei Evm Cosmos Address
   */
  const checkSeiEvmCosmosAddress = useCallback(async () => {
    if (
      selectedToken?.isEvm &&
      recipientInputValue.toLowerCase() === walletAddresses[1]?.toLowerCase()
    ) {
      setAssociated0xAddress(walletAddresses[0])
      return
    }

    if (recipientInputValue.length >= 42) {
      if (isErc20token) {
        await checkHasToUseCw20PointerLogic()
      } else if (selectedToken?.isEvm) {
        await fetchAccountDetails(recipientInputValue)
      } else {
        setAddressWarning(INITIAL_ADDRESS_WARNING)
        setFetchAccountDetailsData(undefined)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientInputValue, selectedToken?.isEvm, walletAddresses, isErc20token])

  /**
   * Fill Associated Address
   */
  const fillAssociatedAddress = useCallback(async () => {
    const isAddressLinked = ['done', 'unknown'].includes(addressLinkState)
    const isEvmToken = selectedToken?.isEvm
    const isNativeSeiToken = selectedToken?.coinMinimalDenom === 'usei'

    /**
     * Case: Sending Native EVM Sei.
     * And, the Receiver is a 0x address.
     * Do, a native EVM transaction.
     */
    if (isNativeSeiToken && isEvmToken) {
      return
    }

    /**
     * Case: Sending Native Sei.
     * And, Sender address linked and Receiver is a 0x address.
     * Do, a native EVM transaction.
     */
    if (isAddressLinked && isNativeSeiToken && !isEvmToken) {
      setAssociated0xAddress(recipientInputValue)
      return
    }

    /**
     * Case: Sending Native Cosmos Sei.
     * And, Sender address is not linked and Receiver is a 0x address.
     * Do, transaction is not possible. Sender will have to link address
     */
    if (!isAddressLinked && isNativeSeiToken && !isEvmToken) {
      setAddressWarning({
        type: 'link',
        message: 'To send Sei tokens to EVM address, link your EVM and Sei addresses first.',
      })

      return
    }

    /**
     * To transfer IBC to a 0x address.
     */

    // Sending to own 0x address
    if (
      recipientInputValue.toLowerCase() === walletAddresses[0].toLowerCase() &&
      walletAddresses[1]
    ) {
      setAssociatedSeiAddress(walletAddresses[1])
      return
    }

    try {
      const associatedSeiAddress = await SeiEvmTx.GetSeiAddressFromHex(
        recipientInputValue,
        evmJsonRpc,
      )

      if (!isErc20token && !isNativeSeiToken) {
        setAssociatedSeiAddress(associatedSeiAddress)

        setAddressWarning({
          type: 'erc20',
          message: `Recipient will receive tokens on associated Sei address: ${associatedSeiAddress}`,
        })
      }
    } catch {
      //
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addressLinkState,
    evmJsonRpc,
    recipientInputValue,
    selectedToken?.coinMinimalDenom,
    selectedToken?.isEvm,
    walletAddresses,
    isErc20token,
  ])

  useEffect(() => {
    ;(async function () {
      setAssociatedSeiAddress('')
      setAssociated0xAddress('')

      // Skip address check for Aptos
      if (isAptosTx) {
        return
      }

      // Bitcoin Address Check
      if (isBtcTx && recipientInputValue.length) {
        checkBitcoinAddressError()
        return
      }

      if (!isSeiEvmChain && currentWalletAddress === recipientInputValue) {
        return
      } else if (chains[sendActiveChain]?.evmOnlyChain && recipientInputValue.length) {
        if (!recipientInputValue.toLowerCase().startsWith('0x')) {
          setAddressError('The entered address is invalid')
        }
      } else if (isSeiEvmChain && recipientInputValue.length && selectedToken) {
        if (
          recipientInputValue.toLowerCase().startsWith('0x') &&
          activeWallet?.walletType === WALLETTYPE.LEDGER
        ) {
          setAddressError(SEI_EVM_LEDGER_ERROR_MESSAGE)
          return
        }

        if (addressLinkState === 'loading') {
          setAddressWarning({
            type: 'link',
            message: addressWarningElementError,
          })

          return
        } else {
          setAddressWarning(INITIAL_ADDRESS_WARNING)
        }

        /**
         * LOGIC:
         * If user has pasted a Sei address, then first try doing a Cosmos transaction,
         * and then you can look for an EVM one.
         *
         * And, if user has pasted a 0x address, then first try doing an EVM transction,
         * and then you can look for a Cosmos one.
         */

        // Sei Evm Cosmos Address Check
        if (!recipientInputValue.toLowerCase().startsWith('0x')) {
          await checkSeiEvmCosmosAddress()
          return
        }

        // Sei Evm 0x Address Check
        if (recipientInputValue.toLowerCase().startsWith('0x')) {
          const usePointerLogic = await checkHasToUsePointerLogic()

          if (!usePointerLogic) {
            await fillAssociatedAddress()
          }

          return
        }
      } else if (
        recipientInputValue &&
        !isValidAddress(recipientInputValue) &&
        !isEthAddress(recipientInputValue) &&
        !showNameServiceResults
      ) {
        setAddressError('The entered address is invalid')
      } else {
        setAddressWarning(INITIAL_ADDRESS_WARNING)
        setAddressError(undefined)
      }
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSeiEvmChain,
    addressLinkState,
    currentWalletAddress,
    recipientInputValue,
    selectedToken,
    selectedToken?.coinMinimalDenom,
    selectedToken?.isEvm,
    showNameServiceResults,
    activeWallet?.walletType,
    sendActiveChain,
    sendSelectedNetwork,
    isAptosTx,
    isBtcTx,
    chains,
  ])
}
