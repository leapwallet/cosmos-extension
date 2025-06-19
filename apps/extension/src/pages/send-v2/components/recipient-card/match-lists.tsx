import {
  SelectedAddress,
  sliceAddress,
  useActiveChain,
  useGetChains,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { Avatar } from '@leapwallet/leap-ui'
import Text from 'components/text'
import {
  NameServiceResolveResult,
  nameServices,
  useNameServiceResolver,
} from 'hooks/nameService/useNameService'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { AggregatedSupportedChain } from 'types/utility'
import { AddressBook } from 'utils/addressbook'
import { Bech32Address } from 'utils/bech32'

const NameServiceItemSkeleton = () => {
  return (
    <div className='flex px-2 py-2 min-w-[344px] z-0'>
      <div className='w-10 '>
        <Skeleton
          circle
          className='w-10 h-10'
          style={{
            zIndex: 0,
          }}
        />
      </div>
      <div className='w-[250px] z-0 ml-2'>
        <Skeleton count={1} className='z-0' />
        <Skeleton count={1} className='z-0' />
      </div>
    </div>
  )
}

type ContactsMatchListProps = {
  contacts: AddressBook.SavedAddress[]
  // eslint-disable-next-line no-unused-vars
  handleContactSelect: (contact: SelectedAddress) => void
}

export const ContactsMatchList: React.FC<ContactsMatchListProps> = ({
  contacts,
  handleContactSelect,
}) => {
  const chainInfos = useChainInfos()

  return (
    <div className='mt-4'>
      <Text size='sm' className='text-gray-600 dark:text-gray-200'>
        From your contacts
      </Text>
      <ul className='list-none space-y-2 mt-2 max-h-[180px] overflow-y-auto'>
        {contacts.map((contact) => {
          const chainImage = chainInfos[contact.blockchain].chainSymbolImageUrl

          return (
            <li
              key={contact.address}
              className='flex items-center ml-0 py-1 cursor-pointer'
              onClick={() => {
                handleContactSelect({
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  avatarIcon: undefined,
                  chainIcon: chainImage ?? GenericLight,
                  chainName: chainInfos[contact.blockchain].chainName,
                  name: contact.name,
                  address: contact.address,
                  emoji: contact.emoji,
                  selectionType: 'saved',
                })
              }}
            >
              <Avatar
                chainIcon={chainImage}
                emoji={contact.emoji ?? 1}
                size='sm'
                className='mr-2'
              />
              <div>
                <Text size='md' color='text-gray-800 dark:text-gray-100'>
                  {contact.name}
                </Text>
                <Text size='sm' color='text-gray-600 dark:text-gray-400'>
                  {sliceAddress(contact.address)}
                </Text>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type NameServiceMatchListProps = {
  address: string
  // eslint-disable-next-line no-unused-vars
  handleContactSelect: (contact: SelectedAddress) => void
}

export const NameServiceMatchList: React.FC<NameServiceMatchListProps> = ({
  address,
  handleContactSelect,
}) => {
  const network = useSelectedNetwork()
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const chains = useGetChains()

  const [isLoading, nameServiceResults] = useNameServiceResolver(address, network)

  const resultsList: [string, NameServiceResolveResult | null][] = useMemo(() => {
    const entries = Object.entries(nameServiceResults)

    return entries.filter(([, result]) => result !== null)
  }, [nameServiceResults])

  let anyResultsForCurrentChain = false

  return (
    <div className='mt-4'>
      <Text size='sm' className='text-gray-600 dark:text-gray-200'>
        Available addresses for &quot;{address}&quot;
      </Text>
      {!isLoading ? (
        <>
          {resultsList && resultsList.length > 0 ? (
            <>
              <ul className='list-none space-y-2 mt-2 max-h-[180px] overflow-y-auto'>
                {resultsList.map(([nameService, result]) => {
                  const nameServiceImg = Images.Logos.getNameServiceLogo(nameService)
                  if (result && typeof result === 'string') {
                    const chain = Bech32Address.getChainKey(result)
                    return (
                      <MatchListItem
                        key={`${nameService}-${result}`}
                        title={nameService}
                        address={result}
                        nameServiceImg={nameServiceImg}
                        handleClick={() => {
                          handleContactSelect({
                            avatarIcon: nameServiceImg,
                            chainIcon: chain
                              ? chainInfos[chain].chainSymbolImageUrl ?? GenericLight
                              : GenericLight,
                            chainName: chain ? chainInfos[chain].chainName : 'Chain',
                            name: address,
                            address: result,
                            emoji: undefined,
                            selectionType: 'nameService',
                            information: {
                              nameService: nameServices[nameService],
                              chain_id: chain ? chainInfos[chain].chainName : null,
                            },
                          })
                        }}
                      />
                    )
                  }

                  if (result && Array.isArray(result)) {
                    const filteredItems = result
                      .map(({ chain_id, address: resolvedAddress }) => {
                        const chain = Bech32Address.getChainKey(resolvedAddress)
                        const chainDetails = Object.values(chainInfos).find(
                          (chain) => chain.chainId === chain_id,
                        )
                        const chainImage = chainDetails?.chainSymbolImageUrl ?? GenericLight

                        let shouldShow = true
                        if (activeChain !== 'aggregated') {
                          if (chains[activeChain]?.evmOnlyChain) {
                            //If active chain is EVM, only show addresses on the same chain
                            if (chainDetails?.key !== activeChain) shouldShow = false
                          } else {
                            // If active chain is non-EVM, filter out EVM addresses
                            if (resolvedAddress.startsWith('0x')) shouldShow = false
                          }
                        }

                        if (shouldShow) {
                          anyResultsForCurrentChain = true
                          return (
                            <MatchListItem
                              title={chainDetails?.chainName ?? nameService}
                              key={`${nameService}-${chain_id}-${resolvedAddress}`}
                              address={resolvedAddress}
                              nameServiceImg={nameServiceImg}
                              chainIcon={chainImage}
                              handleClick={() => {
                                handleContactSelect({
                                  avatarIcon: nameServiceImg,
                                  chainIcon: chainImage,
                                  chainName: chainDetails?.chainName ?? 'Chain',
                                  name: address,
                                  address: resolvedAddress,
                                  emoji: undefined,
                                  selectionType: 'nameService',
                                  information: {
                                    nameService: nameServices[nameService],
                                    chain_id,
                                  },
                                })
                              }}
                            />
                          )
                        }
                        return null
                      })
                      .filter(Boolean)

                    return filteredItems.length > 0 ? <>{filteredItems}</> : null
                  }
                  return null
                })}
              </ul>

              {!anyResultsForCurrentChain && activeChain !== 'aggregated' && (
                <p className='text-sm font-bold text-red-300 mt-2'>
                  No results found for {chains[activeChain]?.chainName || activeChain}
                </p>
              )}
            </>
          ) : (
            <p className='text-sm font-bold text-red-300 mt-2'>
              No results found in any name service
            </p>
          )}
        </>
      ) : (
        <div className='space-y-1 mt-2'>
          <NameServiceItemSkeleton />
          <NameServiceItemSkeleton />
          <NameServiceItemSkeleton />
        </div>
      )}
    </div>
  )
}

const MatchListItem: React.FC<{
  address: string
  title: string
  nameServiceImg: string
  chainIcon?: string
  handleClick: () => void
}> = ({ address, title, nameServiceImg, chainIcon, handleClick }) => (
  <li className='flex items-center ml-0 py-1 cursor-pointer' onClick={handleClick}>
    <Avatar
      size='sm'
      avatarImage={nameServiceImg}
      chainIcon={chainIcon}
      className='mr-2 rounded-full bg-gray-200 dark:bg-gray-800 !h-10 !w-10'
    />
    <div>
      <Text size='md' color='text-gray-800 dark:text-gray-100'>
        {title}
      </Text>
      <Text size='sm' color='text-gray-600 dark:text-gray-400'>
        {sliceAddress(address)}
      </Text>
    </div>
  </li>
)
