import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { LineDivider } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { ActionButton } from 'components/button'
import { useDefaultTokenLogo } from 'hooks'
import useNewChainTooltip from 'hooks/useNewChainTooltip'
import { Images } from 'images'
import AddFromChainStore from 'pages/home/AddFromChainStore'
import React, { useState } from 'react'
import { PageHeaderProps } from 'types/components'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

import NewChainSupportTooltip from './NewChainSupportTooltip'

const PageHeader = React.memo(
  ({
    title,
    titleIcon,
    action,
    imgSrc,
    onImgClick,
    dontShowFilledArrowIcon = false,
    dontShowBottomDivider = false,
  }: PageHeaderProps) => {
    const { showToolTip: _showToolTip, toolTipData, handleToolTipClose } = useNewChainTooltip()
    const defaultTokenLogo = useDefaultTokenLogo()
    const showToolTip = _showToolTip && !!toolTipData && !!onImgClick
    const [newChain, setNewChain] = useState<string | null>(null)
    const customChains = useCustomChains()

    return (
      <>
        {showToolTip && (
          <div
            onClick={handleToolTipClose}
            className='absolute cursor-pointer top-0 z-[2] left-0 panel-height panel-width'
          />
        )}
        <div
          className={classNames('relative h-[72px] panel-width', {
            'overflow-hidden': !showToolTip,
          })}
        >
          <div className='flex w-full absolute left-0 top-0 items-center justify-center h-full'>
            <div className='flex gap-2 items-center text-black-100 font-bold text-xl dark:text-white-100'>
              <span>{title}</span>
              {titleIcon}
            </div>
          </div>

          {action ? (
            <div
              className={classNames('flex h-full absolute top-0 items-center', {
                'left-7': !isSidePanel(),
                'left-4': isSidePanel(),
              })}
            >
              <ActionButton {...action} />
            </div>
          ) : null}

          {imgSrc ? (
            <div
              className={classNames('flex h-full absolute top-0 items-center', {
                'right-7': !isSidePanel(),
                'right-4': isSidePanel(),
              })}
            >
              <div
                className={classNames('relative flex items-center', {
                  'cursor-pointer bg-[#FFFFFF] dark:bg-gray-950 h-fit rounded-3xl px-3 py-2':
                    onImgClick,
                  'h-full': !onImgClick,
                })}
                onClick={onImgClick}
              >
                {typeof imgSrc === 'string' ? (
                  <img
                    src={imgSrc}
                    className={classNames('h-7 w-7', { 'w-[20px] h-[20px]': onImgClick })}
                    onError={imgOnError(defaultTokenLogo)}
                  />
                ) : (
                  imgSrc
                )}

                {onImgClick !== undefined && !dontShowFilledArrowIcon && (
                  <img src={Images.Misc.FilledArrowDown} className='h-1.5 w-4 ml-1' />
                )}
              </div>
            </div>
          ) : null}

          {!dontShowBottomDivider ? (
            <div className='flex absolute bottom-0'>
              <LineDivider />
            </div>
          ) : null}
        </div>

        <AddFromChainStore
          isVisible={!!newChain}
          onClose={() => setNewChain(null)}
          newAddChain={customChains.find((d) => d.chainName === newChain) as ChainInfo}
        />
      </>
    )
  },
)

PageHeader.displayName = 'PageHeader'
export { PageHeader }
