import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { Info } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'

type StakeStatusCardProps = {
  title: string
  message: string
  backgroundColor: string
  backgroundColorDark: string
  color: string
  onAction: () => void
}

export default function StakeStatusCard({
  title,
  message,
  backgroundColor,
  backgroundColorDark,
  color,
  onAction,
}: StakeStatusCardProps) {
  const { theme } = useTheme()
  return (
    <>
      <div className={`flex flex-col gap-y-2 w-full p-4 rounded-2xl ${backgroundColor}`}>
        <div className='flex gap-x-2'>
          <Info size={16} className={`${color}`} />
          <Text size='sm' className='font-bold' color='dark:text-white-100'>
            {title}
          </Text>
        </div>
        <Text size='sm' color='dark:text-gray-200'>
          {message}
        </Text>
        <div className={`rounded-2xl ${backgroundColorDark}`}>
          <img
            className='w-[200px] h-[106px] object-cover my-5 mx-auto'
            src={Images.Logos.LeapLogo}
          />
        </div>
      </div>
      <Buttons.Generic
        onClick={onAction}
        color={theme === ThemeName.DARK ? Colors.white100 : Colors.black100}
        className='w-full'
        size='normal'
      >
        <Text color='text-white-100 dark:text-black-100'>Stake on a different chain</Text>
      </Buttons.Generic>
    </>
  )
}
