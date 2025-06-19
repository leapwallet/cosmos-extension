import { isLedgerUnlocked } from '@leapwallet/cosmos-wallet-sdk'
import { CaretRight } from '@phosphor-icons/react'
import Text from 'components/text'
import { LedgerAppId } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { CosmosHubLogo, SeiLogo } from 'images/logos'
import React, { Dispatch, SetStateAction, useEffect } from 'react'

import { useImportWalletContext } from '../import-wallet-context'

type SelectLedgerAppViewProps = {
  readonly onNext: () => void
}

type SelectAppCardProps = {
  onClick: () => void
  title: string
  descriptions: Array<string>
  headerBadge?: string
  icon: string
}

const SelectAppCard = ({ onClick, title, descriptions, headerBadge, icon }: SelectAppCardProps) => {
  return (
    <button
      onClick={onClick}
      className='block dark:bg-gray-900 bg-gray-200 rounded-xl p-5 w-full mb-4'
    >
      <div className='flex items-center mb-4'>
        <img src={icon} className='w-8 h-8' />
        <Text size='md' className='font-bold ml-3'>
          {title}
        </Text>
        {headerBadge && (
          <div className='dark:bg-green-500/10 bg-green-500/50 p-1 rounded-s rounded-r ml-3'>
            <Text size='xs' color='dark:text-green-500 text-green-200' className='font-medium'>
              {headerBadge}
            </Text>
          </div>
        )}
        <img src={Images.Misc.ArrowSingleRight} alt='arrow-single-right' className='ml-auto' />
      </div>
      <ul className='ml-2'>
        {descriptions.map((item) => (
          <li className='text-left mb-2' key={item}>
            {item}
          </li>
        ))}
      </ul>
    </button>
  )
}

export const SelectLedgerAppView = ({ onNext }: SelectLedgerAppViewProps) => {
  const { setSelectedApp } = useImportWalletContext()
  const onSelectApp = (app: LedgerAppId) => {
    setSelectedApp(app)
    onNext()
  }

  return (
    <div>
      <Text size={'xl'} className='font-bold justify-center mb-8'>
        Choose your Ledger app
      </Text>
      <SelectAppCard
        onClick={() => onSelectApp('sei')}
        title='Sei App'
        descriptions={['Supports Cosmos & EVM transactions', 'You’ll get a new EVM address.']}
        headerBadge='Recommended'
        icon={SeiLogo}
      />
      <SelectAppCard
        onClick={() => onSelectApp('cosmos')}
        title='Cosmos App'
        descriptions={[
          'No support for EVM transactions',
          'Cannot access EVM dApps with this setup',
        ]}
        icon={CosmosHubLogo}
      />
    </div>
  )
}
