import { Button } from 'components/ui/button'
import { Skeleton } from 'components/ui/skeleton'
import { AnimatePresence, motion } from 'framer-motion'
import { EyeIcon } from 'icons/eye-icon'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { rootBalanceStore, rootStore } from 'stores/root-store'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'
import { opacityFadeInOut, transition250 } from 'utils/motion-variants'

import { CopyAddress } from './copy-address'
import { TotalBalance } from './total-balance'

export const BalanceHeaderLoading = (props: { watchWallet?: boolean }) => {
  return (
    <div key='loading' className='flex flex-col gap-y-3 justify-center items-center'>
      <div className='h-[4.5rem] flex items-center'>
        <Skeleton className='w-44 h-6 m-3 rounded-full' />
      </div>
      <Skeleton className='w-32 h-4 m-2 rounded-full' />
      {props.watchWallet ? <Skeleton className='w-56 h-8 rounded-full my-3' /> : null}
    </div>
  )
}

const WatchWalletIndicator = () => {
  return (
    <Button
      variant={'secondary'}
      size={'sm'}
      className='bg-secondary-100 gap-2 px-4 py-2 h-auto my-3'
      onClick={() => {
        globalSheetsStore.setImportWatchWalletSeedPopupOpen(true)
      }}
    >
      <EyeIcon className='size-4' />
      <span className='font-medium text-sm bg-secondary-100'>You are watching this wallet</span>
    </Button>
  )
}

export const BalanceHeader = observer((props: { watchWallet?: boolean }) => {
  const isTokenLoading = rootBalanceStore.loading || rootStore.initializing !== 'done'

  return (
    <div className='w-full p-7 flex flex-col items-center justify-center'>
      <AnimatePresence exitBeforeEnter>
        {isTokenLoading ? (
          <BalanceHeaderLoading key='balance-header-loading' watchWallet={props.watchWallet} />
        ) : (
          <motion.div
            key='balance'
            className='flex flex-col items-center gap-3'
            transition={transition250}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            <TotalBalance />
            <CopyAddress />

            {props.watchWallet && <WatchWalletIndicator />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
