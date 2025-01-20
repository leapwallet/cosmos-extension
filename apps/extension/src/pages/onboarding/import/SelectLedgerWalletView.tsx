import { KeyChain } from '@leapwallet/leap-keychain'
import { Buttons } from '@leapwallet/leap-ui'
import CssLoader from 'components/css-loader/CssLoader'
import { WalletInfoCardSkeletons } from 'components/Skeletons'
import Text from 'components/text'
import WalletInfoCard from 'components/wallet-info-card'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import ImportEvmModal from './ImportEvmModal'

type SelectWalletViewProps = {
  readonly onProceed: () => void
  readonly accountsData: readonly { address: string; index: number }[]
  readonly setSelectedIds: (val: { [id: number]: boolean }) => void
  readonly selectedIds: { [id: string]: boolean }
  onEVMConnect: () => void
  getLedgerAccountDetailsForIdxs: (useEvmApp: boolean, idxs: number[]) => Promise<void>
}

export default function SelectLedgerWalletView({
  onProceed,
  accountsData,
  selectedIds,
  setSelectedIds,
  onEVMConnect,
  getLedgerAccountDetailsForIdxs,
}: SelectWalletViewProps) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [existingAddresses, setExistingAddresses] = useState<string[]>([])
  const [showEvmModal, setShowEvmModal] = useState<boolean>(false)
  const [isAdvanceModeEnabled] = useState<boolean>(false)

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        const address = isCompassWallet() ? wallet.addresses.seiTestnet2 : wallet.addresses.cosmos
        addresses.push(address)
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  useEffect(() => {
    const fetchMoreWallets = document.getElementById('fetch-more-wallets')
    if (!fetchMoreWallets) return

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        const idxs = [0, 1, 2, 3, 4].map((_, index) => {
          return (accountsData ?? []).length + index
        })

        getLedgerAccountDetailsForIdxs(false, idxs)
      }
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    })

    observer.observe(fetchMoreWallets)
    return () => observer.disconnect()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsData?.length])

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

  const customAccountsData: { address: string; index: number }[] = useMemo(() => {
    return []
  }, [])

  const walletCards = useCallback(
    (type: 'custom' | undefined = undefined) => {
      const data = type === 'custom' ? customAccountsData : accountsData

      return (
        <>
          {data.map(({ address, index: id }) => {
            const isExistingAddress = existingAddresses.indexOf(address) > -1
            const isChosen = selectedIds[id]

            return (
              <WalletInfoCard
                data-testing-id={id === 0 ? 'wallet-1' : ''}
                key={id}
                id={id}
                cosmosAddress={address}
                isChosen={isChosen}
                isExistingAddress={isExistingAddress}
                showDerivationPath={isAdvanceModeEnabled}
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

          <div className='w-full' id='fetch-more-wallets'>
            <WalletInfoCardSkeletons />
          </div>
        </>
      )
    },
    [
      customAccountsData,
      accountsData,
      existingAddresses,
      selectedIds,
      isAdvanceModeEnabled,
      setSelectedIds,
    ],
  )

  return (
    <div className=''>
      <Text className='text-[28px] font-black mb-3 justify-center'>Select wallets</Text>
      <Text
        size='md'
        color='text-gray-600 dark:text-gray-400'
        className='font-bold mb-20 justify-center'
      >
        Select all the wallets you want to import.
      </Text>

      <div className='flex gap-6'>
        <div className='flex flex-col w-[408px] px-4'>
          <div className='relative'>
            <div className='select-wallets flex flex-col space-y-4 h-[470px] overflow-y-scroll pb-8 pr-3'>
              {customAccountsData?.length > 0 && (
                <>
                  <Text className='font-bold'>Custom derivation path</Text>
                  {walletCards('custom')}
                  <Text className='font-bold'>Default wallets</Text>
                </>
              )}

              {walletCards()}
            </div>

            <div className='absolute h-10 w-full bottom-0 left-0 bg-gradient-to-t from-black-100 to-black-50' />
          </div>

          {error && (
            <Text size='sm' color='text-red-300 mt-[16px]'>
              {' '}
              {error}
            </Text>
          )}

          {isLoading ? (
            <Buttons.Generic
              color={Colors.cosmosPrimary}
              type='button'
              className='flex items-center'
            >
              <CssLoader />
            </Buttons.Generic>
          ) : (
            <Buttons.Generic
              disabled={isLoading || Object.values(selectedIds).filter((val) => val).length === 0}
              color={Colors.cosmosPrimary}
              onClick={() => {
                if (!isCompassWallet()) {
                  setShowEvmModal(true)
                } else {
                  handleProceedClick()
                }
              }}
              data-testing-id='btn-select-wallet-proceed'
            >
              Import
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

      {showEvmModal && (
        <ImportEvmModal
          onNo={handleProceedClick}
          onClose={() => setShowEvmModal(false)}
          onYes={() => {
            onEVMConnect()
            setShowEvmModal(false)
          }}
        />
      )}
    </div>
  )
}
