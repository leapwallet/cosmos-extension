import { OptionPlatformConfig, QuickSearchOption } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { imgOnError } from 'utils/imgOnError'

import { searchModalEnteredOptionState } from '../../atoms/search-modal'

type QuickSearchOptionsProps = {
  suggestionsList: QuickSearchOption[]
  activeSearchOption: number
  // eslint-disable-next-line no-unused-vars
  handleOptionClick: (config: OptionPlatformConfig, optionIndex: number, actionName: string) => void
}

export function QuickSearchOptions({
  suggestionsList,
  activeSearchOption,
  handleOptionClick,
}: QuickSearchOptionsProps) {
  const searchModalEnteredOption = useRecoilValue(searchModalEnteredOptionState)
  const defaultTokenLogo = useDefaultTokenLogo()

  useEffect(() => {
    if (suggestionsList.length && searchModalEnteredOption !== null) {
      const option = suggestionsList.filter((_, index) => index === searchModalEnteredOption)
      if (option.length) {
        handleOptionClick(
          option[0].extension_config as OptionPlatformConfig,
          searchModalEnteredOption,
          option[0].action_name,
        )
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchModalEnteredOption, suggestionsList])

  return suggestionsList.length ? (
    <>
      <p className='dark:text-gray-500 text-sm px-6'>Suggestions</p>
      <ul
        className='px-3 flex flex-col gap-2 mt-2 overflow-y-auto h-[372px] outline-none'
        tabIndex={0}
      >
        {suggestionsList.map(({ action_name, action_icon_url, extension_config, tags }, index) => (
          <li
            key={action_name}
            data-search-active-option-id={`search-active-option-id-${index}`}
            className={classNames(
              'flex gap-3 dark:text-white-100 m-0 text-base px-3 py-2 rounded-2xl cursor-pointer border border-transparent hover:dark:border-gray-900 hover:bg-gray-900 transition-colors duration-75',
              {
                'bg-gray-900 dark:border-gray-800 hover:dark:border-gray-800':
                  index === activeSearchOption,
              },
            )}
            onClick={() =>
              handleOptionClick(extension_config as OptionPlatformConfig, index, action_name)
            }
          >
            <div className='w-[24px] h-[24px] flex items-center justify-center'>
              <img
                className='invert dark:invert-0'
                src={action_icon_url ?? defaultTokenLogo}
                alt=''
                onError={imgOnError(defaultTokenLogo)}
              />
            </div>

            {action_name}
            {tags.length
              ? tags.map((tag) => (
                  <span
                    key={tag.name}
                    className='text-[9px] rounded-[5px] inline-block flex items-center justify-center h-[17px] px-[3px] -ml-[6px]'
                    style={{ backgroundColor: tag.background_color }}
                  >
                    {tag.name}
                  </span>
                ))
              : null}
          </li>
        ))}
      </ul>
    </>
  ) : (
    <>
      <div className='w-full h-[380px] flex flex-col items-center justify-center'>
        <div className='rounded-full bg-gray-50 dark:bg-gray-800 p-[18px] w-[60px] h-[60px] flex'>
          <div
            className='material-icons-round w-6 h-6 text-gray-200 -mt-[2px] -ml-[2px]'
            style={{ fontSize: '30px' }}
          >
            search
          </div>
        </div>
        <div className='font-bold text-gray-800 dark:text-white-100 text-base mt-3'>
          No Result found
        </div>
        <div className='text-gray-400 font-medium text-sm'>
          We couldn&apos;t find any result on your search
        </div>
      </div>
    </>
  )
}
