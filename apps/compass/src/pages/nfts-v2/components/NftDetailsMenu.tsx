import classNames from 'classnames'
import { Images } from 'images'
import React from 'react'
import { isSidePanel } from 'utils/isSidePanel'

type NftDetailsMenuProps = {
  handleProfileClick: VoidFunction
  isInProfile: boolean
  showProfileOption: boolean
  handleHideNftClick: VoidFunction
  isInHiddenNfts: boolean
}

export function NftDetailsMenu({
  handleProfileClick,
  isInProfile,
  showProfileOption,
  handleHideNftClick,
  isInHiddenNfts,
}: NftDetailsMenuProps) {
  return (
    <div
      className={classNames(
        'absolute w-[344px] rounded-2xl border border-[0.5px] border-gray-50 dark:border-gray-100 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white-100',
        {
          '!w-[calc(100%-56px)]': isSidePanel(),
        },
      )}
    >
      {showProfileOption && (
        <div className='flex px-3 py-4 cursor-pointer' onClick={handleProfileClick}>
          <img className='mr-3 invert dark:invert-0' src={Images.Misc.NftProfile} alt='profile' />
          {isInProfile ? 'Remove from' : 'Set as'} profile avatar
        </div>
      )}

      <div className='flex px-3 py-4 cursor-pointer' onClick={handleHideNftClick}>
        {isInHiddenNfts ? (
          <>
            <img
              className='mr-3 invert dark:invert-0'
              src={Images.Misc.UnhideNft}
              alt='unhide nft'
            />
            Unhide NFT
          </>
        ) : (
          <>
            <img className='mr-3 invert dark:invert-0' src={Images.Misc.HideNft} alt='hide nft' />
            Hide NFT
          </>
        )}
      </div>
    </div>
  )
}
