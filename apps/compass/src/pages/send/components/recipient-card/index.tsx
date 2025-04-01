import {
  SelectedAddress,
  useActiveWallet,
  useAddress,
  useAddressPrefixes,
  useChainsStore,
  useFeatureFlags,
  useIsSeiEvmChain,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  BTC_CHAINS,
  getBech32Address,
  getBlockChainFromAddress,
  isAptosChain,
  isValidBtcAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  CompassSeiTokensAssociationStore,
  RootCW20DenomsStore,
  RootERC20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import {
  Asset,
  SkipDestinationChain,
  useSkipDestinationChains,
  useSkipSupportedChains,
} from '@leapwallet/elements-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import {
  AddressBook as AddressBookIcon,
  UserPlus,
  Wallet as WalletIcon,
} from '@phosphor-icons/react'
import { bech32 } from 'bech32'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { motion } from 'framer-motion'
import { useContactsSearch } from 'hooks/useContacts'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { manageChainsStore } from 'stores/manage-chains-store'
import { Colors } from 'theme/colors'
import { AddressBook } from 'utils/addressbook'
import { UserClipboard } from 'utils/clipboard'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { sliceAddress } from 'utils/strings'

import { useCheckAddressError } from '../../hooks/useCheckAddressError'
import { useCheckIbcTransfer } from '../../hooks/useCheckIbcTransfer'
import { useFillAddressWarning } from '../../hooks/useFillAddressWarning'
import { NameServiceMatchList } from './match-lists'
import SaveAddressSheet from './save-address-sheet'
import { SecondaryActionButton } from './secondary-action-button'
import { DestinationType, SelectDestinationSheet } from './select-destination-sheet'
import { SelectedAddressPreview } from './selected-address-preview'

type RecipientCardProps = {
  themeColor: string
  rootERC20DenomsStore: RootERC20DenomsStore
  rootCW20DenomsStore: RootCW20DenomsStore
  compassSeiTokensAssociationsStore: CompassSeiTokensAssociationStore
}

const nameServiceMatcher = /^[a-zA-Z0-9_-]+\.[a-z]+$/

