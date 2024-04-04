import { Buttons, LineDivider } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React, { ReactElement, ReactNode } from 'react'

export enum HeaderActionType {
  /** @see {@link Buttons.Back} */
  BACK = 'back',
  /** @see {@link Buttons.Cancel} */
  CANCEL = 'cancel',
  NAVIGATION = 'nav',
}

export type HeaderAction = {
  readonly type: HeaderActionType
  readonly onClick: () => void
  readonly 'data-testing-id'?: string
  readonly className?: string
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

export type HeaderProps = {
  readonly title: ReactNode
  /** If `undefined`, no action button will display to the left of the {@link title}. */
  readonly action?: HeaderAction
  readonly onImgClick?: () => void
  readonly size?: 'sm' | 'normal'
  /** color should be a hex value , ex : "#754F9C" */
  readonly topColor?: string
  readonly 'data-testing-id'?: string
}

export default function AirdropHeader(props: HeaderProps) {
  const { title, action, size = 'normal', topColor, onImgClick } = props

  return (
    <div
      className={classNames('div relative h-[72px] w-[400px] overflow-hidden', {
        'h-[66px]': size === 'sm',
      })}
    >
      <div className='flex w-full absolute left-0 top-0 items-center justify-center h-full'>
        <div className='text-black-100 font-bold text-xl dark:text-white-100'>{title}</div>
      </div>
      <div className='flex h-full absolute left-7 top-0 items-center'>
        {action !== undefined && <ActionButton {...action} />}
      </div>
      <div
        className={classNames('flex absolute items-center right-7', {
          'cursor-pointer bg-[#FFFFFF] dark:bg-gray-900 h-fit rounded-3xl top-4 p-2.5': onImgClick,
          'h-full top-0': !onImgClick,
        })}
        onClick={onImgClick}
        data-testing-id={props['data-testing-id']}
      >
        <div
          className='material-icons-round text-black-100 dark:text-white-100'
          style={{ fontSize: 20 }}
        >
          info_outline
        </div>
      </div>
      <div className='flex absolute bottom-0'>
        <LineDivider />
      </div>
      <div className='absolute w-full h-1 left-0 top-0' style={{ backgroundColor: topColor }} />
    </div>
  )
}
