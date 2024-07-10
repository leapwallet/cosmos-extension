import {
  getSeiEvmInfo,
  INITIAL_ADDRESS_WARNING,
  SeiEvmInfoEnum,
  SelectedAddress,
  sliceWord,
  useActiveWallet,
  useAddress,
  useAddressPrefixes,
  useChainsStore,
  useFeatureFlags,
  useIsERC20Token,
  useIsSeiEvmChain,
  useSeiLinkedAddressState,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getBech32Address,
  getBlockChainFromAddress,
  getSeiEvmAddressToShow,
  isValidAddress,
  SeiEvmTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Asset, useChains, useSkipDestinationChains } from '@leapwallet/elements-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import bech32 from 'bech32'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from 'config/constants'
import { motion } from 'framer-motion'
import { useManageChainData } from 'hooks/settings/useManageChains'
import { useContactsSearch } from 'hooks/useContacts'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { AddressBook } from 'utils/addressbook'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { sliceAddress } from 'utils/strings'

import { NameServiceMatchList } from './match-lists'
import SaveAddressSheet from './save-address-sheet'
import { SecondaryActionButton } from './secondary-action-button'
import { DestinationType, SelectDestinationSheet } from './select-destination-sheet'
import { SelectedAddressPreview } from './selected-address-preview'

type RecipientCardProps = {
  themeColor: string
}

const nameServiceMatcher = /^[a-zA-Z0-9_]+\.[a-z]+$/

