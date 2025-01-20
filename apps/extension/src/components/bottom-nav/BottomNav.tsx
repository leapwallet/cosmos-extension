/* eslint-disable no-unused-vars */
import {
  useChainsStore,
  useFeatureFlags,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import {
  ArrowsLeftRight,
  CurrencyDollar,
  MagnifyingGlass,
  Parachute,
  Pulse,
  Tag,
  Wallet,
} from '@phosphor-icons/react'
import classNames from 'classnames'
import { LEAPBOARD_URL } from 'config/constants'
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
  Search = 'Search',
}

type BottomNavProps = {
  label: BottomNavLabel
  disabled?: boolean
}

export default function BottomNav({ label, disabled: disabledAll }: BottomNavProps) {
  const [selected, setSelected] = useState(label)
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()
  const { chains } = useChainsStore()
  const activeChainInfo = chains[activeChain]
  const { data: featureFlags } = useFeatureFlags()
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK

  const airdropRedirectHandler = useCallback(() => {
    const redirectUrl = `${LEAPBOARD_URL}/airdrops`
    window.open(redirectUrl, '_blank')
  }, [])

  const stakeRedirectForInitiaHandler = useCallback(() => {
    const redirectUrl = `https://app.testnet.initia.xyz/stake`
    window.open(redirectUrl, '_blank')
  }, [])

  const bottomNavItems = useMemo(() => {
    const isSwapDisabled =
      featureFlags?.swaps?.extension === 'disabled' ||
      ['nomic', 'seiDevnet'].includes(activeChain) ||
      (isCompassWallet() && activeChain === 'seiTestnet2' && activeNetwork === 'testnet')

    return [
      {
        label: BottomNavLabel.Home,
        icon: <Wallet size={22} weight='fill' />,
        path: '/home',
        show: true,
      },
      isCompassWallet() && activeChain === 'seiTestnet2' && activeNetwork === 'mainnet'
        ? {
            label: BottomNavLabel.Search,
            icon: <MagnifyingGlass size={22} />,
            path: '/search?pageSource=bottomNav',
            show: true,
          }
        : {
            label: BottomNavLabel.Stake,
            icon: <CurrencyDollar size={22} weight='fill' />,
            path: '/stake?pageSource=bottomNav',
            show: true,
            disabled: activeChainInfo?.disableStaking || activeChainInfo?.evmOnlyChain,
            redirectHandler: stakeRedirectForInitiaHandler,
          },
      {
        label: BottomNavLabel.Swap,
        icon: <ArrowsLeftRight size={22} weight='bold' />,
        path: '/swap?pageSource=bottomNav',
        show: true,
        disabled: isSwapDisabled,
      },
      {
        label: BottomNavLabel.NFTs,
        icon: <Tag size={22} weight='fill' />,
        path: '/nfts',
        show: isCompassWallet(),
      },
      {
        label: BottomNavLabel.Airdrops,
        icon: <Parachute size={22} weight='fill' />,
        path: '/airdrops',
        show: !isCompassWallet() && featureFlags?.airdrops?.extension !== 'disabled',
        shouldRedirect: featureFlags?.airdrops?.extension === 'redirect',
        redirectHandler: airdropRedirectHandler,
      },
      {
        label: BottomNavLabel.Activity,
        icon: <Pulse size={22} weight='fill' />,
        path: '/activity',
        show: true,
      },
    ]
  }, [
    featureFlags?.swaps?.extension,
    featureFlags?.airdrops?.extension,
    activeChain,
    activeNetwork,
    activeChainInfo?.disableStaking,
    activeChainInfo?.evmOnlyChain,
    stakeRedirectForInitiaHandler,
    airdropRedirectHandler,
  ])

  return (
    <div className='flex absolute justify-around bottom-0 h-[65px] w-full rounded-b-lg z-[0] bg-white-100 dark:bg-gray-950 shadow-[0_-8px_20px_0px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_20px_0px_rgba(0,0,0,0.26)]'>
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
                      'mt-[-20px] w-10 h-10 rounded-full flex items-center justify-center',
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
                    className={classNames({
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
