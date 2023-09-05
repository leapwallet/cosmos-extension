import { Buttons, LineDivider } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { Images } from 'images'
import React, { ReactElement } from 'react'
import { ReactNode } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

export enum HeaderActionType {
  /** @see {@link Buttons.Back} */
  // eslint-disable-next-line no-unused-vars
  BACK = 'back',
  /** @see {@link Buttons.Cancel} */
  // eslint-disable-next-line no-unused-vars
  CANCEL = 'cancel',
  // eslint-disable-next-line no-unused-vars
  NAVIGATION = 'nav',
}

export type HeaderAction = {
  readonly type: HeaderActionType
  readonly onClick: () => void
  readonly 'data-testing-id'?: string
}

type ActionButtonProps = HeaderAction

function ActionButton({ type, onClick, ...rest }: ActionButtonProps): ReactElement {
  let button: ReactElement | undefined
  switch (type) {
    case HeaderActionType.CANCEL:
      button = <Buttons.Cancel onClick={onClick} {...rest} />
      break
    case HeaderActionType.BACK:
      button = <Buttons.Back onClick={onClick} {...rest} />
      break
    case HeaderActionType.NAVIGATION:
      button = <Buttons.Nav onClick={onClick} {...rest} />
  }
  return button
}

export type NftAction = {
  readonly onClick: () => void
  readonly imgSrc: string
  readonly 'data-testing-id'?: string
}

export type HeaderProps = {
  readonly title: ReactNode
  /** If `undefined`, no action button will display to the left of the {@link title}. */
  readonly action?: HeaderAction
  readonly imgSrc?: string
  readonly onImgClick?: () => void
  readonly size?: 'sm' | 'normal'
  /** color should be a hex value , ex : "#754F9C" */
  readonly topColor?: string
  readonly 'data-testing-id'?: string
  readonly nftAction?: NftAction
}

export default function NftV2Header(props: HeaderProps): ReactElement {
  const { title, action, imgSrc, size = 'normal', topColor, onImgClick, nftAction } = props

  return (
    <>
      <div
        className={classNames('div relative h-[72px] w-[400px] overflow-hidden', {
          'h-[66px]': size === 'sm',
        })}
      >
        <div className='flex w-full absolute left-0 top-0 items-center justify-center h-full'>
          <div className='text-black-100 font-bold text-xl dark:text-white-100'>{title}</div>
        </div>

        {isCompassWallet() ? (
          <div className='flex h-full absolute left-7 top-0 items-center'>
            {action !== undefined && <ActionButton {...action} />}
          </div>
        ) : (
          <div className='flex h-full absolute left-7 top-0 items-center'>
            {action !== undefined && (
              <div className='flex items-center justify-between bg-[#FFFFFF] dark:bg-gray-900 rounded-full overflow-hidden'>
                <div className='h-[40px] w-[41px] py-2 pl-3 hover:bg-gray-100 dark:hover:bg-gray-800'>
                  <ActionButton {...action} />
                </div>
                <div className='border border-gray-100 dark:border-gray-800 border-[0.25px] h-[25px]' />
                <button
                  onClick={nftAction?.onClick}
                  className='h-[40px] w-[41px] py-2 pr-4 pl-2 flex cursor-pointer border-none items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <img className='invert dark:invert-0' src={nftAction?.imgSrc} alt='NFTs' />
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className={classNames('flex absolute items-center right-7', {
            'cursor-pointer bg-[#FFFFFF] dark:bg-gray-900 h-fit rounded-3xl top-4 p-2.5':
              onImgClick,
            'h-full top-0': !onImgClick,
          })}
          onClick={onImgClick}
          data-testing-id={props['data-testing-id']}
        >
          {imgSrc !== undefined && (
            <>
              <img
                src={imgSrc}
                className={classNames('h-7 w-7', { 'w-[20px] h-[20px]': onImgClick })}
              />
              {onImgClick !== undefined && (
                <img src={Images.Misc.FilledArrowDown} className='h-1.5 w-1.5 ml-2.5' />
              )}
            </>
          )}
        </div>
        <div className='flex absolute bottom-0'>
          <LineDivider />
        </div>
        <div className='absolute w-full h-1 left-0 top-0' style={{ backgroundColor: topColor }} />
      </div>
    </>
  )
}
