import {
  nameServices,
  SelectedAddress,
  sliceAddress,
  useNameServiceResolver,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { GenericLight, getChainImage } from 'images/logos'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { AddressBook } from 'utils/addressbook'
import { Bech32Address } from 'utils/bech32'

const NameServiceItemSkeleton = () => {
  return (
    <div className='flex'>
      <Skeleton className='rounded-full h-10 w-10 bg-gray-50 dark:bg-gray-800' />
      <div className='ml-2'>
        <Skeleton className='h-4 w-32 bg-gray-50 dark:bg-gray-800' />
        <Skeleton className='h-2 w-20 bg-gray-100 dark:bg-gray-800' />
      </div>
    </div>
  )
}

type ContactsMatchListProps = {
  contacts: AddressBook.SavedAddress[]
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
          const chainImage = Images.Logos.getChainImage(contact.blockchain)

          return (
            <li
              key={contact.address}
              className='flex items-center ml-0 py-1 cursor-pointer'
              onClick={() => {
                handleContactSelect({
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
  handleContactSelect: (contact: SelectedAddress) => void
}

export const NameServiceMatchList: React.FC<NameServiceMatchListProps> = ({
  address,
  handleContactSelect,
}) => {
  const network = useSelectedNetwork()
  const chainInfos = useChainInfos()

  const nameServiceResults = useNameServiceResolver(address, network)

  const resultsList = useMemo(() => {
    const entries = Object.entries(nameServiceResults)
    if (entries.some(([, result]) => result.status === 'loading')) {
      return {
        status: 'loading',
      }
    }

    return {
      status: 'done',
      data: entries.filter(([, result]) => result.status === 'success' && result.data),
    }
  }, [nameServiceResults])

  return (
    <div className='mt-4'>
      <Text size='sm' className='text-gray-600 dark:text-gray-200'>
        &quot;{address}&quot; from different name services
      </Text>
      {resultsList.status === 'done' ? (
        <>
          {resultsList.data && resultsList.data.length > 0 ? (
            <ul className='list-none space-y-2 mt-2 max-h-[180px] overflow-y-auto'>
              {resultsList.data.map(([nameService, result]) => {
                const nameServiceImg = Images.Logos.getNameServiceLogo(nameService)
                const chain = Bech32Address.getChainKey(result?.data)

                return (
                  <li
                    key={nameService}
                    className={`flex items-center ml-0 py-1 ${
                      result.status === 'success' && result?.data
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (result.status === 'success' && result?.data) {
                        handleContactSelect({
                          avatarIcon: nameServiceImg,
                          chainIcon: chain ? getChainImage(chain) : GenericLight,
                          chainName: chainInfos[chain as SupportedChain].chainName,
                          name: address,
                          address: result.data,
                          //@ts-ignore
                          emoji: undefined,
                          selectionType: 'nameService',
                          information: {
                            nameService: nameServices[nameService],
                          },
                        })
                      }
                    }}
                  >
                    <Avatar
                      avatarImage={nameServiceImg}
                      size='sm'
                      className='mr-2 rounded-full overflow-hidden'
                    />
                    <div>
                      <Text size='md' color='text-gray-800 dark:text-gray-100'>
                        {nameServices[nameService]}
                      </Text>
                      <Text size='sm' color='text-gray-600 dark:text-gray-400'>
                        {result.status === 'loading'
                          ? 'Loading...'
                          : result?.data
                          ? sliceAddress(result.data)
                          : 'Not Found'}
                      </Text>
                    </div>
                  </li>
                )
              })}
            </ul>
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
