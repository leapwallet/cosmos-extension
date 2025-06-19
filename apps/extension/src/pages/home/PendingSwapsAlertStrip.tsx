/* eslint-disable @typescript-eslint/no-explicit-any */
import { TXN_STATUS } from '@leapwallet/elements-core'
import { CaretRight, CheckCircle, XCircle } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Images } from 'images'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo } from 'react'
import { scaleInOutHalf, transition } from 'utils/motion-variants/global-layout-motions'
import { generateObjectKey, removePendingSwapTxs, TxStoreObject } from 'utils/pendingSwapsTxsStore'
import { sliceWord } from 'utils/strings'

type Props = {
  setShowSwapTxPageFor: Dispatch<SetStateAction<TxStoreObject | undefined>>
  selectedPendingSwapTx: TxStoreObject
}

const PendingSwapsAlertStrip = ({ setShowSwapTxPageFor, selectedPendingSwapTx }: Props) => {
  const handleViewClick = useCallback(() => {
    setShowSwapTxPageFor(selectedPendingSwapTx)
  }, [selectedPendingSwapTx, setShowSwapTxPageFor])

  useEffect(() => {
    if (
      [TXN_STATUS.SUCCESS, TXN_STATUS.FAILED].includes(
        selectedPendingSwapTx?.state ?? TXN_STATUS.PENDING,
      )
    ) {
      setTimeout(() => {
        const txKey = generateObjectKey(
          selectedPendingSwapTx?.routingInfo ?? {
            messages: (selectedPendingSwapTx as any)?.route?.messages,
          },
        )
        if (txKey) {
          removePendingSwapTxs(txKey)
        }
      }, 5000)
    }
  }, [selectedPendingSwapTx])

  const { icon, title } = useMemo(() => {
    if (selectedPendingSwapTx?.state === TXN_STATUS.SUCCESS) {
      return {
        icon: <CheckCircle size={36} className='text-foreground' />,
        title: 'Swap successful',
      }
    }
    if (selectedPendingSwapTx?.state === TXN_STATUS.FAILED) {
      return {
        icon: <XCircle size={36} className='text-foreground' />,
        title: 'Swap failed',
      }
    }
    return {
      icon: Images.Swap.Rotate,
      title: 'Swap in progress...',
    }
  }, [selectedPendingSwapTx?.state])

  return (
    <div
      className='flex rounded-2xl justify-between items-center p-4 bg-secondary-100 hover:bg-secondary-200 transition-colors cursor-pointer'
      onClick={handleViewClick}
    >
      <div className='flex items-center flex-grow gap-3'>
        <AnimatePresence mode='popLayout' initial={false}>
          {typeof icon === 'string' ? (
            <motion.img
              variants={scaleInOutHalf}
              transition={transition}
              initial='hidden'
              animate='visible'
              exit='hidden'
              src={icon}
              alt='alert-icon'
              className='w-8 h-8'
              key={icon}
            />
          ) : (
            <motion.div
              variants={scaleInOutHalf}
              transition={transition}
              initial='hidden'
              animate='visible'
              exit='hidden'
              className='flex justify-center items-center overflow-hidden -mr-1'
              key={title}
            >
              {icon}
            </motion.div>
          )}
        </AnimatePresence>
        <div className='flex flex-col justify-center items-start'>
          <span className={'text-base font-normal'}>{title}</span>
          {selectedPendingSwapTx?.routingInfo?.messages?.[0]?.customTxHash && (
            <span className='text-xs font-medium text-muted-foreground'>
              {sliceWord(selectedPendingSwapTx?.routingInfo?.messages?.[0]?.customTxHash, 5, 5)}
            </span>
          )}
        </div>
      </div>
      <CaretRight size={12} className='text-muted-foreground' />
    </div>
  )
}

export default PendingSwapsAlertStrip
