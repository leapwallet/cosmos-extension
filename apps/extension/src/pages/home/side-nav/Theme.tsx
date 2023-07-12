import {
  Avatar,
  Card,
  CardDivider,
  HeaderActionType,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import React from 'react'

import { useThemeState } from '../../../hooks/settings/useTheme'

export default function ThemeDropUp({
  isVisible,
  onCloseHandler,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const activeChain = useActiveChain()
  const { theme, setTheme } = useTheme()
  const { setTheme: setThemeState } = useThemeState()
  const themes = [
    {
      title: 'Light',
      isSelected: theme === ThemeName.LIGHT,
      icon: Images.Nav.LightIcon,
      onClick: () => {
        setTheme(ThemeName.LIGHT)
        setThemeState(ThemeName.LIGHT)
        onCloseHandler()
      },
    },
    {
      title: 'Dark',
      isSelected: theme === ThemeName.DARK,
      icon: Images.Nav.DarkIcon,
      onClick: () => {
        setTheme(ThemeName.DARK)
        setThemeState(ThemeName.DARK)
        onCloseHandler()
      },
    },
  ]

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle='Select Theme'
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='flex flex-col items-center px-7 pt-7 pb-10'>
        <div className='overflow-hidden rounded-2xl'>
          {themes.map((item, index) => {
            return (
              <React.Fragment key={item.title}>
                {index !== 0 && <CardDivider />}
                <Card
                  iconSrc={item.isSelected ? Images.Misc.ChainChecks[activeChain] : undefined}
                  avatar={<Avatar avatarImage={item.icon} />}
                  size='md'
                  title={item.title}
                  onClick={item.onClick}
                />
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}
