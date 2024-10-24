import {
  SelectedAddress,
  useActiveChain,
  useActiveWallet,
  useAddress,
  useAddressPrefixes,
  useChainApis,
  useChainsStore,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getBlockChainFromAddress,
  isValidAddress,
  pubKeyToEvmAddressToShow,
  SeiEvmTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { bech32 } from 'bech32'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from 'config/constants'
import { motion } from 'framer-motion'
import { useManageChainData } from 'hooks/settings/useManageChains'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useContactsSearch } from 'hooks/useContacts'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { AddressBook } from 'utils/addressbook'
import { UserClipboard } from 'utils/clipboard'
import { isCompassWallet } from 'utils/isCompassWallet'
import { sliceAddress } from 'utils/strings'

import { IBCSettings } from '../ibc-banner'
import { SecondaryActionButton } from '../secondary-action-button'
import { useSendNftCardContext } from '../send-nft'
import { ContactsSheet } from './contacts-sheet'
import { ContactsMatchList, NameServiceMatchList } from './match-lists'
import { MyWalletSheet } from './my-wallet-sheet'
import SaveAddressSheet from './save-address-sheet'
import { SelectedAddressPreview } from './selected-address-preview'

type RecipientCardProps = {
  themeColor: string
  selectedAddress: SelectedAddress | null
  setSelectedAddress: (s: SelectedAddress | null) => void
  addressError?: string
  setAddressError: (s: string) => void
  collectionAddress: string
  associatedSeiAddress: string
  setAssociatedSeiAddress: React.Dispatch<React.SetStateAction<string>>
}

const nameServiceMatcher = /^[a-zA-Z0-9_-]+\.[a-z]+$/

