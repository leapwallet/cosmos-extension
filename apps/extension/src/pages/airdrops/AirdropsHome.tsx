import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import React, { useEffect, useState } from 'react'

import EligibleAirdrops from './components/EligibleAirdrops'
import EmptyAirdrops from './components/EmptyAirdrops'
import FailedAirdrops from './components/FailedAirdrops'
import InEligibleAirdrops from './components/InEligibleAirdrops'
import MoreAirdrops from './components/MoreAirdrops'
import WalletView from './components/WalletView'

export default function AirdropsHome() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
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

  return (
    <div className='flex flex-col gap-4'>
      <WalletView />

      {isLoading ? (
        <div className='flex justify-center items-center h-[340px]'>
          <Loader />
          <Text>Loading Airdrops</Text>
        </div>
      ) : isDataNull ? (
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
