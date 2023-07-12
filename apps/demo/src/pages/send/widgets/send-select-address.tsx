import {
  Address,
  addressPrefixes,
  ChainData,
  ChainInfos,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { getBlockChainFromAddress, isValidAddress } from '@leapwallet/cosmos-wallet-sdk'
import { getChainInfo } from '@leapwallet/cosmos-wallet-sdk/dist/chains/get-chain-info'
import { Avatar, AvatarCard, Card, InputWithButton } from '@leapwallet/leap-ui'
import React, { useEffect, useMemo, useState } from 'react'

import EmptyCard from '~/components/empty-card'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useCurrentNetwork } from '~/hooks/settings/use-current-network'
import { useAddress } from '~/hooks/wallet/use-address'
import { useGetIbcChannelId } from '~/hooks/wallet/use-get-ibc-channel-ids'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import { Images } from '~/images'
import { AddressBook } from '~/util/addressbook'
import { sliceAddress, sliceSearchWord } from '~/util/strings'

import { SelectedAddress } from '../types'
import SaveAddressSheet from './save-address-sheet'

export default function SendSelectAddress({
  onAddressSelect,
}: {
  onAddressSelect: (selected: SelectedAddress) => void
}) {
  const [contacts, setContacts] = useState<AddressBook.SavedAddresses>()

  const [inputText, setInputText] = useState<string>('')
  const [validAddress, setValidAddress] = useState<boolean>()
  const [chainName, setChainName] = useState<SupportedChain | undefined>()
  const [accounts, setAccounts] = useState<Record<SupportedChain, string>>()
  const [showSaveContact, setShowSaveContact] = useState<boolean>(false)
  const address = useAddress()
  const [recipientChainInfo, setRecipientChainInfo] = useState<ChainData>()
  const getIbcChannelIds = useGetIbcChannelId()

  const activeChain = useActiveChain()
  const wallet = useActiveWallet()

  const selectedNetwork = useCurrentNetwork()
  const [ibcSupportError, setIbcSupportError] = useState('')
  const [clipboardError, setClipboardError] = useState('')

  useEffect(() => {
    setContacts(AddressBook.getAllEntries() ?? {})
  }, [])

  useEffect(() => {
    if (!accounts && wallet) setAccounts(wallet.addresses)
  }, [accounts, wallet])

  useEffect(() => {
    if (inputText && inputText.length > 39) {
      const isValid = isValidAddress(inputText)

      if (isValid) {
        const recipientChain = getBlockChainFromAddress(inputText)
        const sourceChain = getBlockChainFromAddress(address)

        const chain = addressPrefixes[recipientChain]
        const isIbc = recipientChain !== sourceChain

        if (isIbc) {
          if (selectedNetwork === 'mainnet') {
            getIbcChannelIds(inputText)
              .then((channelIds) => {
                if (channelIds.length > 0) {
                  setValidAddress(isValid)
                  setChainName(chain as SupportedChain)
                  setIbcSupportError('')
                  getChainInfo(chain).then((chainInfo) => setRecipientChainInfo(chainInfo))
                }
              })
              .catch(() => {
                setIbcSupportError('We currently do not support IBC across these chains.')
                setValidAddress(false)
              })
          } else {
            setIbcSupportError('IBC transfers are not supported on Testnet.')
          }
        } else {
          const isTestnet = selectedNetwork === 'testnet'
          setValidAddress(isValid)
          setChainName(chain as SupportedChain)
          getChainInfo(chain, isTestnet).then((chainInfo) => setRecipientChainInfo(chainInfo))
        }
      }
    } else {
      setValidAddress(false)
      setIbcSupportError('')
    }
  }, [inputText, address, selectedNetwork, getIbcChannelIds])

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClipboardError(undefined)
    const txt = e.currentTarget.value
    setInputText(txt)
  }

  const isSendingSameWallet = inputText === wallet.addresses[activeChain]

  const buttonText = (): string => {
    if (!inputText || inputText.length === 0) return 'Paste'
    else if (validAddress && !isSendingSameWallet) return 'Save'
    return 'cross'
  }

  const displayInputButtonText = buttonText()

  const displayAccounts = useMemo(
    () =>
      (selectedNetwork === 'mainnet'
        ? Object.entries(accounts ?? {}).filter(
            ([accChain, accAddress]) =>
              accAddress.includes(inputText) &&
              accAddress !== address &&
              ChainInfos[accChain as unknown as SupportedChain].enabled,
          )
        : []) as [SupportedChain, Address][],
    [accounts, inputText, address, selectedNetwork],
  )

  const selectAddress = (selectedAddress: SelectedAddress) => {
    const recipientChain = getBlockChainFromAddress(selectedAddress.address)
    const sourceChain = getBlockChainFromAddress(address)
    const isIbc = recipientChain !== sourceChain
    if (isIbc) {
      if (selectedNetwork === 'mainnet') {
        getIbcChannelIds(selectedAddress.address)
          .then((channelIds) => {
            if (channelIds.length > 0) {
              onAddressSelect(selectedAddress)
            }
          })
          .catch((e) => {
            setIbcSupportError('We currently do not support IBC across these chains.')
          })
      } else {
        setIbcSupportError('IBC transfers are not supported on Testnet.')
      }
    } else {
      onAddressSelect(selectedAddress)
    }
  }

  const displayContacts = useMemo(
    () =>
      Object.entries(contacts ?? {}).filter(
        (item) =>
          item[1] &&
          (item[1]?.name?.toLowerCase().includes(inputText) ||
            item[1]?.address?.includes(inputText)),
      ),
    [contacts, inputText],
  )

  const displayNoResultsFound =
    inputText.length !== 0 && displayContacts?.length === 0 && displayAccounts?.length === 0

  return (
    <>
      <div className='flex flex-col p-[28px] gap-y-[16px] mb-[64px]'>
        <InputWithButton
          className='send-to-search-bar'
          buttonText={displayInputButtonText}
          buttonTextColor={ChainInfos[activeChain].theme.primaryColor}
          icon={
            (!!inputText && !validAddress) || isSendingSameWallet
              ? Images.Misc.CrossFilled
              : undefined
          }
          value={validAddress ? sliceAddress(inputText) : inputText ?? ''}
          onButtonClick={() => {
            switch (displayInputButtonText) {
              case 'Paste':
                navigator.clipboard
                  .readText()
                  .then((txt) => {
                    setInputText(txt)
                  })
                  .catch((e) => {
                    setClipboardError(e.message)
                  })
                break
              case 'cross':
                setInputText('')
                break
              case 'Save':
                setContacts(undefined)
                setShowSaveContact(true)
                break
              default:
                break
            }
          }}
          onChange={handleInputTextChange}
          placeholder='enter name or address'
        />
        {ibcSupportError ? (
          <p className='text-red-300 text-xs text-center font-medium'>{ibcSupportError}</p>
        ) : null}

        {clipboardError ? (
          <p className='text-red-300 text-xs text-center font-medium'>
            Clipboard read permission denied.
          </p>
        ) : null}

        {displayNoResultsFound ? (
          <>
            {validAddress ? (
              <>
                {isSendingSameWallet ? (
                  <EmptyCard
                    heading='Not supported'
                    subHeading='Cannot send to your own wallet'
                    isRounded
                    src={Images.Misc.Contacts}
                  />
                ) : (
                  <div className='  bg-white-100 dark:bg-gray-900 rounded-[16px]  items-center'>
                    <Text
                      size='xs'
                      className='pl-[16px] pr-[16px] pt-[16px] font-bold'
                      color='text-gray-600 dark:text-gray-200'
                    >
                      New address
                    </Text>
                    <Card
                      avatar={
                        <Avatar
                          avatarImage={recipientChainInfo?.image ?? Images.Misc.Contacts}
                          size='sm'
                        />
                      }
                      isRounded
                      iconSrc={Images.Misc.IconRight}
                      size='md'
                      subtitle={
                        <>
                          Chain: {chainName} ·{' '}
                          <span className='text-orange-300'>Not in contacts</span>
                        </>
                      }
                      title={sliceAddress(inputText)}
                      onClick={() =>
                        selectAddress({
                          address: inputText,
                          avatarIcon: recipientChainInfo?.image ?? Images.Misc.WalletIconWhite,
                          chainIcon: undefined,
                          chainName: chainName,
                          emoji: undefined,
                          name: sliceAddress(inputText),
                          selectionType: 'notSaved',
                        })
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyCard
                isRounded
                subHeading='Please try again with something else'
                heading={'No results for “' + sliceSearchWord(inputText) + '”'}
                src={Images.Misc.Explore}
              />
            )}
          </>
        ) : (
          <>
            {accounts && displayAccounts.length !== 0 && (
              <div className='bg-white-100 dark:bg-gray-900 rounded-[16px] p-[12px]'>
                <Text
                  size='xs'
                  className='p-[4px] font-bold'
                  color='text-gray-600 dark:text-gray-200'
                >
                  Other chains in current wallet: {wallet.name}
                </Text>
                <div className='grid grid-cols-4 gap-x-[26px] gap-y-[26px] p-[16px] mt-[16px] '>
                  {displayAccounts.map(([chain, accAddress]) => {
                    return (
                      <AvatarCard
                        key={chain + accAddress}
                        avatarImage={Images.Logos.getChainImage(chain)}
                        chainIcon={Images.Misc.getWalletIconAtIndex(wallet.colorIndex)}
                        size='sm'
                        subtitle={sliceAddress(accAddress)}
                        title={chain}
                        onClick={() =>
                          selectAddress({
                            address: accAddress,
                            avatarIcon: Images.Misc.getWalletIconAtIndex(wallet.colorIndex),
                            chainIcon: Images.Logos.getChainImage(chain),
                            chainName: chain,
                            emoji: undefined,
                            name: wallet.name,
                            selectionType: 'currentWallet',
                          })
                        }
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {displayContacts.length === 0 && (
              <EmptyCard
                isRounded
                subHeading='Your contacts will appear here'
                heading='No contacts saved'
                src={Images.Misc.Contacts}
              />
            )}

            {contacts && displayContacts?.length !== 0 && (
              <div className=' bg-white-100 dark:bg-gray-900 rounded-[16px] p-[12px] items-center'>
                <Text
                  size='xs'
                  className='p-[4px] font-bold'
                  color='text-gray-600 dark:text-gray-200'
                >
                  Your Contacts
                </Text>
                <div className='grid grid-cols-3  gap-[26px] p-[4px] mt-[16px] justify-between'>
                  {displayContacts?.map((item, index) => (
                    <div key={index} className='flex justify-center'>
                      <AvatarCard
                        key={index}
                        chainIcon={Images.Logos.getChainImage(item[1].blockchain as SupportedChain)}
                        emoji={item[1].emoji ?? index}
                        size='md'
                        subtitle={sliceAddress(item[1].address)}
                        title={item[1].name}
                        onClick={() =>
                          selectAddress({
                            address: item[1].address,
                            avatarIcon: undefined,
                            chainIcon: Images.Logos.getChainImage(
                              item[1].blockchain as SupportedChain,
                            ),
                            chainName: item[1].blockchain,
                            emoji: item[1].emoji,
                            name: item[1].name,
                            selectionType: 'saved',
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {showSaveContact && (
          <SaveAddressSheet
            isVisible={showSaveContact}
            onSave={(s) => {
              selectAddress({ ...s, selectionType: 'saved' })
            }}
            onClose={() => {
              setShowSaveContact(false)
            }}
            selectedAddress={{
              address: inputText,
              avatarIcon: recipientChainInfo?.image ?? Images.Misc.WalletIconWhite,
              chainIcon: recipientChainInfo?.image ?? Images.Misc.WalletIconWhite,
              chainName: recipientChainInfo.bech32_prefix,
              emoji: Object.keys(contacts ?? []).length + 1,
              name: sliceAddress(inputText),
              selectionType: 'notSaved',
            }}
          />
        )}
      </div>
    </>
  )
}
