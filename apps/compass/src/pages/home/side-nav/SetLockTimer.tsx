import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import Text from 'components/text'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { autoLockTimeStore, TimerLockPeriod, TimerLockPeriodKey } from 'stores/password-store'
import { Colors } from 'theme/colors'

export default observer(function SetLockTimerDropUp({
  onCloseHandler,
  isVisible,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const activeChain = useActiveChain()

  return (
    <BottomModal isOpen={isVisible} onClose={onCloseHandler} title={'Set Timer'}>
      <div className='flex flex-col items-center gap-y-4'>
        <EmptyCard
          src={Images.Misc.Timer}
          subHeading='Your wallet will auto-lock if not in use for the chosen duration'
        />
        <div className='overflow-hidden rounded-2xl dark:bg-gray-900 bg-white-100 py-1'>
          {Object.entries(TimerLockPeriod).map((time, index) => {
            return (
              <React.Fragment key={time[index]}>
                {index !== 0 && <CardDivider />}
                <div
                  className='flex py-2 px-4 hover:cursor-pointer justify-between'
                  onClick={() => {
                    autoLockTimeStore.setLockTime(time[0] as TimerLockPeriodKey)
                    onCloseHandler()
                  }}
                >
                  <Text size='md' className='font-bold'>
                    {time[0]}
                  </Text>
                  {autoLockTimeStore.time === time[1] && (
                    <CheckCircle
                      weight='fill'
                      size={24}
                      style={{ color: Colors.getChainColor(activeChain) }}
                    />
                  )}
                </div>
                {/* <Card
                  iconSrc={
                    lockTime === TimerLockPeriod[time[0]] && !!activeChain
                      ? Images.Misc.geImage(`check-${activeChain}.svg`)
                      : undefined
                  }
                  size='md'
                  title={time[1]}
                  onClick={() => {
                    setTimer(time[0])
                    onCloseHandler()
                  }}
                /> */}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </BottomModal>
  )
})
