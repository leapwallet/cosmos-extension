import { useAddress } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, LineDivider, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { sha256 } from '@noble/hashes/sha256'
import { utils } from '@noble/secp256k1'
import ExtensionPage from 'components/extension-page'
import Text from 'components/text'
import { ButtonName, EventName } from 'config/analytics'
import dayjs from 'dayjs'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import { QrModal } from './QrModal'
import SuccessExtensionPage from './success-extension-page'
import SuccessCard from './SuccessCard'

export default function OnboardingSuccess() {
  const [showQrModal, setShowQrModal] = useState<boolean>(false)
  const [isPinned, setIsPinned] = useState<boolean>(true)

  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK

  const trackCTAEvent = (buttonName: string) => {
    mixpanel.track(EventName.OnboardingClicked, { buttonName, time: Date.now() / 1000 })
  }

  const onboardingContent = [
    {
      title: 'Onboard seamlessly',
      cardColor: '#64D1E9',
      cards: [
        {
          cardIcons: [{ icon: 'arrow_downward' }],
          cardTitle: 'Receive Assets',
          cardContent: 'Transfer from your existing Cosmos wallet',
          onCardClick: () => {
            window.open(
              'https://cosmos.leapwallet.io/explore/tokens/uatom?chain=cosmos&receive=true',
            )
            trackCTAEvent(ButtonName.RECEIVE)
          },
        },
        {
          cardIcons: [{ icon: 'route' }],
          cardTitle: 'Bridge',
          cardContent: 'Move assets from other ecosystems',
          onCardClick: () => {
            window.open('https://cosmos.leapwallet.io/transact/bridge')
            trackCTAEvent(ButtonName.BRIDGE)
          },
        },
        {
          cardIcons: [{ icon: 'add' }],
          cardTitle: 'Fiat on-ramp',
          cardContent: 'Buy assets using any currency',
          onCardClick: () => {
            window.open('https://cosmos.leapwallet.io/transact/buy')
            trackCTAEvent(ButtonName.BUY)
          },
        },
      ],
    },
    {
      title: 'Explore Cosmos your way, with the Leap suite',
      cardColor: '#3ACF92',
      cards: [
        {
          cardIcons: [{ image: 'Appstore' }, { image: 'Playstore' }],
          cardTitle: 'Mobile app',
          cardContent: 'Explore dApps & manage funds, from your phone',
          onCardClick: () => {
            setShowQrModal(true)
            trackCTAEvent(ButtonName.MOBILE_APP)
          },
        },
        {
          cardIcons: [{ image: 'Dashboard' }],
          cardTitle: 'Leapboard',
          cardContent: 'The dashboard for comprehensive portfolio management',
          onCardClick: () => {
            window.open('https://cosmos.leapwallet.io')
            trackCTAEvent(ButtonName.LEAPBOARD)
          },
        },
      ],
    },
    {
      title: 'The interchain has something for everyone',
      cardColor: '#B558E4',
      cards: [
        {
          cardIcons: [{ icon: 'auto_graph' }],
          cardTitle: 'Dive into DeFi',
          cardContent: 'Low fees, high volumes!',
          onCardClick: () => {
            window.open('https://cosmos.leapwallet.io/explore/defi')
            trackCTAEvent(ButtonName.EXPLORE_DEFI)
          },
        },
        {
          cardIcons: [{ icon: 'image' }],
          cardTitle: 'Explore NFTs',
          cardContent: 'Trade & showoff the best JPEGs ever',
          onCardClick: () => {
            window.open('https://cosmos.leapwallet.io/explore/nfts')
            trackCTAEvent(ButtonName.EXPLORE_NFTS)
          },
        },
        {
          cardIcons: [{ icon: 'toll' }],
          cardTitle: 'Explore Tokens',
          cardContent: 'Fill up your bags',
          onCardClick: () => {
            window.open('https://cosmos.leapwallet.io/explore/tokens')
            trackCTAEvent(ButtonName.EXPLORE_TOKENS)
          },
        },
      ],
    },
  ]

  const checkIsPinned = async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userSettings = await chrome.action.getUserSettings()
    setIsPinned(userSettings?.isOnToolbar)
  }

  useEffect(() => {
    const checkPinned = setInterval(checkIsPinned, 2000)
    return () => clearInterval(checkPinned)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chrome])

  const activeWalletCosmosAddress = useAddress('cosmos')

  useEffect(() => {
    const currentTime = new Date().getTime()
    const timeStarted1 = Number(localStorage.getItem('timeStarted1'))
    const timeStarted2 = Number(localStorage.getItem('timeStarted2'))
    const methodChosen = localStorage.getItem('onboardingMethodChosen')

    if (timeStarted1 && timeStarted2 && activeWalletCosmosAddress) {
      const hashedAddress = utils.bytesToHex(sha256(activeWalletCosmosAddress))

      mixpanel.track(EventName.OnboardingCompleted, {
        methodChosen,
        timeTaken1: dayjs(currentTime).diff(timeStarted1, 'seconds'),
        timeTaken2: dayjs(currentTime).diff(timeStarted2, 'seconds'),
        wallet: hashedAddress,
        time: Date.now() / 1000,
      })

      localStorage.removeItem('timeStarted1')
      localStorage.removeItem('timeStarted2')
      localStorage.removeItem('onboardingMethodChosen')
    }
  }, [activeWalletCosmosAddress])

  if (isCompassWallet()) {
    return (
      <ExtensionPage
        headerRightComponent={
          <div className='absolute top-0 right-0'>
            {' '}
            <img src={Images.Misc.CompassPinExtension} className='w-[320px] h-[210px]' />
          </div>
        }
        titleComponent={
          <div className='w-screen absolute opacity-50 top-0 z-1'>
            <Confetti numberOfPieces={1000} recycle={false} />
          </div>
        }
      >
        <div className='flex flex-col justify-center items-center'>
          <img src={Images.Misc.CheckGreen} className='h-[72px]' />
          <Text
            size='jumbo'
            className='font-medium mt-[24px] mb-[30px]'
            data-testing-id='ready-wallet-ele'
          >
            Your Compass wallet is ready!
          </Text>
          <LineDivider />
          <Text size='xl' className='font-medium mt-[30px]'>
            Access your wallet
          </Text>
          <Text size='sm' color='text-gray-400'>
            using this keyboard shortcut
          </Text>
          <img src={Images.Misc.CMDShiftL} className='h-[32px] m-[20px]' />
          <Text size='xs' color='text-gray-400'>
            Mac: Command + Shift + L
          </Text>
          <Text size='xs' color='text-gray-400'>
            Windows / others: Control + Shift + L
          </Text>
        </div>
      </ExtensionPage>
    )
  }

  return (
    <SuccessExtensionPage
      headerRightComponent={
        isPinned ? null : (
          <div className='absolute top-0 right-0'>
            <img src={Images.Misc.PinToExtension} className='mr-[90px]' />
          </div>
        )
      }
      titleComponent={
        <div className='w-screen absolute opacity-50 top-0 z-1'>
          <Confetti numberOfPieces={1000} recycle={false} />
        </div>
      }
    >
      <div className='flex w-full pt-[180px] px-[90px] gap-[100px] relative'>
        <div className='w-[270px]'>
          <Text
            className='font-extrabold leading-[45px] mb-[25px] text-[40px]'
            data-testing-id='ready-wallet-ele'
          >
            Leap into <br /> the Cosmos!
          </Text>
          <Text
            size='xl'
            color='dark:text-gray-300 text-gray-600'
            className='font-medium mb-[25px] !block'
          >
            Your <span className='dark:text-white-100 text-black-100'>Leap Wallet</span>
            <br />
            is ready to use.
          </Text>
          <Buttons.Generic
            color={Colors.green600}
            onClick={() => {
              window.open('/index.html', '_self')
              trackCTAEvent(ButtonName.LAUNCH_EXTENSION)
            }}
            className='!w-[240px]'
          >
            <p className='flex items-center'>
              Launch Extension
              <span className='material-icons-round w-5 h-5 ml-5'>arrow_forward</span>
            </p>
          </Buttons.Generic>
        </div>
        <div className='flex flex-col flex-1 gap-7 mb-9'>
          {onboardingContent.map((data, index) => (
            <div key={index}>
              <Text size='md' className='font-medium mb-3'>
                {data.title}
              </Text>
              <div className='flex gap-4'>
                {data.cards.map((cardData) => (
                  <SuccessCard
                    key={cardData.cardTitle}
                    icons={cardData.cardIcons}
                    color={data.cardColor}
                    title={cardData.cardTitle}
                    content={cardData.cardContent}
                    onCardClick={cardData.onCardClick}
                  />
                ))}
              </div>
            </div>
          ))}

          <Text
            size='lg'
            className='flex items-center font-medium mt-2 cursor-pointer'
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onClick={() => {
              window.open('https://twitter.com/leap_cosmos')
              trackCTAEvent(ButtonName.FOLLOW_LEAP)
            }}
          >
            <img
              src={isDark ? Images.Logos.XLogo : Images.Logos.XLogoDark}
              className='w-5 h-5 mr-2'
            />{' '}
            Follow Leap on X
          </Text>
        </div>
        <img
          src={Images.Misc.OnboardingFrog}
          className='absolute left-[-240px] bottom-0 w-[510px]'
        />
      </div>
      {showQrModal && <QrModal setShowQrModal={setShowQrModal} />}
    </SuccessExtensionPage>
  )
}
