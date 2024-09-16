import { EyeSlash } from '@phosphor-icons/react'
import React from 'react'

export function AllNftsHidden() {
  return (
    <div className='w-full h-[350px] flex text-center'>
      <div className='m-auto'>
        <div className='m-auto w-[50px] h-[50px] rounded-full bg-gray-800 flex'>
          <EyeSlash size={24} className='w-6 h-6 m-auto text-gray-200' />
        </div>
        <p className='text-gray-800 dark:text-white-100 mt-2'>NFTs Hidden</p>
        <p className='text-gray-300'>Looks like your all NFTs are hidden</p>
      </div>
    </div>
  )
}
