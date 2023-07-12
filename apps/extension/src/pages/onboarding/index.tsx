import { KeyChain } from '@leapwallet/leap-keychain'
import { OnboardCard as Card } from '@leapwallet/leap-ui'
import ExtensionPage from 'components/extension-page'
import { Header } from 'components/Header'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { AuthContextType, useAuth } from 'context/auth-context'
import { usePassword } from 'hooks/settings/usePassword'
import { Images } from 'images'
import React, { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import { isCompassWallet } from 'utils/isCompassWallet'
import extension from 'webextension-polyfill'

import { IMPORT_WALLET_DATA } from './constants'

export default function Onboarding() {
  const navigate = useNavigate()
  const { loading, noAccount } = useAuth() as AuthContextType
  const password = usePassword()

  const importWalletData = useMemo(() => {
    const keplrWallet = {
      imgSrc: Images.Logos.Keplr,
      title: 'Keplr',
      'data-testing-id': '',
    }

    if (isCompassWallet()) {
      return {
        Leap: {
          imgSrc: Images.Logos.LeapLogo28,
          title: 'Leap',
          'data-testing-id': '',
        },
        Keplr: keplrWallet,
        ...IMPORT_WALLET_DATA,
      }
    } else {
      return {
        Keplr: keplrWallet,
        Cosmostation: {
          imgSrc: Images.Logos.CosmoStation,
          title: 'Cosmostation',
          'data-testing-id': '',
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
            onClick={() => navigate('/onboardingCreate')}
            data-testing-id='create-new-wallet'
          />

          <div className='flex flex-col rounded-[12px] px-[20px] py-[24px] bg-white-100 dark:bg-gray-900 gap-y-[12px]'>
            <Text size='lg' className='items-start self-start pl-[5px] font-medium'>
              Import an existing wallet:
            </Text>
            {Object.values(importWalletData).map((val, ind) => (
              <Card
                key={ind}
                className='border-[1px] dark:border-gray-800 border-gray-100'
                imgSrc={val.imgSrc}
                title={val.title ?? 'Using a Seed phrase'}
                data-testing-id={val['data-testing-id']}
                isFilled={true}
                isRounded={true}
                iconSrc={Images.Misc.RightArrow}
                size='sm'
                onClick={() => navigate(`/onboardingImport?walletName=${val.title ?? ''}`)}
              />
            ))}
          </div>
          <Link
            className='flex w-full bg-white-100 dark:bg-gray-900 px-[30px] py-[20px] rounded-[16px]'
            to='/onboardingImport?walletName=hardwarewallet'
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
