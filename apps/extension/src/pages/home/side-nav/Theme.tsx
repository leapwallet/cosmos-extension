import { Avatar, Card, CardDivider, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
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
    <BottomModal
      isOpen={isVisible}
      onClose={onCloseHandler}
      title={'Select Theme'}
      className='flex flex-col gap-4'
    >
      {themes.map((item) => {
        return (
          <button
            key={item.title}
            onClick={item.onClick}
            className='flex items-center gap-3 py-3 px-4 w-full rounded-xl bg-secondary-100 hover:bg-secondary-200 transition-colors'
          >
            <Avatar avatarImage={item.icon} />

            <span className='mr-auto font-semibold'>{item.title}</span>

            <CheckCircle
              weight='fill'
              size={24}
              className={item.isSelected ? 'text-accent-foreground' : 'text-transparent'}
            />
          </button>
        )
      })}
    </BottomModal>
  )
}
