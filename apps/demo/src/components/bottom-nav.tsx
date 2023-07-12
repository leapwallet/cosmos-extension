import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { useActiveChain } from '~/hooks/settings/use-active-chain'

export enum BottomNavLabel {
  Home = 'Home',
  NFTs = 'NFTs',
  Stake = 'Stake',
  Activity = 'Activity',
  Governance = 'Governance',
}

type BottomNavProps = {
  label: BottomNavLabel
  disabled?: boolean
}

export default function BottomNav({ label, disabled }: BottomNavProps) {
  const [selected, setSelected] = useState(label)
  const navigate = useNavigate()

  const activeChain = useActiveChain()

  const bottomNavItems = useMemo(
    () => [
      {
        label: BottomNavLabel.Home,
        icon: 'account_balance_wallet',
        path: '/',
        show: true,
      },
      {
        label: BottomNavLabel.NFTs,
        icon: 'sell',
        path: '/nfts',
        show: activeChain === 'stargaze',
      },
      {
        label: BottomNavLabel.Governance,
        icon: 'insert_chart',
        path: '/gov',
        show: true,
      },
      {
        label: BottomNavLabel.Stake,
        icon: 'data_exploration_round',
        path: '/stake',
        show: true,
      },
      {
        label: BottomNavLabel.Activity,
        icon: 'flash_on',
        path: '/activity',
        show: true,
      },
    ],
    [activeChain],
  )

  return (
    <div className='flex absolute justify-around bottom-0 h-[60px] bg-white-100 dark:bg-gray-900 w-full rounded-b-lg'>
      {bottomNavItems.map(({ label, icon, path, show }) => {
        return (
          <React.Fragment key={label}>
            {show && (
              <div
                onClick={() => {
                  if (disabled) return
                  setSelected(label)
                  navigate(path)
                }}
                className='flex flex-1 justify-center items-center cursor-pointer relative'
                key={label}
              >
                {selected === label ? (
                  <div className='w-24 h-1 dark:bg-white-100 bg-black-100 rounded-b absolute top-0'></div>
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
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
