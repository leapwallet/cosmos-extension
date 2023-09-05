/* eslint-disable no-unused-vars */
import { useChainsStore, useSelectedNetwork } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { isCompassWallet } from 'utils/isCompassWallet'

export enum BottomNavLabel {
  Home = 'Home',
  NFTs = 'NFTs',
  Stake = 'Stake',
  Activity = 'Activity',
  Governance = 'Governance',
  Earn = 'Earn',
}

type BottomNavProps = {
  label: BottomNavLabel
  disabled?: boolean
}

export default function BottomNav({ label, disabled }: BottomNavProps) {
  const [selected, setSelected] = useState(label)
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const { chains } = useChainsStore()
  const activeChainInfo = chains[activeChain]
  const selectedNetwork = useSelectedNetwork()

  const bottomNavItems = useMemo(
    () => [
      {
        label: BottomNavLabel.Home,
        icon: 'account_balance_wallet',
        path: '/home',
        show: true,
      },
      {
        label: BottomNavLabel.Governance,
        icon: 'insert_chart',
        path: '/gov',
        show: !isCompassWallet(),
      },
      {
        label: BottomNavLabel.NFTs,
        icon: 'sell',
        path: '/nfts',
        show: isCompassWallet(),
      },
      {
        label: BottomNavLabel.Stake,
        icon: 'data_exploration_round',
        path: '/stake',
        show: !activeChainInfo?.disableStaking,
      },
      {
        label: BottomNavLabel.Earn,
        icon: 'attach_money',
        path: '/earn',
        show: !isCompassWallet() && selectedNetwork !== 'testnet',
      },
      {
        label: BottomNavLabel.Activity,
        icon: 'flash_on',
        path: '/activity',
        show: true,
      },
    ],
    [activeChainInfo?.disableStaking, selectedNetwork],
  )

  return (
    <div className='flex absolute justify-around bottom-0 h-[60px] bg-white-100 dark:bg-gray-900 w-full rounded-b-lg z-[0]'>
      {bottomNavItems
        .filter(({ show }) => show)
        .map(({ label, icon, path }, idx) => {
          return (
            <div
              key={`${label}_${idx}`}
              onClick={() => {
                if (disabled) return
                setSelected(label)
                navigate(path)
              }}
              className='flex flex-1 justify-center items-center cursor-pointer relative'
            >
              {selected === label ? (
                <div className='w-full h-1 dark:bg-white-100 bg-black-100 rounded-b absolute top-0'></div>
              ) : null}
              <div className='flex flex-col items-center justify-center'>
                <div
                  className={classNames('material-icons-round w-6 h-6', {
                    'text-gray-900 dark:text-white-100': selected === label,
                    'text-gray-600': selected !== label,
                  })}
                >
                  {icon}
                </div>
                <div
                  className={classNames('text-sm font-bold', {
                    'text-gray-900 dark:text-white-100': selected === label,
                    'text-gray-600': selected !== label,
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
