import { Label, ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import IconButton from 'components/icon-button'
import { Images } from 'images'
import { LeapLogo } from 'images/logos'
import React, { PropsWithChildren, ReactNode } from 'react'
import { isSidePanel } from 'utils/isSidePanel'

// Page layout for full screen pages
type ExtensionPageProps = {
  readonly titleComponent?: ReactNode
  readonly children?: ReactNode
  readonly headerRightComponent?: ReactNode
  readonly childrenMargin?: boolean
}

export default function ExtensionPage(props: PropsWithChildren<ExtensionPageProps>) {
  const { titleComponent, children, headerRightComponent, childrenMargin } = props
  const { theme, setTheme } = useTheme()

  const isDark = theme === ThemeName.DARK

  return (
    <div
      className={classNames('relative flex flex-col w-screen h-screen z-0', {
        'p-[20px]': !isSidePanel(),
      })}
    >
      <div className='w-screen absolute z-1 top-0 left-0 h-40' />

      <div
        className={classNames('flex z-10 overflow-scroll items-start justify-center', {
          'panel-height enclosing-panel': isSidePanel(),
          'mt-16': !childrenMargin,
          'mt-8': !!childrenMargin,
        })}
      >
        {children}
      </div>
      {!isSidePanel() && window.innerWidth >= 450 && (
        <>
          {/* Header */}
          <div className='absolute top-5 left-5 right-5 flex flex-row justify-between'>
            <img src={LeapLogo} className='h-[36px] w-[36px] z-10' />
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

                {
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
                }
              </div>
            )}
          </div>

          {!!titleComponent && (
            <div className='flex w-screen absolute left-0 right-0  z-10 item-center justify-center'>
              {titleComponent}
            </div>
          )}
        </>
      )}
    </div>
  )
}
