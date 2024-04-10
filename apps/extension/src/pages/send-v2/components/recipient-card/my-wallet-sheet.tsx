import { Key, SelectedAddress, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import Loader from 'components/loader/Loader'
import { SearchInput } from 'components/search-input'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { formatWalletName } from 'utils/formatWalletName'
import { capitalize } from 'utils/strings'

import { SendContextType, useSendContext } from '../../context'

type MyWalletSheetProps = {
  isOpen: boolean
  onClose: () => void
  setSelectedAddress: (address: SelectedAddress) => void
  skipSupportedDestinationChainsIDs: string[]
}

export const MyWalletSheet: React.FC<MyWalletSheetProps> = ({
  isOpen,
  onClose,
  setSelectedAddress,
  skipSupportedDestinationChainsIDs,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedQuery = searchQuery.trim()

  const { displayAccounts: _displayMyAccounts, isIbcSupportDataLoading } =
    useSendContext() as SendContextType

  const {
    activeWallet: { name, colorIndex },
  } = useActiveWallet() as {
    activeWallet: Key
  }
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()
  const activeWallet = useActiveWallet()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _displaySkipAccounts: any[][] = []
  Object.keys(chainInfos).map((chain) => {
    if (skipSupportedDestinationChainsIDs?.includes(chainInfos[chain as SupportedChain]?.chainId)) {
      _displaySkipAccounts.push([
        chain,
        activeWallet?.activeWallet?.addresses?.[chain as SupportedChain],
      ])
    }
  })

  const _displayAccounts =
    _displaySkipAccounts.length > 0 ? _displaySkipAccounts : _displayMyAccounts

  const displayAccounts = useMemo(
    () =>
      _displayAccounts.filter(([chain]) => {
        const chainName = chainInfos[chain as SupportedChain]?.chainName ?? chain
        return chainName.toLowerCase().includes(trimmedQuery.toLowerCase())
      }),
    [_displayAccounts, chainInfos, trimmedQuery],
  )

  const toChainId = useQuery().get('toChainId') ?? undefined

  useEffect(() => {
    if (toChainId && displayAccounts?.length > 0) {
      const chainKey = Object.values(chainInfos).find((chain) => chain.chainId === toChainId)?.key
      const toChain = displayAccounts.filter(([_chain]) => _chain === chainKey)?.[0]
      const img = chainInfos[chainKey as SupportedChain]?.chainSymbolImageUrl ?? defaultTokenLogo

      setSelectedAddress({
        address: toChain?.[1],
        avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex),
        chainIcon: img ?? '',
        chainName: toChain?.[0],
        emoji: undefined,
        name: `${name.length > 12 ? `${name.slice(0, 12)}...` : name} - ${capitalize(
          toChain?.[0],
        )}`,
        selectionType: 'currentWallet',
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toChainId, displayAccounts?.length > 0, activeChain])

  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      title='Choose Recipient Wallet'
      onClose={onClose}
    >
      <div>
        {isIbcSupportDataLoading ? (
          <div className='bg-white-100 dark:bg-gray-900 rounded-2xl p-3 relative h-48 w-full'>
            <Text size='xs' className='p-1 font-bold' color='text-gray-600 dark:text-gray-200'>
              Loading IBC Supported Chains
            </Text>
            <Loader />
          </div>
        ) : (
          <>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder='Search chains...'
            />

            <div className='bg-white-100 dark:bg-gray-900 rounded-2xl p-4 relative mt-4'>
              {displayAccounts.length > 0 ? (
                <>
                  <div className='flex justify-between items-center'>
                    <Text
                      size='xs'
                      className='p-1 font-bold'
                      color='text-gray-600 dark:text-gray-200'
                    >
                      Other chains in current wallet: {formatWalletName(name)}
                    </Text>
                  </div>
                  <div className='mt-2'>
                    {displayAccounts.map(([_chain, address], index) => {
                      const chain = _chain as unknown as SupportedChain
                      const img = chainInfos[chain]?.chainSymbolImageUrl ?? defaultTokenLogo
                      const chainName = chainInfos[chain]?.chainName ?? chain
                      const isFirst = index === 0
                      const isLast = index === displayAccounts.length - 1

                      return (
                        <React.Fragment key={_chain}>
                          <button
                            style={{ paddingLeft: 0, paddingRight: 0 }}
                            className={`card-container w-full flex-row items-center py-3 ${
                              isFirst || isLast ? 'rounded-2xl' : ''
                            }`}
                            onClick={() => {
                              setSelectedAddress({
                                address: address,
                                avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex),
                                chainIcon: img ?? '',
                                chainName: chain,
                                emoji: undefined,
                                name: `${
                                  name.length > 12 ? `${name.slice(0, 12)}...` : name
                                } - ${capitalize(chain)}`,
                                selectionType: 'currentWallet',
                              })
                              onClose()
                            }}
                          >
                            <img
                              src={img}
                              alt={`${chainName} logo`}
                              className='rounded-full border border-white-30 h-10 w-10'
                            />
                            <p className='font-bold dark:text-white-100 text-gray-700 capitalize ml-2'>
                              {chainName}
                            </p>
                            <img
                              className='ml-auto'
                              src={Images.Misc.RightArrow}
                              alt='Right Arrow'
                            />
                          </button>

                          {!isLast && (
                            <div className='w-full flex'>
                              <CardDivider />
                            </div>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </>
              ) : (
                <EmptyCard
                  src={
                    trimmedQuery.length > 0 ? Images.Misc.NoSearchResult : Images.Misc.Blockchain
                  }
                  heading='No Chain Found'
                  subHeading={
                    trimmedQuery.length > 0
                      ? `No chains found for "${trimmedQuery}"`
                      : `No chains support IBC with ${chainInfos[activeChain].chainName}`
                  }
                  classname='!px-0 !py-5 !w-full justify-center'
                />
              )}
            </div>
          </>
        )}
      </div>
    </BottomModal>
  )
}
