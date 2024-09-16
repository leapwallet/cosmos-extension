import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import classNames from 'classnames'
import { BG_RESPONSE, NEW_CHAIN_REQUEST } from 'config/storage-keys'
import { observer } from 'mobx-react-lite'
import React, { ReactNode, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export type ChildrenParams = {
  handleRejectBtnClick: () => Promise<void>
  handleError: (error: string) => Promise<void>
  chainTagsStore: ChainTagsStore
}

type ContainerProps = {
  children: ({ handleRejectBtnClick, handleError }: ChildrenParams) => ReactNode
  suggestKey: typeof NEW_CHAIN_REQUEST
  chainTagsStore: ChainTagsStore
}

export const SuggestContainer = observer(
  ({ children, suggestKey, chainTagsStore }: ContainerProps) => {
    const navigate = useNavigate()

    const handleError = useCallback(
      async (error: string) => {
        await Browser.storage.local.set({ [BG_RESPONSE]: { error } })

        setTimeout(async () => {
          await Browser.storage.local.remove([suggestKey])
          await Browser.storage.local.remove(BG_RESPONSE)

          if (isSidePanel()) {
            navigate('/home')
          } else {
            window.close()
          }
        }, 10)
      },
      [navigate, suggestKey],
    )

    const handleRejectBtnClick = useCallback(async () => {
      await handleError('Rejected by the user.')
    }, [handleError])

    useEffect(() => {
      window.addEventListener('beforeunload', handleRejectBtnClick)
      Browser.storage.local.remove(BG_RESPONSE)

      return () => {
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
              { 'px-7': !isSidePanel(), 'px-4': isSidePanel() },
            )}
          >
            {children({ handleRejectBtnClick, handleError, chainTagsStore })}
          </div>
        </div>
      </div>
    )
  },
)
