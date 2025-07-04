import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { autoLockTimeStore, TimerLockPeriod, TimerLockPeriodKey } from 'stores/password-store'

const SetLockTimerDropUp = ({
  onClose,
  isVisible,
}: {
  isVisible: boolean
  onClose: () => void
}) => {
  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={onClose}
      title={'Auto-Lock Timer'}
      className='flex flex-col gap-3 !py-7 !px-5'
    >
      {Object.entries(TimerLockPeriod).map((time, index) => {
        return (
          <button
            key={time[index]}
            className='flex p-4 hover:cursor-pointer justify-between rounded-xl bg-secondary-100 hover:bg-secondary-200 transition-colors'
            onClick={() => {
              autoLockTimeStore.setLockTime(time[0] as TimerLockPeriodKey)
              onClose()
            }}
          >
            <span className='text-sm font-bold'>{time[0]}</span>
            {autoLockTimeStore.time === time[1] && (
              <CheckCircle weight='fill' size={24} className='text-accent-foreground' />
            )}
          </button>
        )
      })}
    </BottomModal>
  )
}

export default observer(SetLockTimerDropUp)