export const RecipientCard: React.FC<RecipientCardProps> = ({
  themeColor,
  selectedAddress,
  setSelectedAddress,
  addressError,
  setAddressError,
  collectionAddress,
  associatedSeiAddress,
  setAssociatedSeiAddress,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const {
    fetchAccountDetails,
    fetchAccountDetailsData,
    fetchAccountDetailsStatus,
    setAddressWarning,
    addressWarning,
    nftSendChain: activeChain,
    nftSendNetwork: activeNetwork,
  } = useSendNftCardContext()

  const [isContactsSheetVisible, setIsContactsSheetVisible] = useState<boolean>(false)
  const [isMyWalletSheetVisible, setIsMyWalletSheetVisible] = useState<boolean>(false)
  const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState<boolean>(false)
  const [recipientInputValue, setRecipientInputValue] = useState<string>('')

  const [manageChains] = useManageChainData()
  const [customIbcChannelId, setCustomIbcChannelId] = useState<string>()

  const { ibcSupportData, isIBCTransfer } = {
    ibcSupportData: {},
    isIBCTransfer: false,
  }

  const { chains } = useChainsStore()
  const currentWalletAddress = useAddress(activeChain)
  const addressPrefixes = useAddressPrefixes()

  const activeWallet = useActiveWallet()
  const activeChainInfo = chains[activeChain]
  const contactsToShow = useContactsSearch(recipientInputValue)
  const existingContactMatch = AddressBook.useGetContact(recipientInputValue)
  const ownWalletMatch = selectedAddress?.selectionType === 'currentWallet'
  const { evmJsonRpc } = useChainApis(activeChain, activeNetwork)

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRecipientInputValue(e.target.value)
    },
    [setRecipientInputValue],
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
          setRecipientInputValue('')
          setSelectedAddress(null)
          break
        default:
          break
      }
    },
    [setSelectedAddress],
  )

  const handleContactSelect = useCallback(
    (s: SelectedAddress) => {
      setSelectedAddress(s)
      setRecipientInputValue(s.address ?? '')
      if (isContactsSheetVisible) {
        setIsContactsSheetVisible(false)
      }
    },
    [isContactsSheetVisible, setRecipientInputValue, setSelectedAddress],
  )

  const handleWalletSelect = useCallback(
    (s: SelectedAddress) => {
      setRecipientInputValue(s.address ?? '')
      setSelectedAddress(s)
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
      setAddressError('Invalid Address')
    }
  }, [addressPrefixes, recipientInputValue, setAddressError])

  const action = useMemo(() => {
    if (recipientInputValue.length > 0) {
      return 'clear'
    }
    return 'paste'
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
          showEditMenu={false}
          onDelete={() => {
            setSelectedAddress(null)
            setRecipientInputValue('')
          }}
        />
      )
    }
    if (recipientInputValue.length > 0) {
      try {
        bech32.decode(recipientInputValue)
        return (
          <Text size='md' className='text-gray-800 dark:text-gray-200'>
            {sliceAddress(recipientInputValue)}
          </Text>
        )
      } catch (err) {
        return undefined
      }
    }
    return undefined

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingContactMatch, recipientInputValue, selectedAddress, setSelectedAddress])

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
    !showNameServiceResults
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
    activeNetwork === 'mainnet' &&
    false
  !isCompassWallet()

  const showSecondaryActions = showContactsButton || showMyWalletButton || showAddToContacts

  useEffect(() => {
    switch (fetchAccountDetailsStatus) {
      case 'loading': {
        setAddressWarning(
          <>
            Recipient will receive this on address:{' '}
            <LoaderAnimation color={Colors.white100} className='w-[20px] h-[20px]' />
          </>,
        )

        break
      }

      case 'success': {
        if (fetchAccountDetailsData?.pubKey.key) {
          const recipient0xAddress = pubKeyToEvmAddressToShow(fetchAccountDetailsData.pubKey.key)
          if (recipient0xAddress.toLowerCase().startsWith('0x')) {
            setAddressWarning(
              `Recipient will receive the NFT on associated EVM address: ${recipient0xAddress}`,
            )
          } else {
            setAddressError('You can only send this NFT to an EVM address.')
          }
        }

        break
      }

      case 'error': {
        setAddressError('You can only send this NFT to an EVM address.')
        break
      }

      default: {
        setAddressWarning('')
        setAddressError('')
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAccountDetailsData?.pubKey.key, fetchAccountDetailsStatus])

  useEffect(() => {
    ;(async function () {
      setAssociatedSeiAddress('')

      if (currentWalletAddress === recipientInputValue) {
        setAddressError('Cannot send to self')
      } else if (collectionAddress.toLowerCase().startsWith('0x') && recipientInputValue) {
        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          setAddressError(SEI_EVM_LEDGER_ERROR_MESSAGE)
          return
        }

        if (
          !recipientInputValue.toLowerCase().startsWith('0x') &&
          recipientInputValue.length >= 42
        ) {
          await fetchAccountDetails(recipientInputValue)
        }
      } else if (
        !collectionAddress.toLowerCase().startsWith('0x') &&
        recipientInputValue &&
        recipientInputValue.toLowerCase().startsWith('0x')
      ) {
        try {
          const recipientSeiAddress = await SeiEvmTx.GetSeiAddressFromHex(
            recipientInputValue,
            evmJsonRpc,
          )

          setAssociatedSeiAddress(recipientSeiAddress)
          setAddressWarning(
            `Recipient will receive the NFT on associated Sei address: ${recipientSeiAddress}`,
          )
        } catch {
          setAddressError('You can only send this NFT to a Sei address and not an EVM address.')
        }
      } else if (
        recipientInputValue &&
        !isValidAddress(recipientInputValue) &&
        !showNameServiceResults
      ) {
        setAddressError('Invalid address')
      } else {
        setAddressError('')
        setAddressWarning('')
      }
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collectionAddress,
    currentWalletAddress,
    recipientInputValue,
    setAddressError,
    showNameServiceResults,
    activeWallet?.walletType,
    activeChain,
    activeNetwork,
  ])

  useEffect(() => {
    if (recipientInputValue === selectedAddress?.address) {
      return
    }
    const cleanInputValue = recipientInputValue.trim()
    if (selectedAddress && cleanInputValue !== selectedAddress.address) {
      setSelectedAddress(null)
      return
    }
    try {
      if (
        cleanInputValue.toLowerCase().startsWith('0x') &&
        (collectionAddress.toLowerCase().startsWith('0x') ||
          (!collectionAddress.toLowerCase().startsWith('0x') && associatedSeiAddress))
      ) {
        setSelectedAddress({
          address: cleanInputValue,
          name: sliceAddress(cleanInputValue),
          avatarIcon: activeChainInfo.chainSymbolImageUrl ?? '',
          emoji: undefined,
          chainIcon: activeChainInfo.chainSymbolImageUrl ?? '',
          chainName: activeChainInfo.key,
          selectionType: 'notSaved',
        })
        return
      }

      const { prefix } = bech32.decode(cleanInputValue)
      const _chain = addressPrefixes[prefix] as SupportedChain
      const img = chains[_chain].chainSymbolImageUrl

      setSelectedAddress({
        address: cleanInputValue,
        name: sliceAddress(cleanInputValue),
        avatarIcon: img ?? '',
        emoji: undefined,
        chainIcon: img ?? '',
        chainName: _chain,
        selectionType: 'notSaved',
      })
    } catch (err) {
      //
    }
  }, [
    activeChainInfo.chainSymbolImageUrl,
    activeChainInfo.key,
    addressPrefixes,
    associatedSeiAddress,
    chains,
    collectionAddress,
    currentWalletAddress,
    recipientInputValue,
    selectedAddress,
    setSelectedAddress,
  ])

  useEffect(() => {
    if (existingContactMatch) {
      const shouldUpdate =
        existingContactMatch.address !== selectedAddress?.address ||
        existingContactMatch.name !== selectedAddress?.name ||
        existingContactMatch.emoji !== selectedAddress?.emoji ||
        existingContactMatch.blockchain !== selectedAddress?.chainName

      if (shouldUpdate) {
        const img = chains[existingContactMatch.blockchain].chainSymbolImageUrl
        setSelectedAddress({
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
  }, [chains, existingContactMatch, recipientInputValue, selectedAddress, setSelectedAddress])

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
      (selectedAddress?.address ?? '').toLowerCase().startsWith('0x') &&
      (collectionAddress.toLowerCase().startsWith('0x') ||
        (!collectionAddress.toLowerCase().startsWith('0x') && associatedSeiAddress))
    ) {
      return
    }

    if (selectedAddress?.address) {
      const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address)

      if (!destChainAddrPrefix) {
        setAddressError('Invalid Address')
        return
      } else {
        destinationChain = addressPrefixes[destChainAddrPrefix]
      }
    } else {
      return
    }

    const isIBC = destinationChain !== activeChain
    if (!isIBC) {
      return
    }

    // ibc not supported on testnet
    if (isIBC && activeNetwork === 'testnet') {
      setAddressError(`IBC not supported on testnet`)
      return
    }

    if (isIBC && destinationChain && isCompassWallet()) {
      const compassChains = manageChains.filter((chain) => chain.chainName !== 'cosmos')

      if (!compassChains.find((chain) => chain.chainName === destinationChain)) {
        const destinationChainName = chains[destinationChain as SupportedChain].chainName
        const sourceChainName = chains[activeChain].chainName

        setAddressError(`IBC not supported between ${destinationChainName} and ${sourceChainName}`)
        return
      }
    }

    // check if destination chain is supported
    if (destinationChain && ibcSupportData !== undefined && !isCompassWallet()) {
      if (customIbcChannelId) {
        setAddressError('')
      } else {
        setAddressError(
          `IBC not supported between ${chains[destinationChain as SupportedChain].chainName} and ${
            chains[activeChain].chainName
          }`,
        )
      }
    }
  }, [
    activeChain,
    activeNetwork,
    activeChainInfo,
    ibcSupportData,
    selectedAddress,
    setAddressError,
    currentWalletAddress,
    customIbcChannelId,
    chains,
    addressPrefixes,
    collectionAddress,
    manageChains,
    associatedSeiAddress,
  ])

  useEffect(() => {
    if (selectedAddress?.chainName) {
      setCustomIbcChannelId(undefined)
    }
  }, [selectedAddress?.chainName, setCustomIbcChannelId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div>
      <motion.div
        className={`card-container ${isIBCTransfer && !isCompassWallet() ? '!rounded-b-none' : ''}`}
      >
        <Text
          size='sm'
          className='text-gray-600 dark:text-gray-200 font-bold mb-3'
          data-testing-id='send-recipient-card'
        >
          Recipient
        </Text>

        <ActionInputWithPreview
          invalid={!!addressError}
          warning={!!addressWarning}
          action={action}
          buttonText={action}
          buttonTextColor={themeColor}
          icon={inputButtonIcon}
          value={recipientInputValue}
          onAction={actionHandler}
          onChange={handleOnChange}
          placeholder='Enter name or address'
          autoComplete='off'
          spellCheck='false'
          className='rounded-lg'
          preview={preview}
          ref={inputRef}
        />

        {addressError ? (
          <Text
            size='xs'
            color='text-red-300'
            className='mt-2 ml-1 font-bold'
            data-testing-id='send-recipient-address-error-ele'
          >
            {addressError}
          </Text>
        ) : null}

        {addressWarning ? (
          <Text
            size='xs'
            color='text-yellow-600'
            className='mt-2 ml-1 font-bold'
            data-testing-id='send-recipient-address-error-ele'
          >
            {addressWarning}
          </Text>
        ) : null}

        {showSecondaryActions ? (
          <div className='flex flex-wrap space-x-1 gap-2 mt-4'>
            {showContactsButton ? (
              <SecondaryActionButton
                leftIcon={Images.Misc.Contacts}
                onClick={() => setIsContactsSheetVisible(true)}
                actionLabel='Open Contacts Sheet'
              >
                <Text size='sm' className='text-gray-600 dark:text-gray-200 whitespace-nowrap'>
                  Contacts
                </Text>
              </SecondaryActionButton>
            ) : null}
            {showMyWalletButton ? (
              <SecondaryActionButton
                leftIcon={Images.Misc.WalletIcon2}
                onClick={() => setIsMyWalletSheetVisible(true)}
                actionLabel='Show My Wallets on Other Chains'
              >
                <Text size='sm' className='text-gray-600 dark:text-gray-200 whitespace-nowrap'>
                  My Wallet
                </Text>
              </SecondaryActionButton>
            ) : null}
            {showAddToContacts ? (
              <SecondaryActionButton
                leftIcon={Images.Misc.AddContact}
                onClick={handleAddContact}
                actionLabel='Add Contact to Address Book'
              >
                <Text size='sm' className='text-gray-600 dark:text-gray-200 whitespace-nowrap'>
                  Add Contact
                </Text>
              </SecondaryActionButton>
            ) : null}
          </div>
        ) : null}

        {showContactsList ? (
          <ContactsMatchList contacts={contactsToShow} handleContactSelect={handleContactSelect} />
        ) : null}

        {showNameServiceResults ? (
          <NameServiceMatchList
            address={recipientInputValue}
            handleContactSelect={handleContactSelect}
          />
        ) : null}

        <ContactsSheet
          isOpen={isContactsSheetVisible}
          onContactSelect={handleContactSelect}
          onClose={() => setIsContactsSheetVisible(false)}
        />

        <MyWalletSheet
          isOpen={isMyWalletSheetVisible}
          setSelectedAddress={handleWalletSelect}
          onClose={() => setIsMyWalletSheetVisible(false)}
        />

        <SaveAddressSheet
          isOpen={isAddContactSheetVisible}
          onSave={handleContactSelect}
          onClose={() => setIsAddContactSheetVisible(false)}
          address={recipientInputValue}
        />
      </motion.div>

      {isIBCTransfer && !isCompassWallet() && activeNetwork === 'mainnet' && destChainInfo ? (
        <IBCSettings
          className='rounded-b-2xl'
          targetChain={destChainInfo.key}
          onSelectChannel={setCustomIbcChannelId}
        />
      ) : null}
    </div>
  )
}
