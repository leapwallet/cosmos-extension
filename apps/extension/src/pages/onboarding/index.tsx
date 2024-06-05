import { KeyChain } from '@leapwallet/leap-keychain'
import { OnboardCard as Card } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import ExtensionPage from 'components/extension-page'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { AuthContextType, useAuth } from 'context/auth-context'
import { usePassword } from 'hooks/settings/usePassword'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import { isCompassWallet } from 'utils/isCompassWallet'
import extension from 'webextension-polyfill'

import { Header } from '../../components/header'
import { IMPORT_WALLET_DATA } from './constants'

export default function Onboarding() {
  const navigate = useNavigate()
  const { loading, noAccount } = useAuth() as AuthContextType
  const password = usePassword()

  const trackCTAEvent = (methodChosen: string) => {
    if (!isCompassWallet()) {
      try {
        mixpanel.track(EventName.OnboardingMethod, { methodChosen, time: Date.now() / 1000 })
      } catch (e) {
        captureException(e)
      }
    }

    localStorage.setItem('onboardingMethodChosen', methodChosen)
    localStorage.setItem('timeStarted2', new Date().getTime().toString())
  }

  const importWalletData = useMemo(() => {
    const keplrWallet = {
      imgSrc: Images.Logos.Keplr,
      title: 'Keplr',
      'data-testing-id': '',
      mixpanelMethod: 'existing-keplr',
    }

    if (isCompassWallet()) {
      return {
        Leap: {
          imgSrc: Images.Logos.LeapLogo28,
          title: 'Leap',
          'data-testing-id': '',
          mixpanelMethod: 'existing-leap',
        },
        MetaMask: {
          imgSrc: Images.Logos.Metamask,
          title: 'MetaMask',
          'data-testing-id': '',
          mixpanelMethod: 'existing-metamask',
        },
        EvmWallets: {
          imgSrc: Images.Misc.EvmWalletIcon,
          title: 'Other EVM wallets',
          'data-testing-id': '',
          mixpanelMethod: 'existing-evm',
        },
        ...IMPORT_WALLET_DATA,
        Keplr: undefined,
      }
    } else {
      return {
        Keplr: keplrWallet,
        Cosmostation: {
          imgSrc: Images.Logos.CosmoStation,
          title: 'Cosmostation',
          'data-testing-id': '',
          mixpanelMethod: 'existing-cosmostation',
        },
        ...IMPORT_WALLET_DATA,
      }
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const wallets = await KeyChain.getAllWallets()

      if (loading === false && hasMnemonicWallet(wallets)) {
        if (!noAccount || password) {
          navigate('/onboardingSuccess')
        }
      }
    })()
  }, [loading, navigate, noAccount, password])

  useEffect(() => {
    extension.extension.getViews({ type: 'popup' })

    const timeStarted1 = localStorage.getItem('timeStarted1')
    if (!timeStarted1) {
      localStorage.setItem('timeStarted1', new Date().getTime().toString())
    }

    if (!isCompassWallet()) {
      try {
        mixpanel.track(EventName.OnboardingStarted, {
          firstWallet: true,
          time: Date.now() / 1000,
        })
      } catch (e) {
        captureException(e)
      }
    }
  }, [])

  return (
    <ExtensionPage>
      {loading ? (
        <Loader color='#fff' />
      ) : (
        <div className='flex flex-col gap-y-[20px] justify-center items-center'>
          <Header
            heading={`Welcome to ${isCompassWallet() ? 'Compass' : 'Leap'}`}
            subtitle={`Choose how you'd like to set up your wallet:`}
          />
          <Card
            imgSrc={Images.Misc.PlusIcon}
            title='Create new wallet'
            isRounded={true}
            size='xl'
            iconSrc={Images.Misc.RightArrow}
            onClick={() => {
              navigate('/onboardingCreate')
              trackCTAEvent('new')
            }}
            data-testing-id='create-new-wallet'
          />

          <div className='flex flex-col rounded-[12px] px-[20px] py-[24px] bg-white-100 dark:bg-gray-900 gap-y-[12px]'>
            <Text size='lg' className='items-start self-start pl-[5px] font-medium'>
              Import an existing wallet:
            </Text>
            {Object.values(importWalletData).map((val, ind) => {
              if (!val) return null

              return (
                <Card
                  key={ind}
                  className='border-[1px] dark:border-gray-800 border-gray-100'
                  imgSrc={val.imgSrc}
                  title={val.title ?? 'Using a recovery phrase'}
                  data-testing-id={val['data-testing-id']}
                  isFilled={true}
                  isRounded={true}
                  iconSrc={Images.Misc.RightArrow}
                  size='sm'
                  onClick={() => {
                    navigate(`/onboardingImport?walletName=${val.title ?? ''}`)
                    trackCTAEvent(val?.mixpanelMethod)
                  }}
                />
              )
            })}
          </div>
          <Link
            className='flex w-full bg-white-100 dark:bg-gray-900 px-[30px] py-[20px] rounded-[16px]'
            to='/onboardingImport?walletName=hardwarewallet'
            onClick={() => trackCTAEvent('hardware-ledger')}
          >
            <img src={Images.Misc.HardwareWallet} className='mr-4' />
            <Text className='font-bold' size='md'>
              Connect hardware wallet
            </Text>
            <img src={Images.Misc.RightArrow} className='ml-auto' />
          </Link>
        </div>
      )}
    </ExtensionPage>
  )
}
