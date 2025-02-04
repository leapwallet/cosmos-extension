import { KeyChain } from '@leapwallet/leap-keychain'
import { Buttons } from '@leapwallet/leap-ui'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import classNames from 'classnames'
import CssLoader from 'components/css-loader/CssLoader'
import Text from 'components/text'
import WalletInfoCard from 'components/wallet-info-card'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

type SelectWalletViewProps = {
  readonly onProceed: () => void
  readonly accountsData: readonly { address: string; index: number }[]
  readonly setSelectedIds: (val: { [id: number]: boolean }) => void
  readonly selectedIds: { [id: string]: boolean }
}

export function SelectWalletView({
  onProceed,
  accountsData,
  selectedIds,
  setSelectedIds,
}: SelectWalletViewProps) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [existingAddresses, setExistingAddresses] = useState<string[]>([])

  const [viewMore, setViewMore] = useState(false)
  const toggleViewMore = () => setViewMore((v) => !v)

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        const address = isCompassWallet() ? wallet.addresses.seiTestnet2 : wallet.addresses.cosmos
        if ((wallet as any)?.watchWallet) continue
        addresses.push(address)
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  const validate = () => {
    setError('')
    if (!Object.values(selectedIds).some((val) => val)) {
      setError('Please select at least one wallet')
      return false
    }

    return true
  }

  const handleProceedClick = () => {
    setIsLoading(true)
    if (validate()) onProceed()
  }

  const walletCards = useMemo(() => {
    return (
      <>
        {accountsData.map(({ address, index: id }) => {
          const isExistingAddress = existingAddresses.indexOf(address) > -1
          const isChosen = selectedIds[id]

          return (
            <WalletInfoCard
              data-testing-id={id === 0 ? 'wallet-1' : ''}
              key={id}
              id={id}
              hidden={viewMore ? false : id >= 2}
              cosmosAddress={address}
              isChosen={isChosen}
              isExistingAddress={isExistingAddress}
              onClick={() => {
                if (!isExistingAddress) {
                  const copy = selectedIds

                  if (!isChosen) {
                    setSelectedIds({ ...copy, [id]: true })
                  } else {
                    setSelectedIds({ ...copy, [id]: false })
                  }
                }
              }}
            />
          )
        })}
      </>
    )
  }, [accountsData, existingAddresses, selectedIds, setSelectedIds, viewMore])

  return (
    <div className='flex flex-row gap-x-[20px]'>
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

        <div className='flex flex-col space-y-4'>{walletCards}</div>
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
              <CaretUp size={16} />
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
              <CaretDown size={16} />
              <span>Show More Wallets</span>
            </button>
          )}
        </div>

        {error && (
          <Text size='sm' color='text-red-300 mt-[16px]'>
            {' '}
            {error}
          </Text>
        )}

        <div className='pt-[32px]'></div>

        {isLoading ? (
          <Buttons.Generic color={Colors.cosmosPrimary} type='button' className='flex items-center'>
            <CssLoader />
          </Buttons.Generic>
        ) : (
          <Buttons.Generic
            disabled={isLoading || Object.values(selectedIds).filter((val) => val).length === 0}
            color={Colors.cosmosPrimary}
            onClick={handleProceedClick}
            data-testing-id='btn-select-wallet-proceed'
          >
            Proceed
          </Buttons.Generic>
        )}
      </div>

      <div>
        <div className='shrink flex-col gap-y-[4px] w-[408px] p-[32px] rounded-lg border-[1px] dark:border-gray-800 border-gray-200'>
          <Text size='lg' className='font-medium text-gray-600 dark:text-gray-200'>
            Which wallets are displayed here?
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-400 mb-[32px]'>
            Only wallets with transactions are imported.
          </Text>

          <Text size='lg' className='font-medium text-gray-600 dark:text-gray-200'>
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
