import { useTheme } from '@leapwallet/leap-ui'
import { useQueryParams } from 'hooks/useQuery'
import { Images } from 'images'
import React from 'react'
import { queryParams } from 'utils/query-params'

const chadHighlightBannerGradient = {
  background: 'linear-gradient(180deg, #053F27 0%, #022718 100%)',
}

const chadHighlightBannerGradientLight = {
  background: 'linear-gradient(rgb(115 151 136) 0%, rgb(24 97 68) 100%)',
}

export function YouAreNotChadBanner() {
  const params = useQueryParams()
  const { theme } = useTheme()

  const bannerGradient =
    theme === 'light' ? chadHighlightBannerGradientLight : chadHighlightBannerGradient

  return (
    <div
      className='px-4 pt-6 pb-5 border border-primary overflow-hidden rounded-xl shrink-0 flex flex-col gap-1 relative isolate'
      style={bannerGradient}
    >
      <span className='font-bold text-white-100 text-shad'>You&apos;re not a Leap Chad, yet</span>
      <span className='text-white-100 text-xs'>
        The more you use Leap, the closer <br />
        to Chad status!{' '}
        <button
          className='text-accent-success font-medium underline underline-offset-4 decoration-dashed hover:text-primary transition-colors'
          onClick={() => params.set(queryParams.chadEligibility, 'true')}
        >
          Learn more
        </button>
      </span>
      <img
        src={Images.Alpha.chadHighlightBanner}
        className='h-[5.375rem] w-[11rem] absolute top-0 right-0 -z-10'
      />
    </div>
  )
}
