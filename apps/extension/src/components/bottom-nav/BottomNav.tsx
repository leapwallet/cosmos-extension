/* eslint-disable no-unused-vars */
import {
  useChainsStore,
  useFeatureFlags,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { isCompassWallet } from 'utils/isCompassWallet'

export enum BottomNavLabel {
  Home = 'Home',
  NFTs = 'NFTs',
  Stake = 'Stake',
  Activity = 'Activity',
  Governance = 'Governance',
  Earn = 'Earn',
  Airdrops = 'Airdrops',
  Swap = 'Swap',
}

type BottomNavProps = {
  label: BottomNavLabel
  disabled?: boolean
}

export default function BottomNav({ label, disabled: disabledAll }: BottomNavProps) {
  const [selected, setSelected] = useState(label)
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const { chains } = useChainsStore()
  const activeChainInfo = chains[activeChain]
  const selectedNetwork = useSelectedNetwork()
  const { data: featureFlags } = useFeatureFlags()
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK
  const walletCtaDisabled = activeChain === 'nomic'

  const govRedirectHandler = useCallback(() => {
    const redirectUrl = `https://cosmos.leapwallet.io/portfolio/gov?chain=${activeChainInfo?.key}`
    window.open(redirectUrl, '_blank')
  }, [activeChainInfo?.key])

  const airdropRedirectHandler = useCallback(() => {
    const redirectUrl = `https://cosmos.leapwallet.io/airdrops`
    window.open(redirectUrl, '_blank')
  }, [])

  const bottomNavItems = useMemo(
    () => [
      {
        label: BottomNavLabel.Home,
        icon: 'account_balance_wallet',
        path: '/home',
        show: true,
      },
      {
        label: BottomNavLabel.Stake,
        icon: 'monetization_on',
        path: '/stake',
        show: true,
        disabled: activeChainInfo?.disableStaking,
      },
      {
        label: BottomNavLabel.Swap,
        icon: 'sync_alt',
        path: '/swap',
        show: true,
        disabled: featureFlags?.swaps?.extension === 'disabled' || walletCtaDisabled,
      },
      {
        label: BottomNavLabel.NFTs,
        icon: 'sell',
        path: '/nfts',
        show: isCompassWallet(),
      },
      {
        label: BottomNavLabel.Airdrops,
        icon: 'paragliding',
        path: '/airdrops',
        show: !isCompassWallet() && featureFlags?.airdrops?.extension !== 'disabled',
        shouldRedirect: featureFlags?.airdrops?.extension === 'redirect',
        redirectHandler: airdropRedirectHandler,
      },
      {
        label: BottomNavLabel.Activity,
        icon: 'broken_image',
        path: '/activity',
        show: true,
      },
    ],
    [
      activeChainInfo?.disableStaking,
      featureFlags?.swaps?.extension,
      featureFlags?.airdrops?.extension,
      govRedirectHandler,
      selectedNetwork,
      walletCtaDisabled,
    ],
  )

  return (
    <div className='flex absolute justify-around bottom-0 h-[65px] w-full rounded-b-lg z-[0] shadow-[0_-8px_20px_0px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_20px_0px_rgba(0,0,0,0.26)]'>
      <Images.Nav.BottomNav
        fill={isDark ? '#141414' : '#FFF'}
        stroke={isDark ? '#2C2C2C' : '#E8E8E8'}
        className='absolute bottom-0'
      />
      {bottomNavItems
        .filter(({ show }) => show)
        .map(({ label, icon, path, shouldRedirect, redirectHandler, disabled }, idx) => {
          const isDisabled = disabledAll || disabled
          return (
            <div
              key={`${label}_${idx}`}
              onClick={() => {
                if (isDisabled) return
                if (shouldRedirect === true && redirectHandler) {
                  redirectHandler()
                  return
                }
                setSelected(label)
                navigate(path)
              }}
              className={classNames(
                'flex flex-1 justify-center items-center cursor-pointer relative',
                {
                  '!cursor-not-allowed': isDisabled,
                },
              )}
            >
              {selected === label ? (
                <div className='w-full h-1 bg-green-600 rounded-b absolute top-0'></div>
              ) : null}
              <div className='flex flex-col items-center justify-center'>
                {label === BottomNavLabel.Swap ? (
                  <div
                    style={{ fontSize: 24 }}
                    className={classNames(
                      'material-icons-round mt-[-20px] w-10 h-10 rounded-full flex items-center justify-center',
                      {
                        'bg-green-600 text-white-100': !isDisabled,
                        'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600': isDisabled,
                      },
                    )}
                  >
                    {icon}
                  </div>
                ) : (
                  <div
                    style={{ fontSize: 20 }}
                    className={classNames('material-icons-round', {
                      'text-black-100 dark:text-white-100': selected === label,
                      'text-gray-400 dark:text-gray-600': selected !== label,
                    })}
                  >
                    {icon}
                  </div>
                )}
                <div
                  className={classNames('text-xs font-bold mt-1', {
                    'text-black-100 dark:text-white-100': selected === label && !isDisabled,
                    'text-gray-400 dark:text-gray-600': selected !== label && !isDisabled,
                    'text-[#D3D3D3] dark:text-[#2C2C2C]': isDisabled,
                  })}
                >
                  {label}
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}
