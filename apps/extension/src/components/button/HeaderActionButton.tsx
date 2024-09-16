import { Buttons } from '@leapwallet/leap-ui'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { SidebarSimple } from '@phosphor-icons/react/dist/ssr'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import mixpanel from 'mixpanel-browser'
import React, { useCallback } from 'react'
import { HeaderAction, HeaderActionType } from 'types/components'
import { isSidePanel, isSidePanelSupported } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

const ActionButton = React.memo(({ type, onClick, className }: HeaderAction) => {
  const isInExpandView = browser.extension.getViews({ type: 'tab' }).length > 0

  const handleSidePanelClick = useCallback(async () => {
    if (!isSidePanelSupported() || isSidePanel()) {
      if (isSidePanel()) {
        await chrome.sidePanel.setPanelBehavior({
          openPanelOnActionClick: false,
        })
        try {
          mixpanel.track(EventName.ButtonClick, {
            buttonType: ButtonType.SIDE_PANEL,
            buttonName: ButtonName.SIDE_PANEL_CLOSED,
            time: Date.now() / 1000,
          })
        } catch (e) {
          captureException(e)
        }
      }
      window.close()
      return
    }
    if (!chrome.windows) {
      return
    }
    const currentWindow = await chrome.windows.getCurrent()
    const windowId = currentWindow?.id
    if (!windowId || !chrome.sidePanel) {
      return
    }
    await chrome.sidePanel.setOptions({
      path: 'sidepanel.html#/home',
      enabled: true,
    })
    await chrome.sidePanel.open({ windowId })
    await chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true,
    })
    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.SIDE_PANEL,
        buttonName: ButtonName.SIDE_PANEL_OPENED,
        time: Date.now() / 1000,
      })
    } catch (e) {
      captureException(e)
    }
    window.close()
  }, [])

  switch (type) {
    case HeaderActionType.CANCEL:
      return <Buttons.Cancel onClick={onClick} className={className} />

    case HeaderActionType.BACK:
      return <Buttons.Back onClick={onClick} className={className} />

    case HeaderActionType.NAVIGATION:
      return (
        <div className={classNames('flex flex-row justify-center items-center !p-0', className)}>
          <div
            className={classNames(
              'flex flex-row justify-center items-center h-full [&>div]:w-full [&>div]:h-full',
              isSidePanelSupported() ? '[&_button]:pl-[0.6rem] [&_button]:pr-[0.5rem]' : null,
            )}
          >
            <Buttons.Nav
              onClick={onClick}
              className='w-full h-full flex items-center justify-center [&>img]:h-5 [&>img]:w-5'
            />
          </div>
          {!isInExpandView && isSidePanelSupported() && (
            <>
              <div className='h-full w-[1px] bg-gray-850'></div>
              <button
                className='h-full flex items-center justify-center pl-[0.5rem] pr-[0.6rem]'
                onClick={handleSidePanelClick}
              >
                {!isSidePanel() ? (
                  <SidebarSimple
                    size={20}
                    weight='fill'
                    mirrored={true}
                    className='text-black-100 dark:text-white-100'
                  />
                ) : (
                  <ArrowSquareOut
                    size={18}
                    mirrored={true}
                    className='text-black-100 dark:text-white-100'
                  />
                )}
              </button>
            </>
          )}
        </div>
      )
  }
})

ActionButton.displayName = 'ActionButton'
export { ActionButton }
