import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { miscellaneousDataStore } from 'stores/chain-infos-store'
import { earnFeatureShowStore } from 'stores/earn-feature-show'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

type Props = {
  onClose: () => void
}

const EarnUSDNSheet = observer(({ onClose }: Props) => {
  const navigate = useNavigate()
  const chainInfo = useChainInfo('noble')
  const handleStartEarningClick = () => {
    onClose()
    earnFeatureShowStore.setShow('false')
    navigate('/earn-usdn')
  }
  return createPortal(
    <div className='panel-height panel-width bg-white-100 dark:bg-black-100 absolute top-0 z-10'>
      <Header
        title='Earn'
        action={{
          type: HeaderActionType.BACK,
          onClick: () => {
            onClose()
          },
        }}
      />
      <div className='flex flex-col p-6 !pt-8 justify-between items-center h-[calc(100%-72px)]'>
        <div>
          <div className='flex flex-col justify-between items-center'>
            <div className='flex w-[116px] h-16 relative'>
              <img
                src={Images.Logos.USDCLogo}
                onError={imgOnError(Images.Logos.GenericDark)}
                className='w-16 h-16 absolute left-0'
              />
              <img
                src={chainInfo.chainSymbolImageUrl ?? Images.Logos.GenericDark}
                onError={imgOnError(Images.Logos.GenericDark)}
                className='w-16 h-16 bg-white-100 rounded-full absolute right-0'
              />
            </div>
            <Text className='font-bold text-xl px-[50px] text-center mt-6'>
              Earn real-time rewards with USDC
            </Text>
            <Text
              className='font-medium text-sm text-center mt-3 !inline'
              color='text-gray-600 dark:text-gray-400'
            >
              Put your stable asset to work and earn&nbsp;
              {
                <strong className='text-green-600'>
                  &nbsp;
                  {parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
                    ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy)
                        .multipliedBy(100)
                        .toFixed(2) + '%'
                    : '-'}
                  &nbsp;APY
                </strong>
              }
              . effortless and simple!
            </Text>
          </div>
          <div className='px-2'>
            <div className='flex flex-col gap-[18px] px-5 py-6 rounded-xl dark:bg-gray-950 bg-white-100 w-full mt-8'>
              <div className='flex items-center gap-2.5'>
                <CheckCircle size={24} className='text-green-600' />
                <Text size='sm' color='dark:text-gray-200 text-gray-800'>
                  No lock up period
                </Text>
              </div>
              <div className='flex items-center gap-2.5'>
                <CheckCircle size={24} className='text-green-600' />
                <Text size='sm' color='dark:text-gray-200 text-gray-800'>
                  Real-time accumulated rewards
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col justify-between items-center gap-4 w-full'>
          <button
            className='w-full text-md font-bold text-white-100 h-12 rounded-full cursor-pointer bg-green-600 hover:bg-green-500'
            onClick={handleStartEarningClick}
          >
            Start earning now
          </button>
          <Text
            color='dark:text-gray-400 text-gray-600'
            size='xs'
            className='font-medium text-center'
          >
            Powered by Noble
          </Text>
        </div>
      </div>
    </div>,
    document.getElementById('popup-layout')?.parentNode as HTMLElement,
  )
})

export default EarnUSDNSheet
