import { Label, ThemeName } from '@leapwallet/leap-ui'
import { useTheme } from '@leapwallet/leap-ui'
import IconButton from 'components/icon-button'
import { Images } from 'images'
import { CompassCircle, LeapLogo } from 'images/logos'
import React, { PropsWithChildren, ReactNode } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

// Page layout for full screen pages
type SuccessExtensionPageProps = {
  readonly titleComponent?: ReactNode
  readonly children?: ReactNode
  readonly headerRightComponent?: ReactNode
}

export default function SuccessExtensionPage(props: PropsWithChildren<SuccessExtensionPageProps>) {
  const { titleComponent, children, headerRightComponent } = props
  const { theme, setTheme } = useTheme()

  const isDark = theme === ThemeName.DARK

  return (
    <div className='relative flex flex-col w-screen h-screen z-0 dark:bg-black-100'>
      {!isCompassWallet() && (
        <div className='w-screen absolute z-1 top-0 left-0 h-40 bg-gradient-to-b from-mainChainTheme-100 to-transparent' />
      )}
      {isCompassWallet() && (
        <div
          className='w-screen absolute z-1 top-0 left-0 h-40'
          style={{ backgroundImage: Colors.compassGradient }}
        />
      )}

      <div className='flex z-10 overflow-scroll items-start justify-center relative'>
        {/* Header */}
        <div className='absolute top-5 left-5 right-5 flex flex-row justify-between'>
          <img
            src={isCompassWallet() ? CompassCircle : LeapLogo}
            className='h-[36px] w-[36px] z-10'
          />
          {!!headerRightComponent && headerRightComponent}
          {!headerRightComponent && (
            <div className='absolute right-0 flex flex-row gap-x-[8px] z-20'>
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

              {!isCompassWallet() && (
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
              )}
            </div>
          )}
        </div>
        {children}
      </div>

      {!!titleComponent && (
        <div className='flex w-screen absolute left-0 right-0  z-10 item-center justify-center'>
          {titleComponent}
        </div>
      )}
    </div>
  )
}
