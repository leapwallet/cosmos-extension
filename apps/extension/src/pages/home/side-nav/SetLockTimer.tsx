import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { EmptyCard } from 'components/empty-card'
import Text from 'components/text'
import { TimerLockPeriod, useLockTimer } from 'hooks/settings/usePassword'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'

export default function SetLockTimerDropUp({
  onCloseHandler,
  isVisible,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const activeChain = useActiveChain()
  const { lockTime, setTimer } = useLockTimer()

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle='Set Timer'
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='flex flex-col items-center gap-y-4 p-[28px]'>
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
                    setTimer(time[0])
                    onCloseHandler()
                  }}
                >
                  <Text size='md' className='font-bold'>
                    {time[0]}
                  </Text>
                  {lockTime === time[1] && (
                    <span
                      className='material-icons-round'
                      style={{ color: Colors.getChainColor(activeChain) }}
                    >
                      check_circle
                    </span>
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
    </BottomSheet>
  )
}
