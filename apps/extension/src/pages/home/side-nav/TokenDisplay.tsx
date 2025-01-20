import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { hidePercentChangeStore } from 'stores/hide-percent-change'
import { hideSmallBalancesStore } from 'stores/hide-small-balances-store'
import { isSidePanel } from 'utils/isSidePanel'

const ToggleCard = ({
  title,
  isEnabled,
  onClick,
}: {
  title: string
  isEnabled: boolean
  onClick: (val: boolean) => void
}) => {
  return (
    <div
      className={classNames(
        'flex justify-between items-center p-4 bg-white-100 dark:bg-gray-900 cursor-pointer w-[352px] h-[60px] rounded-xl',
      )}
    >
      <div className={'text-sm font-bold text-black-100 dark:text-white-100'}>{title}</div>
      <input
        type='checkbox'
        id='toggle-switch3'
        checked={isEnabled}
        onChange={({ target }) => onClick(target.checked)}
        className='h-7 w-[50px] appearance-none rounded-full cursor-pointer bg-gray-600/30 transition duration-200 checked:bg-green-600 relative'
      />
    </div>
  )
}

export const TokenDisplay = observer(({ goBack }: { goBack: () => void }) => {
  return (
    <div
      className={classNames('panel-height panel-width enclosing-panel', {
        'pb-5': !isSidePanel(),
      })}
    >
      <Header title='Token display' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <div className='flex flex-col p-6 gap-y-4'>
        <ToggleCard
          title='Hide 24h price change'
          isEnabled={hidePercentChangeStore.isHidden}
          onClick={(v) => hidePercentChangeStore.setHidden(v)}
        />
        <ToggleCard
          title='Hide small balances'
          isEnabled={hideSmallBalancesStore.isHidden}
          onClick={(v) => hideSmallBalancesStore.setHidden(v)}
        />
      </div>
    </div>
  )
})
