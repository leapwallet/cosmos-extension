import { ZeroStateBanner as ZeroStateBannerType } from '@leapwallet/cosmos-wallet-store'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { FundBanners } from './FundBanners'

export const ZeroStateBanner = observer(
  ({ zeroStateBanner }: { zeroStateBanner: ZeroStateBannerType | undefined }) => {
    if (zeroStateBanner) {
      return (
        <img
          src={zeroStateBanner.bgUrl}
          alt={zeroStateBanner.chainIds.join(',')}
          className='w-full cursor-pointer px-6'
          onClick={() => {
            window.open(zeroStateBanner.redirectUrl, '_blank')
          }}
        />
      )
    }
    return <FundBanners />
  },
)
