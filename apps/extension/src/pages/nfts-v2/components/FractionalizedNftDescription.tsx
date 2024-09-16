import { FractionalizedNftInformation } from '@leapwallet/cosmos-wallet-hooks'
import { MapPin } from '@phosphor-icons/react'
import React, { useMemo } from 'react'

import { NonFractionalizedNftDescriptionProps } from './index'

type RoomsCountProps = {
  noOfRooms: string
  roomTitle: string
}

function RoomsCount({ noOfRooms, roomTitle }: RoomsCountProps) {
  return (
    <p className='rounded-xl px-3 py-2 mr-2 min-w-[80px] flex-1 flex justify-between border dark:border-gray-900 border-gray-100 border-solid flex-wrap gap-3'>
      <span className='text-gray-400 dark:text-gray-200 text-sm'>{roomTitle}</span>
      <span className='text-gray-900 text-base dark:text-white-100 font-bold'>{noOfRooms}</span>
    </p>
  )
}

export function FractionalizedNftDescription({ nftDetails }: NonFractionalizedNftDescriptionProps) {
  const { towerName, location, noOfBathrooms, noOfBedrooms, additionalFeatures, yourAllocations } =
    useMemo(() => {
      const _nftDetails = nftDetails as unknown as FractionalizedNftInformation

      return {
        towerName: _nftDetails['Tower Name'],
        location: _nftDetails['Address'],
        noOfBathrooms: _nftDetails['Number of Bathrooms'],
        noOfBedrooms: _nftDetails['Number of Bedrooms'],
        additionalFeatures: _nftDetails['Additional Features'],
        yourAllocations: nftDetails?.extension?.allocations ?? 0,
      }
    }, [nftDetails])

  return (
    <>
      <h3 className='font-bold text-left text-gray-400 text-sm mt-4'>{towerName ?? ''}</h3>

      {location ? (
        <p className='text-left text-gray-900 dark:text-gray-50 text-xs mt-2 flex items-center gap-1'>
          <MapPin size={16} className='text-gray-900 dark:text-gray-50' /> {location}
        </p>
      ) : null}

      {yourAllocations ? (
        <div className='flex space-between gap-1 mt-4'>
          <RoomsCount noOfRooms={yourAllocations} roomTitle='Your Allocations' />
        </div>
      ) : null}

      <div className='flex space-between gap-1 my-4'>
        {noOfBathrooms ? <RoomsCount noOfRooms={noOfBathrooms} roomTitle='Bathrooms' /> : null}
        {noOfBedrooms ? <RoomsCount noOfRooms={noOfBedrooms} roomTitle='Bedrooms' /> : null}
      </div>

      {additionalFeatures ? (
        <ul className='flex flex-col'>
          <p className='font-bold text-left text-gray-400 text-sm mb-1'>Additional Features</p>

          {additionalFeatures.map((feature, index) => (
            <li key={`${feature}-${index}`} className='text-gray-900 dark:text-gray-100 text-sm'>
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
