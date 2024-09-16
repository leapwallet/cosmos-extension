import { ArrowDown, ArrowUp } from '@phosphor-icons/react'
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
  const [isHovered] = useState<boolean>(false)

  const symbol = useMemo(() => {
    if (sortBy === sortName) {
      if (sortDir === 'asc') {
        return isHovered === true ? <ArrowDown size={12} /> : <ArrowUp size={12} />
      } else {
        return isHovered === true ? null : <ArrowDown size={12} />
      }
    }
    return isHovered === true ? <ArrowUp size={12} /> : null
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
            '!h-[12px] !w-[12px] flex-row items-center justify-center !text-xs !leading-[12px] !text-gray-500 group-hover:!text-black-100 dark:!text-gray-500 dark:group-hover:!text-white-100',
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
