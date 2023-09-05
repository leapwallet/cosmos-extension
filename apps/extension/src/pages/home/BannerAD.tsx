import { useChainInfo, useGetBannerData } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { DISABLE_BANNER_ADS } from 'config/storage-keys'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import browser from 'webextension-polyfill'

dayjs.extend(utc)

export default function BannerAD() {
  const chain = useChainInfo()
  const isDark = useTheme().theme === ThemeName.DARK
  const navigate = useNavigate()
  const bannerADs = useGetBannerData(chain?.chainId)
  const [isVisible, setIsVisible] = useState(false)
  const [disabledBannerAds, setDisabledBannerAds] = useState<string[]>([])
  const mountedRef = useRef(true)

  const getClosedBanners = async () => {
    const disableBannerAds = await browser.storage.local.get([DISABLE_BANNER_ADS])
    if (mountedRef.current) {
      setDisabledBannerAds(disableBannerAds[DISABLE_BANNER_ADS] ?? [])
    }
  }

  useEffect(() => {
    getClosedBanners()
    return () => {
      mountedRef.current = false
    }
  }, [])

  const displayADs = useMemo(() => {
    return bannerADs?.filter((ad) => {
      const date = new Date()
      const startDate = new Date(ad.start_date)
      const endDate = new Date(ad.end_date)
      const isCorrectTime = date >= startDate && date <= endDate
      return !disabledBannerAds?.includes(ad.id) && isCorrectTime
    })
  }, [disabledBannerAds, bannerADs])

  if (!bannerADs || displayADs.length === 0) return null
  const bannerData = displayADs[0]

  return (
    <>
      <div className='w-[344px] m-auto mb-6 flex items-center overflow-hidden'>
        <button
          className='relative rounded-2xl  items-center flex dark:bg-gray-900 bg-white-100'
          style={{
            backgroundImage: bannerData.image_url,
            backgroundSize: 'contain',
          }}
          onClick={() => {
            if (bannerData.banner_type === 'popup') setIsVisible(true)
            else if (bannerData.banner_type === 'redirect-external') {
              window.open(bannerData.redirect_url)
            } else if (bannerData.banner_type === 'redirect-interanlly') {
              navigate(bannerData.redirect_url)
            }
          }}
        >
          {bannerData?.image_url && (
            <img
              src={bannerData.image_url}
              alt='chain logo'
              className=' z-0 right-0 h-full w-fit'
            />
          )}

          {!bannerData.image_url && (
            <div className='p-4 flex items-center'>
              <img
                src={chain.chainSymbolImageUrl}
                alt='chain logo'
                width='24'
                height='24'
                className='object-contain rounded-full h-10 w-10 mr-2 m-w-10'
                style={{
                  border: `8px solid ${chain.theme.primaryColor}`,
                }}
              />
              <div>
                <Text size='xs' color='dark:text-white-100 text-gray-800 text-left'>
                  {bannerData.title}
                </Text>
              </div>
            </div>
          )}
        </button>
        <button
          onClick={async () => {
            await browser.storage.local.set({
              [DISABLE_BANNER_ADS]: [...disabledBannerAds, bannerData?.id],
            })
            setDisabledBannerAds([...disabledBannerAds, bannerData?.id])
          }}
        >
          <span className='material-icons-round ml-1 text-gray-400'>close</span>
        </button>
      </div>
      <BottomModal isOpen={isVisible} onClose={() => setIsVisible(false)} title={'Announcement'}>
        <div className='dark:bg-gray-900 bg-white-100 rounded-2xl p-4'>
          {bannerData?.title && (
            <Text size='sm' color='dark:text-gray-400 text-gray-600 font-bold'>
              {bannerData.title}
            </Text>
          )}
          <Text size='sm' className='mt-4'>
            {bannerData.description}
          </Text>
        </div>
        <div className='flex flex-row mt-4 mb-4 justify-between'>
          <Buttons.Simple
            title='Dismiss'
            color={isDark ? Colors.gray900 : Colors.white100}
            onClick={() => setIsVisible(false)}
          />
          <Buttons.Simple
            title='Know more'
            color={'#744F9C'}
            onClick={() => {
              window.open(bannerData.redirect_url)
            }}
          />
        </div>
      </BottomModal>
    </>
  )
}
