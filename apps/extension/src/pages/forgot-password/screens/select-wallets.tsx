import { Buttons } from '@leapwallet/leap-ui'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import WalletInfoCard from 'components/wallet-info-card'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

type SelectWalletProps = {
  readonly onProceed: () => void
  readonly accountsData: readonly { address: string; index: number }[]
  readonly setSelectedIds: React.Dispatch<
    React.SetStateAction<{
      [k: number]: boolean
    }>
  >
  readonly selectedIds: { [id: string]: boolean }
}

function SelectWallets({
  onProceed,
  accountsData,
  selectedIds,
  setSelectedIds,
}: SelectWalletProps) {
  const [viewMore, setViewMore] = useState(false)

  const toggleViewMore = () => setViewMore((v) => !v)

  const walletCards = useMemo(() => {
    return accountsData.map(({ address, index: id }) => {
      const isChosen = selectedIds[id]

      return (
        <WalletInfoCard
          key={id}
          id={id}
          hidden={viewMore ? false : id >= 2}
          cosmosAddress={address}
          isChosen={isChosen}
          isExistingAddress={false}
          onClick={() => {
            setSelectedIds((prev) => ({ ...prev, [id]: !isChosen }))
          }}
        />
      )
    })
  }, [accountsData, selectedIds, setSelectedIds, viewMore])

  const canProceed = Object.values(selectedIds).some((v) => v)

  return (
    <div className='flex flex-row space-x-5'>
      <div className='flex flex-col w-[408px]'>
        <div className='flex flex-row gap-x-[12px]'>
          <img src={Images.Misc.WalletIconWhite} />
          <Text size='xxl' className='font-medium'>
            Select wallets
          </Text>
        </div>
        <Text size='lg' color='text-gray-600 dark:text-gray-400' className='font-light mb-[32px]'>
          If you have used multiple accounts in your wallet, you can choose to import them here.
        </Text>
        <div
          className='flex flex-col space-y-4 overflow-y-auto'
          style={{ maxHeight: 'calc(100vh - 28rem)' }}
        >
          {walletCards}
        </div>
        <div className='mt-4'>
          {viewMore ? (
            <button
              title='Show Less'
              className={classNames(
                'outline-none pr-2 rounded font-bold focus:ring-1 flex items-center justify-around space-x-2',
                {
                  'focus:ring-mainChainTheme-400': !isCompassWallet(),
                  'text-mainChainTheme-400': !isCompassWallet(),
                  'focus:ring-compassChainTheme-400': isCompassWallet(),
                  'text-compassChainTheme-400': isCompassWallet(),
                },
              )}
              onClick={toggleViewMore}
            >
              <CaretUp size={16} className='dark:text-white-100 text-gray-800' />
              <span>Show Less Wallets</span>
            </button>
          ) : (
            <button
              title='Show More'
              className={classNames(
                'outline-none pr-2 rounded font-bold focus:ring-1 flex items-center justify-around space-x-2',
                {
                  'focus:ring-mainChainTheme-400': !isCompassWallet(),
                  'text-mainChainTheme-400': !isCompassWallet(),
                  'focus:ring-compassChainTheme-400': isCompassWallet(),
                  'text-compassChainTheme-400': isCompassWallet(),
                },
              )}
              onClick={toggleViewMore}
            >
              <CaretDown size={16} className='dark:text-white-100 text-gray-800' />
              <span>Show More Wallets</span>
            </button>
          )}
        </div>
        <div className='pt-[32px]'></div>
        <Buttons.Generic
          disabled={!canProceed}
          color={Colors.cosmosPrimary}
          onClick={() => {
            if (canProceed) onProceed()
          }}
        >
          Proceed
        </Buttons.Generic>
      </div>
      <div>
        <div className='shrink flex-col gap-y-[4px] w-[408px] p-[32px] rounded-lg border-[1px] dark:border-gray-800 border-gray-200'>
          <Text size='lg' className='font-medium text-gray-600 dark:text-gray-200'>
            {' '}
            Which wallets are displayed here?
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-400 mb-[32px]'>
            {' '}
            Only wallets with transactions are imported.
          </Text>

          <Text size='lg' className='font-medium text-gray-600 dark:text-gray-200'>
            {' '}
            Can I edit wallet details?
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-400'>
            You can rename, add or remove wallets at any time.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default SelectWallets
