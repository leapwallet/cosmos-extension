import { ZeroStateBanner as ZeroStateBannerType } from '@leapwallet/cosmos-wallet-store'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { FundBanners } from './FundBanners'
import { FundBannersProps } from './FundBanners'

export const ZeroStateBanner = observer(
  ({
    handleCopyClick,
    zeroStateBanner,
  }: FundBannersProps & { zeroStateBanner: ZeroStateBannerType | undefined }) => {
    if (zeroStateBanner) {
      return (
        <img
          src={zeroStateBanner.bgUrl}
          alt={zeroStateBanner.chainIds.join(',')}
          className='w-full cursor-pointer'
          onClick={() => {
            window.open(zeroStateBanner.redirectUrl, '_blank')
          }}
        />
      )
    }
    return <FundBanners handleCopyClick={handleCopyClick} />
  },
)
