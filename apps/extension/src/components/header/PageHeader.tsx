import { LineDivider } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { ActionButton } from 'components/button'
import useNewChainTooltip from 'hooks/useNewChainTooltip'
import { Images } from 'images'
import React from 'react'
import { PageHeaderProps } from 'types/components'

import NewChainSupportTooltip from './NewChainSupportTooltip'

const PageHeader = React.memo(
  ({ title, action, imgSrc, onImgClick, dontShowFilledArrowIcon = false }: PageHeaderProps) => {
    const { showToolTip: _showToolTip, toolTipData, handleToolTipClose } = useNewChainTooltip()

    const showToolTip = _showToolTip && !!toolTipData && !!onImgClick

    return (
      <>
        {showToolTip && (
          <div
            onClick={handleToolTipClose}
            className='absolute cursor-pointer top-0 z-[2] left-0 h-[600px] w-[400px]'
          />
        )}
        <div
          className={classNames('relative h-[72px] w-[400px]', {
            'overflow-hidden': !showToolTip,
          })}
        >
          <div className='flex w-full absolute left-0 top-0 items-center justify-center h-full'>
            <div className='text-black-100 font-bold text-xl dark:text-white-100'>{title}</div>
          </div>

          {action ? (
            <div className='flex h-full absolute left-7 top-0 items-center'>
              <ActionButton {...action} />
            </div>
          ) : null}

          {imgSrc ? (
            <div
              className={classNames('flex absolute items-center right-7', {
                'cursor-pointer bg-[#FFFFFF] dark:bg-gray-950 h-fit rounded-3xl top-4 p-2.5':
                  onImgClick,
                'h-full top-0': !onImgClick,
              })}
              onClick={onImgClick}
            >
              {typeof imgSrc === 'string' ? (
                <img
                  src={imgSrc}
                  className={classNames('h-7 w-7', { 'w-[20px] h-[20px]': onImgClick })}
                />
              ) : (
                imgSrc
              )}

              {onImgClick !== undefined && !dontShowFilledArrowIcon && (
                <img src={Images.Misc.FilledArrowDown} className='h-1.5 w-1.5 ml-2.5' />
              )}

              {showToolTip && (
                <NewChainSupportTooltip
                  toolTipData={toolTipData}
                  handleCTAClick={() => {
                    onImgClick()
                    handleToolTipClose()
                  }}
                  handleToolTipClose={handleToolTipClose}
                />
              )}
            </div>
          ) : null}

          <div className='flex absolute bottom-0'>
            <LineDivider />
          </div>
        </div>
      </>
    )
  },
)

PageHeader.displayName = 'PageHeader'
export { PageHeader }
