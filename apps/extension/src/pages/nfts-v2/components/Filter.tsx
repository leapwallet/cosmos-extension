import { Images } from 'images'
import React from 'react'

type FilterProps = {
  readonly searchedText: string
  readonly setSearchedText: React.Dispatch<React.SetStateAction<string>>
  readonly onClickSortBy: VoidFunction
}

export function Filter({ searchedText, setSearchedText, onClickSortBy }: FilterProps) {
  return (
    <div className='flex justify-between items-center mb-4'>
      <div className='flex-1 flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
        <input
          type='text'
          value={searchedText}
          placeholder='search by nft collection/name...'
          className='flex flex-grow font-medium text-base text-gray-600 dark:text-gray-400 outline-none bg-white-0'
          onChange={(e) => setSearchedText(e.target?.value)}
        />

        {searchedText.length > 0 ? (
          <span
            onClick={() => setSearchedText('')}
            className='material-icons-round h-8 w-8 cursor-pointer text-center text-gray-400'
          >
            close
          </span>
        ) : (
          <img src={Images.Misc.SearchIcon} />
        )}
      </div>

      <div
        onClick={onClickSortBy}
        className='rounded-3xl h-10 w-10 cursor-pointer ml-3 justify-center items-center dark:bg-gray-900 bg-white-100'
      >
        <span className='material-icons-round  h-10 w-10 mt-2 text-center text-gray-400'>sort</span>
      </div>
    </div>
  )
}
