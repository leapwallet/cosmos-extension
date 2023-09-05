import { Images } from 'images'
import React from 'react'

export function CollectionCardLoading() {
  return (
    <div className='rounded-2xl border dark:border-gray-900 mb-4'>
      <div className='grid grid-cols-2 gap-4 p-4'>
        {new Array(3).fill(0).map((value, index) => {
          return (
            <div
              key={`${value}-${index}`}
              className='rounded bg-gray-200 dark:bg-gray-900 aspect-square flex items-center justify-center'
            >
              <img src={Images.Misc.NFTImageLoading} className='animate-spin'></img>
            </div>
          )
        })}
      </div>
    </div>
  )
}
