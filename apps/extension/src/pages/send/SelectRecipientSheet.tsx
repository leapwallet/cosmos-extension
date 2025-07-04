import { Key, SelectedAddress, sliceAddress, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { CaretRight, MagnifyingGlassMinus, PencilSimpleLine } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import { useDefaultTokenLogo } from 'hooks'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useContacts, useContactsSearch } from 'hooks/useContacts'
import useQuery from 'hooks/useQuery'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { chainFeatureFlagsStore } from 'stores/balance-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import { AddressBook } from 'utils/addressbook'
import { cn } from 'utils/cn'

export const SelectChain = observer(
  ({
    isOpen,
    onClose,
    chainList,
    wallet,
    address,
    forceName,
    setSelectedAddress,
  }: {
    isOpen: boolean
    wallet?: Key
    address?: string
    onClose: () => void
    chainList?: SupportedChain[]
    forceName?: string
    setSelectedAddress: (address: SelectedAddress) => void
  }) => {
    const [searchedText, setSearchedText] = useState('')
    const selectedNetwork = useSelectedNetwork()
    const chainInfos = chainInfoStore.chainInfos
    const chains = useMemo(() => {
      let _chains: SupportedChain[] = []
      if (chainList) {
        _chains = chainList
      } else {
        _chains = Object.keys(wallet?.addresses ?? {}) as SupportedChain[]
      }
      const isTestnet = selectedNetwork === 'testnet'
      _chains = _chains.filter((item) => {
        const chainInfo = chainInfos[item]
        if (!chainInfo || !chainInfo.enabled) return false
        if (isTestnet) {
          return !!chainInfo.testnetChainId
        } else {
          return !chainInfo.testnetChainId || chainInfo.chainId !== chainInfo.testnetChainId
        }
      })
      return _chains.filter((chain) =>
        chainInfos[chain].chainName.toLowerCase().includes(searchedText.toLowerCase()),
      ) as SupportedChain[]
    }, [chainList, selectedNetwork, wallet?.addresses, chainInfos, searchedText])

    return (
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        fullScreen
        title='Select chain'
        className='!pb-0'
        direction='right'
        hideActionButton
        secondaryActionButton={<Buttons.Back onClick={onClose} />}
      >
        <div className='flex flex-col items-start gap-7 p-2 h-full w-full'>
          <div className='flex flex-col items-center w-full'>
            <SearchInput
              value={searchedText}
              onChange={(e) => setSearchedText(e.target.value)}
              placeholder='Search by chain name'
              onClear={() => setSearchedText('')}
            />
          </div>
          <div className='w-full h-full overflow-y-auto'>
            {chains.length > 0 ? (
              chains.map((chain, index) => {
                const isLast = index === chains.length - 1
                const isFirst = index === 0
                const chainInfo = chainInfos[chain]
                const walletAddress = address
                  ? address
                  : chainInfo?.evmOnlyChain
                  ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[chainInfo?.key], true)
                  : wallet?.addresses[chainInfo?.key]

                return (
                  <React.Fragment key={chain}>
                    <button
                      className={classNames(
                        'w-full flex items-center gap-3 cursor-pointer px-4 py-3 mb-3 rounded-xl bg-secondary-100 hover:bg-secondary-200',
                      )}
                      onClick={() => {
                        setSelectedAddress({
                          address: walletAddress,
                          ethAddress: walletAddress,
                          avatarIcon:
                            wallet?.avatar ||
                            Images.Misc.getWalletIconAtIndex(wallet?.colorIndex ?? 0),
                          chainIcon: '',
                          chainName: chain,
                          emoji: undefined,
                          name: `${
                            wallet
                              ? wallet.name.length > 12
                                ? `${wallet.name.slice(0, 12)}...`
                                : wallet.name
                              : forceName || sliceAddress(address)
                          }`,
                          selectionType: 'currentWallet',
                        })
                      }}
                    >
                      <div className='flex gap-4 items-center w-full'>
                        <img
                          className='h-10 w-10 rounded-full'
                          src={chainInfo.chainSymbolImageUrl}
                        />

                        <div className='flex flex-col grow'>
                          <p className='font-bold text-left text-monochrome text-sm capitalize'>
                            {chainInfo.chainName}
                          </p>
                          <p className='text-sm text-muted-foreground text-left'>
                            {sliceAddress(walletAddress)}
                          </p>
                        </div>
                        <CaretRight className='text-muted-foreground' size={16} />
                      </div>
                    </button>

                    {/* {!isLast && (
                      <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                    )} */}
                  </React.Fragment>
                )
              })
            ) : (
              <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
                <MagnifyingGlassMinus
                  size={64}
                  className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
                />
                <div className='flex flex-col justify-start items-center w-full gap-3'>
                  <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
                    No chains found
                  </div>
                  {/* <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
                    
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </BottomModal>
    )
  },
)

function MyWallets({
  setSelectedAddress,
}: {
  setSelectedAddress: (address: SelectedAddress) => void
}) {
  const wallets = Wallet.useWallets()
  const [selectedWallet, setSelectedWallet] = useState<Key | null>(null)
  const { activeWallet } = useActiveWallet()
  const [showSelectChain, setShowSelectChain] = useState<boolean>(false)

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) => a.name.localeCompare(b.name))
      : []
  }, [wallets])

  const handleChainSelect = useCallback(
    (s: SelectedAddress) => {
      setSelectedAddress(s)
      setShowSelectChain(false)
    },
    [setSelectedAddress, setShowSelectChain],
  )

  const handleOnSelectChainClose = useCallback(() => {
    setSelectedWallet(null)
    setShowSelectChain(false)
  }, [setSelectedWallet, setShowSelectChain])

  return (
    <>
      <div className='relative w-full h-[calc(100%-235px)]] overflow-auto'>
        {walletsList.length > 0 ? (
          walletsList.map((wallet, index) => {
            const isLast = index === walletsList.length - 1
            const isFirst = index === 0
            let walletLabel = ''

            if (wallet.walletType === WALLETTYPE.LEDGER) {
              walletLabel = `Imported · ${wallet.path?.replace("m/44'/118'/", '')}`
            }

            return (
              <React.Fragment key={wallet.id}>
                <button
                  className='w-full flex items-center gap-3 cursor-pointer mb-3 bg-secondary-100 hover:bg-secondary-200 px-4 py-3 rounded-xl'
                  onClick={() => {
                    setSelectedWallet(wallet)
                    setShowSelectChain(true)
                  }}
                >
                  <div className='flex items-center'>
                    <div className='flex items-center justify-center h-10 w-10 mr-3 shrink-0'>
                      <img
                        className='h-9 w-9 rounded-full'
                        src={
                          wallet.avatar || Images.Misc.getWalletIconAtIndex(wallet.colorIndex ?? 0)
                        }
                      />
                    </div>

                    <div className='flex flex-col'>
                      <div className='flex items-center gap-2'>
                        <p className='font-bold text-left text-monochrome text-sm capitalize'>
                          {wallet.name}
                        </p>
                        {activeWallet && activeWallet.id === wallet.id && (
                          <p className='font-bold text-left text-accent-green rounded-[4px] bg-accent-green/10 border border-accent-green/40 px-1.5 py-0.5 text-xs'>
                            Active
                          </p>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground text-left'>
                        {walletLabel ? walletLabel : ''}
                      </p>
                    </div>
                  </div>
                </button>

                {isLast && <div className='bg-transparent h-1' />}
              </React.Fragment>
            )
          })
        ) : (
          <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
            <MagnifyingGlassMinus
              size={64}
              className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
            />
            <div className='flex flex-col justify-start items-center w-full gap-3'>
              <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
                No wallets found
              </div>
              <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
                Use Leap’s in-wallet options to get started.
              </div>
            </div>
          </div>
        )}
      </div>
      <SelectChain
        isOpen={showSelectChain}
        onClose={handleOnSelectChainClose}
        setSelectedAddress={handleChainSelect}
        wallet={selectedWallet ?? undefined}
      />
    </>
  )
}

function MyContacts({
  handleContactSelect,
  editContact,
  minitiaChains,
}: {
  handleContactSelect: (contact: SelectedAddress) => void
  editContact: (s?: AddressBook.SavedAddress) => void
  minitiaChains: SupportedChain[]
}) {
  const [showSelectChain, setShowSelectChain] = useState<boolean>(false)
  const contacts = useContactsSearch()
  const chainInfos = useChainInfos()
  const { setMemo } = useSendContext()
  const defaultTokenLogo = useDefaultTokenLogo()
  const [selectedContact, setSelectedContact] = useState<AddressBook.SavedAddress | null>(null)

  const handleAvatarClick = (contact: AddressBook.SavedAddress, chainImage: string | undefined) => {
    if (contact.address.startsWith('init')) {
      setSelectedContact(contact)
      setShowSelectChain(true)
    } else {
      handleContactSelect({
        avatarIcon: '',
        chainIcon: chainImage ?? '',
        chainName: '',
        name: contact.name,
        address: contact.address,
        ethAddress: contact.ethAddress,
        emoji: contact.emoji,
        selectionType: 'saved',
      })
    }
    setMemo(contact.memo ?? '')
  }

  const handleOnSelectChainClose = useCallback(() => {
    setSelectedContact(null)
    setShowSelectChain(false)
  }, [setSelectedContact, setShowSelectChain])

  const handleSelectChain = useCallback(
    (address: SelectedAddress) => {
      handleContactSelect({ ...address, selectionType: 'saved' })
      setShowSelectChain(false)
    },
    [handleContactSelect, setShowSelectChain],
  )

  return (
    <>
      <div className='relative w-full h-full flex flex-col'>
        {contacts.length > 0 ? (
          <>
            <div className='w-full h-[calc(100%-84px)] overflow-auto flex flex-col pb-6'>
              {contacts.map((contact, index) => {
                const chainImage =
                  chainInfos[contact.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo
                const isLast = index === contacts.length - 1

                return (
                  <React.Fragment key={contact.address}>
                    <button
                      className='w-full flex items-center gap-3 mb-3 bg-secondary-100 hover:bg-secondary-200 px-4 py-3 rounded-xl'
                      onClick={() => handleAvatarClick(contact, chainImage)}
                    >
                      <div className='flex justify-between items-center w-full'>
                        <div className='flex items-center'>
                          <div className='flex items-center justify-center h-10 w-10 mr-3 shrink-0'>
                            <img
                              className='h-9 w-9 rounded-full'
                              src={Images.Misc.getWalletIconAtIndex(0)}
                            />
                          </div>

                          <div className='flex flex-col'>
                            <p className='font-bold text-left text-monochrome text-sm capitalize'>
                              {contact.name}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {sliceAddress(
                                contact.ethAddress ? contact.ethAddress : contact.address,
                              )}
                            </p>
                          </div>
                        </div>
                        <PencilSimpleLine
                          size={34}
                          weight='fill'
                          className='bg-secondary-200 hover:bg-secondary-300 border rounded-full p-2.5 border-secondary-300 text-muted-foreground cursor-pointer'
                          onClick={(e) => {
                            e.stopPropagation()
                            editContact(contact)
                          }}
                        />
                      </div>
                    </button>

                    {isLast && <div className='bg-transparent h-1' />}
                  </React.Fragment>
                )
              })}
            </div>
            <div
              className='text-sm font-bold py-3.5 !leading-[22.4px] text-muted-foreground border border-secondary-300 rounded-full text-center cursor-pointer'
              onClick={(e) => {
                e.stopPropagation()
                editContact()
              }}
            >
              Add new contact
            </div>
          </>
        ) : (
          <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
            <MagnifyingGlassMinus
              size={64}
              className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
            />
            <div className='flex flex-col justify-start items-center w-full gap-3'>
              <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
                No contacts found
              </div>
              <div
                className='mt-2 text-sm font-medium !leading-[22.4px] text-accent-foreground text-center cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation()
                  editContact()
                }}
              >
                + Add new contact
              </div>
            </div>
          </div>
        )}
      </div>
      <SelectChain
        isOpen={showSelectChain}
        onClose={handleOnSelectChainClose}
        chainList={minitiaChains}
        address={selectedContact?.address}
        setSelectedAddress={handleSelectChain}
      />
    </>
  )
}

export const SelectRecipientSheet = observer(
  ({
    isOpen,
    onClose,
    editContact,
    postSelectRecipient,
  }: {
    isOpen: boolean
    onClose: () => void
    editContact: (s?: AddressBook.SavedAddress) => void
    postSelectRecipient: () => void
  }) => {
    const [selectedTab, setSelectedTab] = useState<'contacts' | 'wallets'>('contacts')
    const { contacts, loading: loadingContacts } = useContacts()
    const selectedNetwork = useSelectedNetwork()
    const {
      setEthAddress,
      selectedAddress,
      setSelectedAddress,
      setAddressError,
      setMemo,
      setCustomIbcChannelId,
    } = useSendContext()
    const wallets = Wallet.useWallets()
    const walletsList = useMemo(() => {
      return wallets
        ? Object.values(wallets)
            .map((wallet) => wallet)
            .sort((a, b) =>
              a.createdAt && b.createdAt
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : a.name.localeCompare(b.name),
            )
        : []
    }, [wallets])

    const chains = chainInfoStore.chainInfos
    const chainFeatureFlags = chainFeatureFlagsStore.chainFeatureFlagsData

    const minitiaChains = useMemo(() => {
      const _minitiaChains: ChainInfo[] = []
      Object.keys(chainFeatureFlags)
        .filter((chain) => chainFeatureFlags[chain].chainType === 'minitia')
        .forEach((c) => {
          if (chains[c as SupportedChain]) {
            _minitiaChains.push(chains[c as SupportedChain])
          }
          const _chain = Object.values(chainInfoStore.chainInfos).find((chainInfo) =>
            selectedNetwork === 'testnet'
              ? chainInfo?.testnetChainId === c
              : chainInfo?.chainId === c,
          )
          if (_chain) {
            _minitiaChains.push(_chain)
          }
        })
      return _minitiaChains
    }, [chainFeatureFlags, chains, selectedNetwork])

    const handleContactSelect = useCallback(
      (s: SelectedAddress) => {
        setAddressError(undefined)
        setSelectedAddress(s)
        setEthAddress(s.ethAddress ?? '')
        postSelectRecipient()
        onClose()
      },
      [setAddressError, setEthAddress, setSelectedAddress, onClose, postSelectRecipient],
    )

    const handleWalletSelect = useCallback(
      (s: SelectedAddress) => {
        setAddressError(undefined)
        setSelectedAddress(s)
        setEthAddress(s.ethAddress ?? '')
        setMemo('')
        postSelectRecipient()
        onClose()
      },
      [setAddressError, setEthAddress, setMemo, setSelectedAddress, onClose, postSelectRecipient],
    )

    useEffect(() => {
      if (selectedAddress?.chainName) {
        setCustomIbcChannelId(undefined)
      }
    }, [selectedAddress?.chainName, setCustomIbcChannelId])

    useEffect(() => {
      if (!loadingContacts && Object.keys(contacts).length === 0) {
        setSelectedTab('wallets')
      }
    }, [contacts, loadingContacts])

    return (
      <>
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          fullScreen
          title='Address Book'
          className='h-full'
        >
          <div className='flex flex-col items-start gap-6 w-full h-full'>
            <>
              {Object.values(contacts).length === 0 &&
              walletsList.length === 0 ? null : walletsList.length === 0 ? (
                <Text className='font-bold mt-2' color='text-muted-foreground' size='xs'>
                  Contacts
                </Text>
              ) : (
                <div className='flex gap-2.5 mt-2'>
                  <div
                    className={cn(
                      'font-medium text-xs border bg-secondary py-2 px-4 hover:border-secondary-400 cursor-pointer',
                      {
                        'text-monochrome !border-monochrome rounded-full':
                          selectedTab === 'contacts',
                        'text-muted-foreground border-transparent rounded-full':
                          selectedTab !== 'contacts',
                      },
                    )}
                    onClick={() => setSelectedTab('contacts')}
                  >
                    Your contacts
                  </div>
                  <div
                    className={cn(
                      'font-medium text-xs border bg-secondary py-2 px-4 hover:border-secondary-400 cursor-pointer',
                      {
                        'text-monochrome !border-monochrome rounded-full':
                          selectedTab === 'wallets',
                        'text-muted-foreground border-transparent rounded-full':
                          selectedTab !== 'wallets',
                      },
                    )}
                    onClick={() => setSelectedTab('wallets')}
                  >
                    Your wallets
                  </div>
                </div>
              )}

              {selectedTab === 'wallets' ? (
                <MyWallets setSelectedAddress={handleWalletSelect} />
              ) : (
                <MyContacts
                  handleContactSelect={handleContactSelect}
                  editContact={editContact}
                  minitiaChains={minitiaChains.map((chain) => chain.key)}
                />
              )}
            </>
          </div>
        </BottomModal>
      </>
    )
  },
)
