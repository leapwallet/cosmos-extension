import classNames from 'classnames'
import React, { Dispatch, SetStateAction, useMemo, useState } from 'react'

export function SortingButton({
  sortBy,
  sortDir,
  defaultSortBy = '',
  defaultSortDir = '',
  setSortBy,
  setSortDir,
  classNamesObj,
  label,
  sortName,
  showEmptySymbolArea = false,
}: {
  sortBy: string
  sortDir: string
  defaultSortBy?: string
  defaultSortDir?: string
  setSortDir: Dispatch<SetStateAction<string>>
  setSortBy: Dispatch<SetStateAction<string>>
  classNamesObj?: {
    outerContainer?: string
    symbol?: string
  }
  sortName: string
  label: string
  showEmptySymbolArea?: boolean
}) {
  const [isHovered, setisHovered] = useState<boolean>(false)
  const symbol = useMemo(() => {
    if (sortBy === sortName) {
      if (sortDir === 'asc') {
        return isHovered === true ? 'south' : 'north'
      } else {
        return isHovered === true ? '' : 'south'
      }
    } else {
      return isHovered === true ? 'north' : ''
    }
  }, [isHovered, sortBy, sortDir, sortName])

  return (
    <button
      className={classNames(
        'group flex cursor-pointer flex-row items-center justify-start gap-[10px] text-sm font-black !leading-[20px] text-black-100 dark:text-white-100',
        classNamesObj?.outerContainer,
      )}
      id='sorting-button'
      onClick={() => {
        if (sortBy === sortName) {
          if (sortDir === 'asc') {
            setSortDir('dsc')
          } else {
            setSortDir(defaultSortDir)
            setSortBy(defaultSortBy)
          }
        } else {
          setSortBy(sortName)
          setSortDir('asc')
        }
      }}
    >
      {label}
      {
        <div
          className={classNames(
            'material-icons-round !h-[12px] !w-[12px] flex-row items-center justify-center !text-xs !leading-[12px] !text-gray-500 group-hover:!text-black-100 dark:!text-gray-500 dark:group-hover:!text-white-100',
            classNamesObj?.symbol,
            showEmptySymbolArea === true || symbol ? 'flex' : 'hidden group-hover:flex',
          )}
        >
          {symbol}
        </div>
      }
    </button>
  )
}
