import { Label, ThemeName } from '@leapwallet/leap-ui'
import React from 'react'

import IconButton from '~/components/icon-button'
import { useThemeState } from '~/hooks/settings/use-theme'
import { Images } from '~/images'
import { LeapLogo } from '~/images/logos'

const DemoHeader = () => {
  const { theme, setTheme } = useThemeState()
  const isDark = theme === ThemeName.DARK

  return (
    <div className='demo-header absolute flex top-5 left-5 right-5 justify-between z-10 '>
      <img src={LeapLogo} className='h-[36px] w-[36px] z-10' />
      <div className='flex gap-x-[8px] z-10'>
        <div className='flex gap-x-[8px] z-10'>
          <IconButton
            isFilled={true}
            onClick={() => {
              setTheme(isDark ? ThemeName.LIGHT : ThemeName.DARK)
            }}
            image={{
              src: isDark ? Images.Misc.LightTheme : Images.Misc.DarkTheme,
              alt: 'Back',
            }}
          />
          <Label
            imgSrc={Images.Misc.HelpIcon}
            title={'Visit Help Center'}
            type={'normal'}
            onClick={() =>
              window.open(
                'https://leapwallet.notion.site/Leap-Wallet-Help-Center-Cosmos-ba1da3c05d3341eaa44a1850ed3260ee',
              )
            }
            isRounded={true}
          />
        </div>
      </div>
    </div>
  )
}

export default DemoHeader