export const RecipientCard = observer(
  ({
    rootERC20DenomsStore,
    rootCW20DenomsStore,
    compassSeiTokensAssociationsStore,
  }: RecipientCardProps) => {
    /**
     * Local States
     */
    const recipient = useQuery().get('recipient') ?? undefined
    const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState<boolean>(false)
    const [recipientInputValue, setRecipientInputValue] = useState<string>(recipient ?? '')

    const [isDestinationSheetVisible, setIsDestinationSheetVisible] =
      useState<DestinationType | null>(null)

    /**
     * Global Hooks
     */

    const {
      ethAddress,
      selectedAddress,
      setSelectedAddress,
      addressError,
      setAddressError,
      isIBCTransfer,
      setMemo,
      setCustomIbcChannelId,
      setEthAddress,
      selectedToken,
      addressWarning,
      setAddressWarning,
      isIbcUnwindingDisabled,
      fetchAccountDetails,
      fetchAccountDetailsData,
      fetchAccountDetailsStatus,
      setFetchAccountDetailsData,
      setAssociatedSeiAddress,
      sendActiveChain,
      sendSelectedNetwork,
      associatedSeiAddress,
      setAssociated0xAddress,
      setHasToUsePointerLogic,
      setPointerAddress,
      setSelectedToken,
      setHasToUseCw20PointerLogic,
    } = useSendContext()

    const { chains } = useChainsStore()
    const { theme } = useTheme()
    const currentWalletAddress = useAddress()
    const addressPrefixes = useAddressPrefixes()

    const defaultTokenLogo = useDefaultTokenLogo()
    const activeWallet = useActiveWallet()
    const isSeiEvmChain = useIsSeiEvmChain()

    const { data: elementsChains } = useSkipSupportedChains({ chainTypes: ['cosmos'] })
    const { data: featureFlags } = useFeatureFlags()

    /**
     * Local Variables
     */

    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms
    const allCW20Denoms = rootCW20DenomsStore.allCW20Denoms

    const activeChainInfo = chains[sendActiveChain]
    const isDark = theme === ThemeName.DARK
    const ownWalletMatch = selectedAddress?.selectionType === 'currentWallet'
    const isBtcTx = BTC_CHAINS.includes(sendActiveChain)
    const isAptosTx = isAptosChain(sendActiveChain)

    const asset: Asset = {
      denom: selectedToken?.ibcDenom || selectedToken?.coinMinimalDenom || '',
      symbol: selectedToken?.symbol || '',
      logoUri: selectedToken?.img || '',
      decimals: selectedToken?.coinDecimals || 0,
      originDenom: selectedToken?.coinMinimalDenom || '',
      denomTracePath: selectedToken?.ibcChainInfo
        ? `transfer/${selectedToken.ibcChainInfo?.channelId}`
        : '',
    }

    const sourceChain = elementsChains?.find((chain) => chain.chainId === activeChainInfo.chainId)
    const { data: skipSupportedDestinationChains } =
      featureFlags?.ibc?.extension !== 'disabled'
        ? useSkipDestinationChains(asset, sourceChain, sendSelectedNetwork === 'mainnet')
        : { data: null }

    const isSavedContactSelected =
      selectedAddress?.address === recipientInputValue && selectedAddress?.selectionType === 'saved'

    /**
     * Memoized Values
     */

    const recipientValueToShow = useMemo(() => {
      if (ethAddress) {
        return ethAddress
      }

      return recipientInputValue
    }, [ethAddress, recipientInputValue])

    const contactsToShow = useContactsSearch(recipientValueToShow)
    const existingContactMatch = AddressBook.useGetContact(recipientValueToShow)

    const action = recipientInputValue.length > 0 ? 'clear' : 'paste'

    const inputButtonIcon = useMemo(() => {
      if (recipientInputValue.length > 0) {
        return Images.Misc.CrossFilled
      }
      return undefined
    }, [recipientInputValue])

    const showNameServiceResults = useMemo(() => {
      const allowedTopLevelDomains = [
        ...Object.keys(addressPrefixes), // for ibcdomains, icns, stargazenames
        'arch', // for archId
        'sol', // for injective .sol domains by SNS
        ...['sei', 'pp'], // for degeNS
        'core', // for bdd
      ]
      // ex: leap.arch --> name = leap, domain = arch
      const [, domain] = recipientInputValue.split('.')
      const isValidDomain = allowedTopLevelDomains.indexOf(domain) !== -1
      return nameServiceMatcher.test(recipientInputValue) && isValidDomain
    }, [recipientInputValue, addressPrefixes])

    const preview = useMemo(() => {
      if (selectedAddress) {
        return (
          <SelectedAddressPreview
            selectedAddress={selectedAddress}
            showEditMenu={
              selectedAddress.address === existingContactMatch?.address &&
              selectedAddress.ethAddress === existingContactMatch?.ethAddress
            }
            onDelete={() => {
              setSelectedAddress(null)
              setRecipientInputValue('')
              setEthAddress('')
            }}
          />
        )
      }

      if (recipientValueToShow.length > 0) {
        try {
          bech32.decode(recipientValueToShow)
          return (
            <Text size='md' className='text-gray-800 dark:text-gray-200'>
              {sliceAddress(recipientValueToShow)}
            </Text>
          )
        } catch (err) {
          return undefined
        }
      }

      return undefined
    }, [
      existingContactMatch?.address,
      existingContactMatch?.ethAddress,
      recipientValueToShow,
      selectedAddress,
      setEthAddress,
      setSelectedAddress,
    ])

    const skipSupportedDestinationChainsIDs: string[] = useMemo(() => {
      return (
        (
          skipSupportedDestinationChains as Array<
            Extract<SkipDestinationChain, { chainType: 'cosmos' }>
          >
        )
          ?.filter((chain) => {
            if (chain.chainType !== 'cosmos') {
              return false
            }
            if (
              (activeWallet?.walletType === WALLETTYPE.LEDGER &&
                !isLedgerEnabled(
                  chain.key as SupportedChain,
                  chain.coinType,
                  Object.values(chains),
                )) ||
              !activeWallet?.addresses[chain.key as SupportedChain]
            ) {
              return false
            } else {
              return true
            }
          })
          .map((chain) => {
            return chain.chainId
          }) || []
      )
    }, [skipSupportedDestinationChains, activeWallet?.walletType, activeWallet?.addresses, chains])

    const destChainInfo = useMemo(() => {
      if (!selectedAddress?.address) {
        return null
      }

      const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address)
      if (!destChainAddrPrefix) {
        return null
      }

      const destinationChainKey = addressPrefixes[destChainAddrPrefix] as SupportedChain | undefined
      if (!destinationChainKey) {
        return null
      }

      // we are sure that the key is there in the chains object due to previous checks
      return chains[destinationChainKey]
    }, [addressPrefixes, chains, selectedAddress?.address])

    /**
     * --------
     */

    const showContactsList = recipientInputValue.trim().length > 0 && contactsToShow.length > 0

    const showAddToContacts =
      !showContactsList &&
      recipientInputValue.length > 0 &&
      !isSavedContactSelected &&
      !existingContactMatch &&
      recipientInputValue !== currentWalletAddress &&
      !ownWalletMatch &&
      !showNameServiceResults &&
      !addressError?.includes('The entered address is invalid')

    const showContactsButton =
      !isSavedContactSelected &&
      !showAddToContacts &&
      !existingContactMatch &&
      !selectedAddress &&
      !showNameServiceResults

    const showMyWalletButton =
      !isSavedContactSelected &&
      !showAddToContacts &&
      !existingContactMatch &&
      !selectedAddress &&
      !showNameServiceResults &&
      sendSelectedNetwork === 'mainnet' &&
      !isCompassWallet()

    const showSecondaryActions = showContactsButton || showMyWalletButton || showAddToContacts

    /**
     * Memoized Callbacks
     */

    const fillRecipientInputValue = useCallback(
      (value: string) => {
        if (
          (isSeiEvmChain || chains[sendActiveChain]?.evmOnlyChain) &&
          value.toLowerCase().startsWith('0x')
        ) {
          setAddressError(undefined)
          setEthAddress(value)
          setRecipientInputValue(value)
        } else if (
          Number(activeChainInfo.bip44.coinType) === 60 &&
          value.toLowerCase().startsWith('0x') &&
          activeChainInfo.key !== 'injective'
        ) {
          try {
            setAddressError(undefined)
            const bech32Address = getBech32Address(activeChainInfo.addressPrefix, value)
            setEthAddress(value)
            setRecipientInputValue(bech32Address)
            return
          } catch (e) {
            setAddressError('The entered address is invalid')
          }
        }

        setEthAddress('')
        setRecipientInputValue(value)
      },
      [
        activeChainInfo.addressPrefix,
        activeChainInfo.bip44.coinType,
        activeChainInfo.key,
        chains,
        isSeiEvmChain,
        sendActiveChain,
        setAddressError,
        setEthAddress,
      ],
    )

    const handleOnChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim()
        fillRecipientInputValue(value)
      },
      [fillRecipientInputValue],
    )

    const actionHandler = useCallback(
      (e: React.MouseEvent, _action: string) => {
        switch (_action) {
          case 'paste':
            UserClipboard.pasteText().then((text) => {
              if (!text) return
              setRecipientInputValue(text.trim())
            })
            break
          case 'clear':
            setEthAddress('')
            setRecipientInputValue('')
            setSelectedAddress(null)
            setMemo('')
            break
          default:
            break
        }
      },

      // eslint-disable-next-line react-hooks/exhaustive-deps
      [fillRecipientInputValue, setEthAddress, setMemo, setSelectedAddress],
    )

    const handleContactSelect = useCallback(
      (s: SelectedAddress) => {
        setSelectedAddress(s)
        setEthAddress(s.ethAddress ?? '')
        setRecipientInputValue(s.address ?? '')
        if (isDestinationSheetVisible) {
          setIsDestinationSheetVisible(null)
        }
      },
      [isDestinationSheetVisible, setEthAddress, setSelectedAddress],
    )

    const handleWalletSelect = useCallback(
      (s: SelectedAddress) => {
        setAddressError(undefined)
        setRecipientInputValue(s.address ?? '')
        setSelectedAddress(s)
        setIsDestinationSheetVisible(null)
      },
      [setAddressError, setSelectedAddress],
    )

    const handleAddContact = useCallback(() => {
      try {
        if (
          isAptosTx ||
          ((isSeiEvmChain || chains[sendActiveChain]?.evmOnlyChain) &&
            recipientInputValue.toLowerCase().startsWith('0x'))
        ) {
          setIsAddContactSheetVisible(true)
          return
        }

        const prefix = getBlockChainFromAddress(recipientInputValue)
        const chainName = addressPrefixes[prefix ?? '']
        if (!chainName) {
          setAddressError('Unsupported Chain')
          return
        }
        setIsAddContactSheetVisible(true)
      } catch (err) {
        setAddressError('The entered address is invalid')
      }
    }, [
      addressPrefixes,
      chains,
      isAptosTx,
      isSeiEvmChain,
      recipientInputValue,
      sendActiveChain,
      setAddressError,
    ])

    /**
     * Effect Hooks
     */

    useFillAddressWarning({
      fetchAccountDetailsData,
      fetchAccountDetailsStatus,

      addressWarningElementError: (
        <>
          Recipient will receive this on address:{' '}
          <LoaderAnimation color={Colors.white100} className='w-[20px] h-[20px]' />
        </>
      ),
      setAddressWarning,
    })

    useCheckAddressError({
      setAssociatedSeiAddress,
      setAssociated0xAddress,

      setAddressError,
      setAddressWarning,
      setFetchAccountDetailsData,
      fetchAccountDetails,

      selectedToken,
      recipientInputValue,
      allCW20Denoms,
      allERC20Denoms,
      addressWarningElementError: (
        <>
          Checking the Ox and Sei address link status{' '}
          <LoaderAnimation color={Colors.white100} className='w-[20px] h-[20px]' />
        </>
      ),
      showNameServiceResults,
      compassEvmToSeiMapping: compassSeiTokensAssociationsStore.compassEvmToSeiMapping,
      compassSeiToEvmMapping: compassSeiTokensAssociationsStore.compassSeiToEvmMapping,

      sendActiveChain,
      sendSelectedNetwork,
      setHasToUsePointerLogic,
      setPointerAddress,
      setHasToUseCw20PointerLogic,
      setSelectedToken,
    })

    useEffect(() => {
      // Autofill of recipientInputValue if passed in information
      if (showNameServiceResults) {
        setAddressError(undefined)
        return
      }
      if (selectedAddress?.information?.autofill) {
        setRecipientInputValue(selectedAddress?.address || '')
        return
      }
      const cleanInputValue = recipientInputValue?.trim()

      if (recipientInputValue === selectedAddress?.address) {
        const isEvmChain = isSeiEvmChain || chains[sendActiveChain]?.evmOnlyChain
        const isEvmAddress = cleanInputValue?.toLowerCase()?.startsWith('0x')
        const isSameChain = sendActiveChain === selectedAddress?.chainName

        if (isEvmChain && isEvmAddress) {
          if (isSameChain || selectedAddress?.selectionType === 'saved') {
            return
          }
        } else {
          return
        }
      }

      if (selectedAddress && cleanInputValue !== selectedAddress.address) {
        setSelectedAddress(null)
        return
      }

      try {
        if (cleanInputValue.length === 0) {
          setAddressError(undefined)
          return
        }

        if (
          isAptosTx ||
          ((isSeiEvmChain || chains[sendActiveChain]?.evmOnlyChain) &&
            cleanInputValue.toLowerCase().startsWith('0x'))
        ) {
          const img = activeChainInfo.chainSymbolImageUrl ?? ''

          setSelectedAddress({
            ethAddress: cleanInputValue,
            address: cleanInputValue,
            name: sliceAddress(cleanInputValue),
            avatarIcon: activeChainInfo.chainSymbolImageUrl ?? '',
            emoji: undefined,
            chainIcon: img ?? '',
            chainName: activeChainInfo.key,
            selectionType: 'notSaved',
          })

          return
        }

        if (
          isBtcTx &&
          !isValidBtcAddress(cleanInputValue, sendActiveChain === 'bitcoin' ? 'mainnet' : 'testnet')
        ) {
          return
        }

        const { prefix } = isBtcTx ? { prefix: '' } : bech32.decode(cleanInputValue)
        let _chain = addressPrefixes[prefix] as SupportedChain

        if (sendActiveChain === 'bitcoin') {
          _chain = 'bitcoin'
        }

        if (sendActiveChain === 'bitcoinSignet') {
          _chain = 'bitcoinSignet'
        }

        const img = chains[_chain]?.chainSymbolImageUrl ?? defaultTokenLogo

        setSelectedAddress({
          ethAddress,
          address: cleanInputValue,
          name: sliceAddress(cleanInputValue),
          avatarIcon: img ?? '',
          emoji: undefined,
          chainIcon: img ?? '',
          chainName: _chain,
          selectionType: 'notSaved',
        })
      } catch (err) {
        if (!(err as Error)?.message?.includes('too short')) {
          setAddressError('Invalid Address')
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      addressPrefixes,
      chains,
      currentWalletAddress,
      recipientInputValue,
      selectedAddress,
      setSelectedAddress,
      isSeiEvmChain,
      showNameServiceResults,
      sendActiveChain,
    ])

    useEffect(() => {
      if (existingContactMatch && selectedAddress) {
        const shouldUpdate =
          existingContactMatch.ethAddress !== selectedAddress?.ethAddress ||
          existingContactMatch.address !== selectedAddress?.address ||
          existingContactMatch.name !== selectedAddress?.name ||
          existingContactMatch.emoji !== selectedAddress?.emoji ||
          existingContactMatch.blockchain !== selectedAddress?.chainName

        if (shouldUpdate) {
          const img =
            chains[existingContactMatch.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo
          setMemo(existingContactMatch.memo ?? '')

          setSelectedAddress({
            ethAddress: existingContactMatch?.ethAddress,
            address: existingContactMatch.address,
            name: existingContactMatch.name,
            avatarIcon: undefined,
            emoji: existingContactMatch.emoji,
            chainIcon: img ?? '',
            chainName: existingContactMatch.blockchain,
            selectionType: 'saved',
          })
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      chains,
      existingContactMatch,
      recipientInputValue,
      selectedAddress,
      setMemo,
      setSelectedAddress,
    ])

    useCheckIbcTransfer({
      sendActiveChain,
      selectedAddress,

      associatedSeiAddress,
      sendSelectedNetwork,
      isIbcUnwindingDisabled,
      skipSupportedDestinationChainsIDs,
      selectedToken,

      setAddressError,
      manageChainsStore,
    })

    useEffect(() => {
      if (selectedAddress?.chainName) {
        setCustomIbcChannelId(undefined)
      }
    }, [selectedAddress?.chainName, setCustomIbcChannelId])

    const isNotIBCError = addressError
      ? !addressError.includes('IBC transfers are not supported')
      : false
    /**
     * Return Component
     */

    return (
      <div>
        <motion.div className='p-4 rounded-2xl bg-white-100 dark:bg-gray-950'>
          <ActionInputWithPreview
            autoFocus
            invalid={!!isNotIBCError}
            warning={!!addressWarning.message}
            action={action}
            buttonText={action}
            icon={inputButtonIcon}
            value={recipientValueToShow}
            onAction={actionHandler}
            onChange={handleOnChange}
            placeholder='Enter recipient address or contact'
            autoComplete='off'
            spellCheck='false'
            className={`border-transparent rounded-xl h-12 pl-4 py-[2px] text-md font-medium placeholder:text-gray-600 dark:placeholder:text-gray-400 text-black-100 dark:text-white-100 bg-gray-50 dark:bg-gray-900 ${
              !isNotIBCError && !addressWarning.message && 'focus-within:!border-green-600'
            }`}
            preview={preview}
          />

          {isNotIBCError ? (
            <Text
              size='xs'
              color='text-red-300'
              className='mt-2 ml-1 font-bold'
              data-testing-id='send-recipient-address-error-ele'
            >
              {addressError}
            </Text>
          ) : null}

          {addressWarning.message ? (
            <Text
              size='xs'
              color='text-yellow-600'
              className='mt-2 ml-1 font-bold'
              data-testing-id='send-recipient-address-error-ele'
            >
              {addressWarning.message}
            </Text>
          ) : null}

          <div className='flex w-full items-center justify-between mt-3'>
            <div className='flex flex-wrap gap-2 w-full'>
              {showSecondaryActions ? (
                <>
                  {showContactsButton ? (
                    <SecondaryActionButton
                      leftIcon={
                        <AddressBookIcon size={12} className='text-gray-800 dark:text-gray-200' />
                      }
                      onClick={() => setIsDestinationSheetVisible('My Contacts')}
                      actionLabel='Open Contacts Sheet'
                    >
                      <Text
                        size='xs'
                        className='text-gray-800 dark:text-gray-200 whitespace-nowrap font-medium'
                      >
                        Contacts
                      </Text>
                    </SecondaryActionButton>
                  ) : null}

                  {showMyWalletButton ? (
                    <SecondaryActionButton
                      leftIcon={
                        <WalletIcon size={12} className='text-gray-800 dark:text-gray-200' />
                      }
                      onClick={() => setIsDestinationSheetVisible('My Wallets')}
                      actionLabel='Show My Wallets on Other Chains'
                      iconClassName='!text-sm !text-gray-800 dark:!text-gray-200'
                    >
                      <Text
                        size='xs'
                        className='text-gray-800 dark:text-gray-200 whitespace-nowrap font-medium'
                      >
                        My Wallets
                      </Text>
                    </SecondaryActionButton>
                  ) : null}

                  {showAddToContacts ? (
                    <SecondaryActionButton
                      leftIcon={<UserPlus size={12} className='text-gray-800 dark:text-gray-200' />}
                      onClick={handleAddContact}
                      actionLabel='Add Contact to Address Book'
                    >
                      <Text
                        size='xs'
                        className='text-gray-800 dark:text-gray-200 whitespace-nowrap font-medium'
                      >
                        Add Contact
                      </Text>
                    </SecondaryActionButton>
                  ) : null}
                </>
              ) : null}

              {isIBCTransfer &&
              !isCompassWallet() &&
              sendSelectedNetwork === 'mainnet' &&
              destChainInfo ? (
                <div className='flex flex-1 justify-end'>
                  <div className='flex w-fit gap-1 py-1 px-[10px] bg-[#F7EDFC] dark:bg-[#290939] rounded-3xl h-8 items-center'>
                    <Images.Misc.IbcProtocol color={isDark ? '#E0B9F4' : '#A22CDD'} />
                    <Text
                      size='xs'
                      color='text-[#A22CDD] dark:text-[#E0B9F4]'
                      className='whitespace-nowrap font-medium'
                    >
                      IBC Transfer
                    </Text>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {showNameServiceResults ? (
            <NameServiceMatchList
              address={recipientInputValue}
              handleContactSelect={handleContactSelect}
            />
          ) : null}

          <SelectDestinationSheet
            isOpenType={isDestinationSheetVisible}
            setSelectedAddress={handleWalletSelect}
            handleContactSelect={handleContactSelect}
            onClose={() => setIsDestinationSheetVisible(null)}
            skipSupportedDestinationChainsIDs={skipSupportedDestinationChainsIDs}
          />

          <SaveAddressSheet
            isOpen={isAddContactSheetVisible}
            onSave={handleContactSelect}
            onClose={() => setIsAddContactSheetVisible(false)}
            address={recipientInputValue}
            ethAddress={ethAddress}
            sendActiveChain={sendActiveChain}
          />
        </motion.div>
      </div>
    )
  },
)