export const RecipientCard: React.FC<RecipientCardProps> = ({ themeColor }) => {
  const isERC20Token = useIsERC20Token()

  const [isDestinationSheetVisible, setIsDestinationSheetVisible] =
    useState<DestinationType | null>(null)
  const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState<boolean>(false)
  const [recipientInputValue, setRecipientInputValue] = useState<string>('')

  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK

  const getWallet = Wallet.useGetWallet()
  const { addressLinkState } = useSeiLinkedAddressState(getWallet)
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
  } = useSendContext()

  const { chains } = useChainsStore()
  const [manageChains] = useManageChainData()
  const currentWalletAddress = useAddress()
  const addressPrefixes = useAddressPrefixes()
  const activeChainInfo = chains[sendActiveChain]
  const { data: elementsChains } = useChains()
  const { data: featureFlags } = useFeatureFlags()

  const recipientValueToShow = useMemo(() => {
    if (ethAddress) {
      return ethAddress
    }

    return recipientInputValue
  }, [ethAddress, recipientInputValue])

  const contactsToShow = useContactsSearch(recipientValueToShow)
  const existingContactMatch = AddressBook.useGetContact(recipientValueToShow)
  const ownWalletMatch = selectedAddress?.selectionType === 'currentWallet'
  const defaultTokenLogo = useDefaultTokenLogo()
  const activeWallet = useActiveWallet()
  const isSeiEvmChain = useIsSeiEvmChain()

  const fillRecipientInputValue = useCallback(
    (value: string) => {
      if (isSeiEvmChain && value.toLowerCase().startsWith('0x')) {
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
      isSeiEvmChain,
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
      setRecipientInputValue(s.address ?? '')
      setSelectedAddress(s)
      setIsDestinationSheetVisible(null)
    },
    [setRecipientInputValue, setSelectedAddress],
  )

  const handleAddContact = useCallback(() => {
    try {
      const { prefix } = bech32.decode(recipientInputValue)
      const chainName = addressPrefixes[prefix]
      if (!chainName) {
        setAddressError('Unsupported Chain')
        return
      }
      setIsAddContactSheetVisible(true)
    } catch (err) {
      setAddressError('The entered address is invalid')
    }
  }, [addressPrefixes, recipientInputValue, setAddressError])

  const action = useMemo(() => {
    if (recipientInputValue.length > 0) {
      return 'clear'
    }
    return ''
  }, [recipientInputValue])

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

  const skipSupportedDestinationChainsIDs: string[] = useMemo(() => {
    return (
      skipSupportedDestinationChains
        ?.filter((chain) => {
          if (
            (activeWallet?.walletType === WALLETTYPE.LEDGER &&
              !isLedgerEnabled(chain.key as SupportedChain, chain.coinType)) ||
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
  }, [skipSupportedDestinationChains, activeWallet])

  const showContactsList = recipientInputValue.trim().length > 0 && contactsToShow.length > 0
  const isSavedContactSelected =
    selectedAddress?.address === recipientInputValue && selectedAddress?.selectionType === 'saved'

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

  useEffect(() => {
    switch (fetchAccountDetailsStatus) {
      case 'loading': {
        setAddressWarning({
          type: 'erc20',
          message: (
            <>
              Recipient will receive this on address:{' '}
              <LoaderAnimation color={Colors.white100} className='w-[20px] h-[20px]' />
            </>
          ),
        })

        break
      }

      case 'success': {
        if (fetchAccountDetailsData?.pubKey.key) {
          const recipient0xAddress = getSeiEvmAddressToShow(fetchAccountDetailsData.pubKey.key)
          if (recipient0xAddress.toLowerCase().startsWith('0x')) {
            setAddressWarning({
              type: 'erc20',
              message: `Recipient will receive the ERC-20 token on associated EVM address: ${recipient0xAddress}`,
            })
          } else {
            setAddressWarning({
              type: 'erc20',
              message: 'You can only transfer ERC-20 tokens to an EVM address.',
            })
          }
        }

        break
      }

      case 'error': {
        setAddressWarning({
          type: 'erc20',
          message: 'You can only transfer ERC-20 tokens to an EVM address.',
        })

        break
      }

      default: {
        setAddressWarning(INITIAL_ADDRESS_WARNING)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAccountDetailsData?.pubKey.key, fetchAccountDetailsStatus])

  useEffect(() => {
    ;(async function () {
      setAssociatedSeiAddress('')

      if (currentWalletAddress === recipientInputValue) {
        return
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
            message: (
              <>
                Checking the Ox and Sei address link status{' '}
                <LoaderAnimation color={Colors.white100} className='w-[20px] h-[20px]' />
              </>
            ),
          })

          return
        } else {
          setAddressWarning(INITIAL_ADDRESS_WARNING)
        }

        if (!recipientInputValue.toLowerCase().startsWith('0x')) {
          if (selectedToken.isEvm) {
            setAddressWarning({
              type: 'link',
              message:
                'To send Sei EVM tokens to Sei address, link your EVM and Sei addresses first.',
            })
          } else if (isERC20Token(selectedToken) && recipientInputValue.length >= 42) {
            await fetchAccountDetails(recipientInputValue)
          } else {
            setAddressWarning(INITIAL_ADDRESS_WARNING)
            setFetchAccountDetailsData(undefined)
          }

          return
        }

        if (recipientInputValue.toLowerCase().startsWith('0x')) {
          let associatedSeiAddress = ''
          setAssociatedSeiAddress('loading')

          try {
            const rpcUrl = (await getSeiEvmInfo({
              infoType: SeiEvmInfoEnum.EVM_RPC_URL,
              activeChain: sendActiveChain,
              activeNetwork: sendSelectedNetwork,
            })) as string

            associatedSeiAddress = await SeiEvmTx.GetSeiAddressFromHex(recipientInputValue, rpcUrl)
          } catch {
            associatedSeiAddress = ''
          }

          if (
            !selectedToken.isEvm &&
            selectedToken.coinMinimalDenom === 'usei' &&
            !['done', 'unknown'].includes(addressLinkState)
          ) {
            if (associatedSeiAddress) {
              setAssociatedSeiAddress(associatedSeiAddress)

              setAddressWarning({
                type: 'erc20',
                message: `Recipient will receive the token on associated Sei address: ${associatedSeiAddress}`,
              })
            } else {
              setAssociatedSeiAddress('')

              setAddressWarning({
                type: 'link',
                message:
                  'To send Sei tokens to EVM address, link your EVM and Sei addresses first.',
              })
            }
          } else if (
            !isERC20Token(selectedToken) &&
            selectedToken.coinMinimalDenom !== 'usei' &&
            associatedSeiAddress
          ) {
            setAssociatedSeiAddress(associatedSeiAddress)

            setAddressWarning({
              type: 'erc20',
              message: `Recipient will receive the token on associated Sei address: ${associatedSeiAddress}`,
            })
          } else {
            setAssociatedSeiAddress('')
          }

          return
        }
      } else if (
        recipientInputValue &&
        !isValidAddress(recipientInputValue) &&
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
    isERC20Token,
    recipientInputValue,
    selectedToken,
    selectedToken?.coinMinimalDenom,
    selectedToken?.isEvm,
    showNameServiceResults,
    activeWallet?.walletType,
    sendActiveChain,
    sendSelectedNetwork,
  ])

  useEffect(() => {
    // Autofill of recipientInputValue if passed in information
    if (selectedAddress?.information?.autofill) {
      setRecipientInputValue(selectedAddress?.address || '')
      return
    }

    if (recipientInputValue === selectedAddress?.address) {
      return
    }

    const cleanInputValue = recipientInputValue.trim()
    if (selectedAddress && cleanInputValue !== selectedAddress.address) {
      setSelectedAddress(null)
      return
    }

    try {
      if (isSeiEvmChain && cleanInputValue.toLowerCase().startsWith('0x')) {
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
      const { prefix } = bech32.decode(cleanInputValue)
      const _chain = addressPrefixes[prefix] as SupportedChain
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
        const img = chains[existingContactMatch.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo
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

  useEffect(() => {
    let destinationChain: string | undefined
    if (
      isSeiEvmChain &&
      (selectedAddress?.address?.startsWith('0x') || associatedSeiAddress === 'loading')
    ) {
      return
    }
    if (selectedAddress?.address) {
      const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address)

      if (!destChainAddrPrefix) {
        setAddressError('The entered address is invalid')
        return
      } else {
        destinationChain = addressPrefixes[destChainAddrPrefix]
      }
    } else {
      return
    }

    const isIBC = destinationChain !== sendActiveChain

    if (!isIBC) {
      return
    }

    // ibc not supported on testnet
    if (isIBC && sendSelectedNetwork === 'testnet') {
      setAddressError(`IBC transfers are not supported on testnet.`)
      return
    }

    if (isIBC && destinationChain && isCompassWallet()) {
      const compassChains = manageChains.filter((chain) => chain.chainName !== 'cosmos')

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
  }, [
    activeChainInfo,
    selectedAddress,
    setAddressError,
    currentWalletAddress,
    chains,
    addressPrefixes,
    skipSupportedDestinationChainsIDs,
    manageChains,
    isIbcUnwindingDisabled,
    selectedToken?.symbol,
    isSeiEvmChain,
    sendActiveChain,
    sendSelectedNetwork,
    associatedSeiAddress,
  ])

  useEffect(() => {
    if (selectedAddress?.chainName) {
      setCustomIbcChannelId(undefined)
    }
  }, [selectedAddress?.chainName, setCustomIbcChannelId])

  const isNotIBCError = addressError
    ? !addressError.includes('IBC transfers are not supported')
    : false

  return (
    <div>
      <motion.div className='p-4 rounded-2xl bg-white-100 dark:bg-gray-950'>
        <ActionInputWithPreview
          invalid={!!isNotIBCError}
          warning={!!addressWarning.message}
          action={action}
          buttonText={action}
          buttonTextColor={themeColor}
          icon={inputButtonIcon}
          value={recipientValueToShow}
          onAction={actionHandler}
          onChange={handleOnChange}
          placeholder='Enter recipient address or contact'
          autoComplete='off'
          spellCheck='false'
          className={`rounded-xl h-12 pl-4 py-[2px] text-md font-medium placeholder:text-gray-600 dark:placeholder:text-gray-400 text-black-100 dark:text-white-100 bg-gray-50 dark:bg-gray-900 border ${
            !isNotIBCError &&
            !addressWarning.message &&
            '!border-transparent focus-within:!border-green-600'
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
          <div className='flex flex-wrap space-x-1 gap-2 w-full'>
            {showSecondaryActions ? (
              <>
                {showContactsButton ? (
                  <SecondaryActionButton
                    leftIcon={'contact_page'}
                    onClick={() => setIsDestinationSheetVisible('My Contacts')}
                    actionLabel='Open Contacts Sheet'
                    iconClassName='!text-sm !text-gray-800 dark:!text-gray-200'
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
                    leftIcon={'account_balance_wallet'}
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
                    onClick={handleAddContact}
                    actionLabel='Add Contact to Address Book'
                    leftIcon={'person_add'}
                    iconClassName={
                      '[transform:rotateY(180deg)] !text-sm !text-gray-800 dark:!text-gray-200'
                    }
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
        />
      </motion.div>
    </div>
  )
}
