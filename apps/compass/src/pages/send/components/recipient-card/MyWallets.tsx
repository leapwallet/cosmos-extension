import { SelectedAddress } from '@leapwallet/cosmos-wallet-hooks'
import { Compass, MagnifyingGlassMinus } from '@phosphor-icons/react'
import classNames from 'classnames'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { capitalize, sliceAddress } from 'utils/strings'

interface MyWalletsProps {
  setSelectedAddress: (address: SelectedAddress) => void
  skipSupportedDestinationChainsIDs: string[]
}

function MyWallets({ skipSupportedDestinationChainsIDs, setSelectedAddress }: MyWalletsProps) {
  const activeChain = useActiveChain()
  const { activeWallet } = useActiveWallet()
  const wallets = Wallet.useWallets()

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .filter((wallet) => wallet.id !== activeWallet?.id)
          .sort((a, b) => a.name.localeCompare(b.name))
      : []
  }, [activeWallet?.id, wallets])

  return (
    <div className='relative mt-2 w-full h-[calc(100%-235px)]] overflow-auto'>
      {walletsList.length > 0 ? (
        walletsList.map((wallet, index) => {
          const isLast = index === walletsList.length - 1
          const isFirst = index === 0

          const addressText = wallet.addresses[activeChain]

          return (
            <React.Fragment key={wallet.id}>
              <button
                className={classNames('w-full flex items-center gap-3 cursor-pointer', {
                  '!cursor-not-allowed opacity-50': !addressText,
                  'pb-4': isFirst && !isLast,
                  'pt-4': isLast && !isFirst,
                  'py-4': !isFirst && !isLast,
                })}
                onClick={() => {
                  setSelectedAddress({
                    address: addressText,
                    avatarIcon: Images.Misc.getWalletIconAtIndex(wallet.colorIndex),
                    chainIcon: '',
                    chainName: activeChain,
                    emoji: undefined,
                    name: `${
                      wallet.name.length > 12 ? `${wallet.name.slice(0, 12)}...` : wallet.name
                    }`,
                    selectionType: 'currentWallet',
                  })
                }}
                disabled={!addressText}
              >
                <div className='flex gap-4 items-center'>
                  <img className='h-11 w-11' src={Images.Misc.getWalletIconAtIndex(1)} />

                  <div className='flex flex-col'>
                    <p className='font-bold text-left text-monochrome text-sm capitalize'>
                      {wallet.name}
                    </p>
                    <p className='text-sm text-muted-foreground'>{sliceAddress(addressText)}</p>
                  </div>
                </div>
              </button>

              {!isLast && <div className='border-b w-full border-gray-100 dark:border-gray-850' />}
            </React.Fragment>
          )
        })
      ) : (
        <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
          <MagnifyingGlassMinus
            size={64}
            className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
          />
          <div className='flex flex-col justify-start items-center w-full gap-3'>
            <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
              No wallets found
            </div>
            <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
              Use Compass’ in-wallet options to get started.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyWallets
