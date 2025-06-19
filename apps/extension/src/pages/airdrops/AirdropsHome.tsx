import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { motion } from 'framer-motion'
import { Images } from 'images'
import { createWalletLoaderVariants } from 'pages/onboarding/create/creating-wallet-loader'
import React, { useEffect, useState } from 'react'
import { transition } from 'utils/motion-variants'

import EligibleAirdrops from './components/EligibleAirdrops'
import EmptyAirdrops from './components/EmptyAirdrops'
import FailedAirdrops from './components/FailedAirdrops'
import InEligibleAirdrops from './components/InEligibleAirdrops'
import MoreAirdrops from './components/MoreAirdrops'
import WalletView from './components/WalletView'

export default function AirdropsHome() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const airdropsEligibilityData = useAirdropsEligibilityData()
  const isDataNull = airdropsEligibilityData === null

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isDataNull) {
      setIsLoading(true)
      timeout = setTimeout(() => {
        setIsLoading(false)
      }, 10000)
    } else {
      setIsLoading(false)
    }
    return () => clearTimeout(timeout)
  }, [isDataNull])

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center gap-8 flex-1 pb-[75px] h-full'>
        <div className='relative'>
          <img
            src={Images.Misc.WalletIconGreen}
            alt='wallet'
            className='size-6 absolute inset-0 mx-auto my-auto'
          />
          <div className='loader-container'>
            <div className='spinning-loader' />
          </div>
        </div>

        <motion.span
          className='text-secondary-foreground text-xl font-bold'
          transition={transition}
          variants={createWalletLoaderVariants}
          initial='hidden'
          animate='visible'
        >
          Loading Airdrops...
        </motion.span>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <WalletView />

      {isDataNull ? (
        <EmptyAirdrops
          className='h-[340px] justify-center'
          title='Airdrops can’t be loaded'
          subTitle={
            <>
              Airdrops can’t be loaded due to a <br /> technical failure, Kindly try again later.
            </>
          }
          showRetryButton={true}
        />
      ) : (
        <>
          <EligibleAirdrops />
          <FailedAirdrops />
          <InEligibleAirdrops />
          <MoreAirdrops />
        </>
      )}
    </div>
  )
}
