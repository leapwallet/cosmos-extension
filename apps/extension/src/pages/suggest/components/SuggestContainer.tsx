import { BG_RESPONSE, SUGGEST_TOKEN } from 'config/storage-keys'
import React, { ReactNode, useCallback, useEffect } from 'react'
import { Colors } from 'theme/colors'
import Browser from 'webextension-polyfill'

export type ChildrenParams = {
  handleRejectBtnClick: () => Promise<void>
}

type ContainerProps = {
  children: ({ handleRejectBtnClick }: ChildrenParams) => ReactNode
  suggestKey: typeof SUGGEST_TOKEN
}

export function SuggestContainer({ children, suggestKey }: ContainerProps) {
  const handleRejectBtnClick = useCallback(async () => {
    await Browser.storage.local.set({ [BG_RESPONSE]: { error: 'Rejected by the user.' } })

    setTimeout(async () => {
      await Browser.storage.local.remove([suggestKey])
      await Browser.storage.local.remove(BG_RESPONSE)
      window.close()
    }, 10)
  }, [suggestKey])

  useEffect(() => {
    window.addEventListener('beforeunload', handleRejectBtnClick)
    Browser.storage.local.remove(BG_RESPONSE)

    return function () {
      window.removeEventListener('beforeunload', handleRejectBtnClick)
    }
  }, [handleRejectBtnClick])

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='w-[400px] h-[600px] max-h-[600px]'>
        <div
          className='w-full h-1 rounded-t-2xl'
          style={{ backgroundColor: Colors.cosmosPrimary }}
        />

        <div className='relative h-full flex flex-col justify-between items-center pt-4 pb-10 px-7'>
          {children({ handleRejectBtnClick })}
        </div>
      </div>
    </div>
  )
}
