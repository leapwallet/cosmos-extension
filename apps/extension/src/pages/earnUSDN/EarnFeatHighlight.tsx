import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import useEarnHighlightFeature from 'hooks/useEarnHighlightFeature'
import { Images } from 'images'
import React from 'react'
import { useNavigate } from 'react-router'
import { miscellaneousDataStore } from 'stores/chain-infos-store'
import { imgOnError } from 'utils/imgOnError'

const EarnFeatHighlight = () => {
  const { hideFeature, showFeature } = useEarnHighlightFeature()
  const navigate = useNavigate()
  const chainInfo = useChainInfo('noble')

  const handleStartEarningClick = () => {
    hideFeature()
    navigate('/earn-usdn')
  }

  if (!showFeature) return null

  return (
    <div className='px-[29px] pt-[56px] pb-10 bg-[#000000cc] absolute bottom-0 w-full h-full z-10'>
      <div className=' w-full h-full flex flex-col gap-7  items-center justify-between'>
        <div className='bg-gradient-to-b rounded-xl from-[#001A33] to-[#0059B2] h-full w-full'>
          <div className='flex flex-col justify-between items-center mt-[85px]'>
            <div className='flex w-[148px] h-16 relative'>
              <img
                src={Images.Logos.USDCLogo}
                onError={imgOnError(Images.Logos.GenericDark)}
                className='w-20 h-20 absolute left-0'
              />
              <img
                src={chainInfo.chainSymbolImageUrl ?? Images.Logos.GenericDark}
                onError={imgOnError(Images.Logos.GenericDark)}
                className='w-20 h-20 bg-white-100 rounded-full absolute right-0'
              />
            </div>
            <Text className='font-bold text-[28px] px-[20px] text-center mt-10'>
              Earn real-time rewards with USDC
            </Text>
            <Text
              className='font-light text-sm text-center mt-3 !inline p-4'
              color='text-white-100'
            >
              Put your stable asset to work and&nbsp;
              {
                <span className='text-white-100 font-bold'>
                  earn up to&nbsp;
                  {parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
                    ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy)
                        .multipliedBy(100)
                        .toFixed(2) + '%'
                    : '-'}
                  &nbsp;APY
                </span>
              }
              . effortless and simple!
            </Text>
            <div
              className='bg-white-100 hover:bg-[#ccc] text-black-100 py-3.5 px-6 rounded-full font-bold text-md w-[230px] text-center mt-4 cursor-pointer'
              onClick={handleStartEarningClick}
            >
              Start earning now
            </div>
          </div>
        </div>
        <div
          className='text-md font-bold cursor-pointer text-black-100 dark:text-white-100'
          onClick={hideFeature}
        >
          Dismiss
        </div>
      </div>
    </div>
  )
}

export default EarnFeatHighlight
