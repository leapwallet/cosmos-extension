import { Button } from 'components/ui/button'
import { Skeleton } from 'components/ui/skeleton'
import { AnimatePresence, motion } from 'framer-motion'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { EyeIcon } from 'icons/eye-icon'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { rootBalanceStore } from 'stores/root-store'
import { opacityFadeInOut, transition250 } from 'utils/motion-variants'

import { CopyAddress } from './copy-address'
import { TotalBalance } from './total-balance'

export const BalanceHeaderLoading = (props: { watchWallet?: boolean }) => {
  return (
    <div key='loading' className='flex flex-col gap-y-2 justify-center items-center'>
      <div className='h-[49px] flex items-center'>
        <Skeleton className='w-44 h-6 rounded-full' />
      </div>
      <Skeleton className='h-4 m-[6px] rounded-full w-28' />
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
        // TODO: add watch wallet popup to sheet store
        // globalSheetsStore.setImportWatchWalletSeedPopupOpen(true)
      }}
    >
      <EyeIcon className='size-4' />
      <span className='font-medium text-sm'>You are watching this wallet</span>
    </Button>
  )
}

export const BalanceHeader = observer(() => {
  const { activeWallet } = useActiveWallet()
  const watchWallet = activeWallet?.watchWallet
  const isTokenLoading = rootBalanceStore.loading

  return (
    <div className='w-full py-8 px-7 flex flex-col items-center justify-center'>
      <AnimatePresence mode='wait'>
        {isTokenLoading ? (
          <BalanceHeaderLoading key='balance-header-loading' watchWallet={watchWallet} />
        ) : (
          <motion.div
            key='balance'
            className='flex flex-col items-center gap-2'
            transition={transition250}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            <TotalBalance />
            <CopyAddress />

            {watchWallet && <WatchWalletIndicator />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
