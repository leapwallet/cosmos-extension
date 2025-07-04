import {
  SelectedAddress,
  sliceAddress,
  useAddressPrefixes,
  useDebounce,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfo,
  isAptosAddress,
  isEthAddress,
  isSolanaAddress,
  isValidAddress,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { ChainFeatureFlagsStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store'
import { CaretRight } from '@phosphor-icons/react'
import { bech32 } from 'bech32'
import useQuery from 'hooks/useQuery'
import { Wallet } from 'hooks/wallet/useWallet'
import { ContactCalenderIcon } from 'icons/contact-calender-icon'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import { useCheckAddressError } from 'pages/send/hooks/useCheckAddressError'
import { SelectChain } from 'pages/send/SelectRecipientSheet'
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { AddressBook } from 'utils/addressbook'
import { UserClipboard } from 'utils/clipboard'
import { cn } from 'utils/cn'
import { isSidePanel } from 'utils/isSidePanel'

import NameServiceMatchList from './match-lists'

interface InputCardProps {
  setShowSelectRecipient: (show: boolean) => void
  setRecipientInputValue: (value: string) => void
  recipientInputValue: string
  setInputInProgress: (inProgress: boolean) => void
  chainInfoStore: ChainInfosStore
  chainFeatureFlagsStore: ChainFeatureFlagsStore
  selectedNetwork: string
}

const nameServiceMatcher = /^[a-zA-Z0-9_-]+\.[a-z]+$/
const InputCard = forwardRef<HTMLInputElement, InputCardProps>(
  (
    {
      setShowSelectRecipient,
      setRecipientInputValue,
      recipientInputValue,
      setInputInProgress,
      chainInfoStore,
      chainFeatureFlagsStore,
      selectedNetwork,
    },
    ref,
  ) => {
    const recipient = useQuery().get('recipient') ?? undefined
    const {
      setEthAddress,
      setSelectedAddress,
      addressError,
      setMemo,
      sendActiveChain,
      setAddressError,
      setAddressWarning,
    } = useSendContext()
    const addressPrefixes = useAddressPrefixes()
    const [showSelectChain, setShowSelectChain] = useState<boolean>(false)
    const debouncedRecipientInputValue = useDebounce(recipientInputValue, 100)
    const existingContactMatch = AddressBook.useGetContact(recipientInputValue)
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

    const existingWalletMatch = useMemo(() => {
      const res = walletsList.find((wallet) => {
        const addresses = Object.values(wallet.addresses) || []
        const evmPubKey = wallet?.pubKeys?.ethereum
        const ethAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : undefined
        if (ethAddress) {
          addresses.push(ethAddress)
        }
        return addresses.some((address) => {
          return recipientInputValue.toLowerCase() === address.toLowerCase()
        })
      })
      if (res) return res
    }, [recipientInputValue, walletsList])

    const existingResult = existingContactMatch ?? existingWalletMatch

    const showNameServiceResults = useMemo(() => {
      const allowedTopLevelDomains = [
        ...Object.keys(addressPrefixes), // for ibcdomains, icns, stargazenames
        'arch', // for archId
        'sol', // for injective .sol domains by SNS
        ...['sei', 'pp'], // for degeNS
        'core', // for bdd
        'i', //for celestials.id
      ]
      // ex: leap.arch --> name = leap, domain = arch
      const [, domain] = recipientInputValue.split('.')
      const isValidDomain = allowedTopLevelDomains.indexOf(domain) !== -1
      return nameServiceMatcher.test(recipientInputValue) && isValidDomain
    }, [recipientInputValue, addressPrefixes])

    const chains = chainInfoStore.chainInfos
    const chainFeatureFlags = chainFeatureFlagsStore?.chainFeatureFlagsData

    const minitiaChains = useMemo(() => {
      const _minitiaChains: ChainInfo[] = []
      Object.keys(chainFeatureFlags)
        .filter((chain) => chainFeatureFlags?.[chain]?.chainType === 'minitia')
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
    }, [chainFeatureFlags, chains, selectedNetwork, chainInfoStore?.chainInfos])

    useCheckAddressError({
      setAddressError,
      setAddressWarning,
      recipientInputValue,
      showNameServiceResults,
      sendActiveChain,
    })

    useEffect(() => {
      if (recipient) {
        setRecipientInputValue(recipient)
        // setInputInProgress(true)
        if (
          !isValidAddress(recipientInputValue) &&
          !isEthAddress(recipientInputValue) &&
          !isAptosAddress(recipientInputValue) &&
          !isSolanaAddress(recipientInputValue)
        ) {
          return
        }
        setSelectedAddress({
          address: recipient,
          ethAddress: recipient,
          name: sliceAddress(recipient),
          avatarIcon: existingWalletMatch?.avatar || '',
          selectionType: 'notSaved',
          chainIcon: '',
          chainName: '',
          emoji: undefined,
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipient])

    const handledSelectedAddress = useCallback(
      (address: string) => {
        if (!address) {
          return
        }
        setMemo('')
        try {
          if (address.length === 0) {
            setAddressError(undefined)
            return
          }

          let chain: SupportedChain = 'cosmos'
          try {
            if (isAptosAddress(address)) {
              chain = 'movement'
            } else if (isEthAddress(address)) {
              chain = 'ethereum' as SupportedChain
            } else if (address.startsWith('tb1q')) {
              chain = 'bitcoinSignet'
            } else if (address.startsWith('bc1q')) {
              chain = 'bitcoin'
            } else {
              const { prefix } = bech32.decode(address)
              chain = addressPrefixes[prefix] as SupportedChain
              if (prefix === 'init') {
                setShowSelectChain(true)
                return
              }
            }
          } catch {
            if (isSolanaAddress(address)) {
              chain = 'solana'
            } else {
              throw new Error('Invalid Address')
            }
          }

          setSelectedAddress({
            address,
            ethAddress: address,
            name: existingResult ? existingResult.name : '',
            avatarIcon: existingWalletMatch?.avatar || '',
            selectionType: existingResult ? 'saved' : 'notSaved',
            chainIcon: '',
            chainName: chain,
            emoji: undefined,
          })
          setInputInProgress(false)
        } catch (err) {
          if (!(err as Error)?.message?.includes('too short')) {
            setAddressError('Invalid Address')
          }
        }
      },
      [
        addressPrefixes,
        existingResult,
        existingWalletMatch?.avatar,
        setAddressError,
        setMemo,
        setSelectedAddress,
        setInputInProgress,
      ],
    )

    const handleSelectRecipient = useCallback(() => {
      const cleanInputValue = recipientInputValue?.trim()
      handledSelectedAddress(cleanInputValue)
    }, [recipientInputValue, handledSelectedAddress])

    const actionPaste = useCallback(() => {
      UserClipboard.pasteText()
        .then((text) => {
          if (!text) return
          setRecipientInputValue(text.trim())
          handledSelectedAddress(text.trim())
        })
        .catch(() => {
          //
        })
      if (ref && 'current' in ref) {
        ref.current?.focus()
      }
    }, [ref, setRecipientInputValue, handledSelectedAddress])

    const handleContactSelect = useCallback(
      (s: SelectedAddress) => {
        setAddressError(undefined)
        setSelectedAddress(s)
        setEthAddress(s.ethAddress ?? '')
        setRecipientInputValue(s.address ?? '')
        setInputInProgress(false)
      },
      [
        setAddressError,
        setEthAddress,
        setSelectedAddress,
        setRecipientInputValue,
        setInputInProgress,
      ],
    )

    const showError = !showNameServiceResults && addressError
    const showRecipientPlaceholder =
      recipientInputValue?.length > 0 &&
      debouncedRecipientInputValue?.length > 0 &&
      !addressError &&
      !addressError &&
      !showNameServiceResults

    return (
      <div className='flex flex-col justify-start items-start'>
        <div className='flex justify-between items-center w-full gap-2'>
          <input
            ref={ref}
            className={cn(
              'flex-1 h-8 bg-transparent text-[18px] text-monochrome placeholder:text-muted-foreground placeholder:text-[18px] placeholder:font-bold font-bold text-foreground ring-0 outline-none caret-accent-green',
              isSidePanel() ? '!min-w-0' : '',
            )}
            placeholder={'Enter address'}
            value={recipientInputValue}
            onChange={(e) => {
              setInputInProgress(true)
              setRecipientInputValue(e.target.value)
              // should update the selected address if this value is modified
            }}
          />
          <div className='flex flex-row justify-end items-center shrink-0 gap-2'>
            {!recipientInputValue && (
              <button
                key='paste'
                className='rounded-lg font-bold text-sm py-2 tracking-normal px-[10px] !leading-[16px] bg-secondary-200 hover:bg-secondary-300 transition-colors duration-200 cursor-pointer'
                onClick={actionPaste}
              >
                Paste
              </button>
            )}
            {!recipientInputValue && (
              <button
                className='p-1.5 rounded-lg bg-secondary-200 hover:bg-secondary-300 transition-colors duration-200 cursor-pointer'
                onClick={() => {
                  setShowSelectRecipient(true)
                }}
              >
                <ContactCalenderIcon className='text-foreground p-[2px]' size={20} />
              </button>
            )}
          </div>
        </div>

        {showError || showRecipientPlaceholder || showNameServiceResults ? (
          <div className='w-full h-[1px] mt-5 bg-secondary-300' />
        ) : null}

        {showError ? (
          <div className='text-sm text-destructive-100 font-medium leading-[19px] mt-5'>
            {addressError}
          </div>
        ) : null}

        {showRecipientPlaceholder ? (
          <button
            className={'w-full flex items-center gap-3 cursor-pointer mt-5'}
            onClick={handleSelectRecipient}
          >
            <div className='flex justify-between items-center w-full'>
              <div className='flex items-center gap-4'>
                <img
                  className='h-11 w-11 rounded-full'
                  src={existingWalletMatch?.avatar || Images.Misc.getWalletIconAtIndex(0)}
                />
                <div className='flex flex-col'>
                  {existingResult && (
                    <p className='font-bold text-left text-monochrome text-sm capitalize'>
                      {existingResult.name}
                    </p>
                  )}
                  {existingResult ? (
                    <p className='text-sm text-muted-foreground text-left'>
                      {sliceAddress(recipientInputValue)}
                    </p>
                  ) : (
                    <p className='font-bold text-left text-monochrome text-sm'>
                      {sliceAddress(recipientInputValue)}
                    </p>
                  )}
                </div>
              </div>
              <CaretRight className='text-muted-foreground' size={16} />
            </div>
          </button>
        ) : null}

        {showNameServiceResults ? (
          <NameServiceMatchList
            address={recipientInputValue}
            handleContactSelect={handleContactSelect}
          />
        ) : null}

        <SelectChain
          isOpen={showSelectChain}
          onClose={() => setShowSelectChain(false)}
          setSelectedAddress={(s) => {
            setSelectedAddress(s)
            setShowSelectChain(false)
            setInputInProgress(false)
          }}
          address={recipientInputValue}
          forceName={existingResult ? existingResult.name : undefined}
          wallet={existingWalletMatch}
          chainList={minitiaChains.map((chain) => chain.key)}
        />
      </div>
    )
  },
)

InputCard.displayName = 'InputCard'

export default observer(InputCard)
