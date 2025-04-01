import classNames from 'classnames'
import { BG_RESPONSE, SUGGEST_TOKEN } from 'config/storage-keys'
import React, { ReactNode, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export type ChildrenParams = {
  handleRejectBtnClick: () => Promise<void>
}

type ContainerProps = {
  children: ({ handleRejectBtnClick }: ChildrenParams) => ReactNode
  suggestKey: typeof SUGGEST_TOKEN
}

export function SuggestContainer({ children, suggestKey }: ContainerProps) {
  const navigate = useNavigate()

  const handleRejectBtnClick = useCallback(async () => {
    await Browser.storage.local.set({ [BG_RESPONSE]: { error: 'Rejected by the user.' } })

    setTimeout(async () => {
      await Browser.storage.local.remove([suggestKey])
      await Browser.storage.local.remove(BG_RESPONSE)
      if (isSidePanel()) {
        navigate('/home')
      } else {
        window.close()
      }
    }, 10)
  }, [navigate, suggestKey])

  useEffect(() => {
    window.addEventListener('beforeunload', handleRejectBtnClick)
    Browser.storage.local.remove(BG_RESPONSE)

    return function () {
      window.removeEventListener('beforeunload', handleRejectBtnClick)
    }
  }, [handleRejectBtnClick])

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='panel-width panel-height max-panel-height enclosing-panel'>
        <div
          className='w-full h-1 rounded-t-2xl'
          style={{ backgroundColor: Colors.cosmosPrimary }}
        />

        <div
          className={classNames(
            'relative h-full flex flex-col justify-between items-center pt-4 pb-10',
            { 'px-4': isSidePanel(), 'px-7': !isSidePanel() },
          )}
        >
          {children({ handleRejectBtnClick })}
        </div>
      </div>
    </div>
  )
}
