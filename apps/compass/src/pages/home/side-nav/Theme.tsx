import { Avatar, Card, CardDivider, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import React from 'react'

export default function ThemeDropUp({
  isVisible,
  onCloseHandler,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const activeChain = useActiveChain()
  const { theme, setTheme } = useTheme()
  const themes = [
    {
      title: 'Light',
      isSelected: theme === ThemeName.LIGHT,
      icon: Images.Nav.LightIcon,
      onClick: () => {
        setTheme(ThemeName.LIGHT)
        onCloseHandler()
      },
    },
    {
      title: 'Dark',
      isSelected: theme === ThemeName.DARK,
      icon: Images.Nav.DarkIcon,
      onClick: () => {
        setTheme(ThemeName.DARK)
        onCloseHandler()
      },
    },
  ]

  return (
    <BottomModal isOpen={isVisible} onClose={onCloseHandler} title={'Select Theme'}>
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
              className='w-full'
            />
          </React.Fragment>
        )
      })}
    </BottomModal>
  )
}
