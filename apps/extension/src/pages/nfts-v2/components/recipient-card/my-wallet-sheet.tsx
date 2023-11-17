import { Key, SelectedAddress, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { InputWithButton } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { formatWalletName } from 'utils/formatWalletName'
import { capitalize } from 'utils/strings'

type MyWalletSheetProps = {
  isOpen: boolean
  onClose: () => void
  // eslint-disable-next-line no-unused-vars
  setSelectedAddress: (address: SelectedAddress) => void
}

export const MyWalletSheet: React.FC<MyWalletSheetProps> = ({
  isOpen,
  onClose,
  setSelectedAddress,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedQuery = searchQuery.trim()

  const { ibcSupportData, isIbcSupportDataLoading } = {
    ibcSupportData: {},
    isIbcSupportDataLoading: false,
  }

  const {
    activeWallet: { addresses, name, colorIndex },
  } = useActiveWallet() as {
    activeWallet: Key
  }
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()

  const displayAccounts = useMemo(() => {
    if (addresses && !isIbcSupportDataLoading && ibcSupportData) {
      return Object.entries(addresses).filter(([chain]) => {
        const chainInfo = chainInfos[chain as SupportedChain]
        const chainRegistryPath = chainInfo?.chainRegistryPath

        return chainInfo?.enabled && chain.includes(trimmedQuery)
      })
    }
    return []
  }, [addresses, chainInfos, ibcSupportData, isIbcSupportDataLoading, trimmedQuery])

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
            <InputWithButton
              icon={Images.Misc.Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                      const isFirst = index === 0
                      const isLast = index === displayAccounts.length - 1

                      return (
                        <React.Fragment key={_chain}>
                          <button
                            className={`card-container w-full flex-row items-center py-3 px-4 ${
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
                              alt={`${chain} logo`}
                              className='rounded-full border border-white-30 h-10 w-10'
                            />
                            <p className='font-bold dark:text-white-100 text-gray-700 capitalize ml-2'>
                              {chain}
                            </p>
                            <img
                              className='ml-auto'
                              src={Images.Misc.RightArrow}
                              alt='Right Arrow'
                            />
                          </button>
                          {!isLast && (
                            <div className='w-full bg-gray-100 dark:bg-gray-800 h-[1px]' />
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
