/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getBlockChainFromAddress,
  isEthAddress,
  isValidWalletAddress,
} from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { Buttons, Header, HeaderActionType, Input } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { passwordStore } from 'stores/password-store'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import { Wallet } from '../../hooks/wallet/useWallet'

type ImportWatchAddressProps = {
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (closeParent: boolean) => void
}

export default function ImportWatchWallet({ isVisible, onClose }: ImportWatchAddressProps) {
  const [watchAddress, setWatchAddress] = useState('')
  const [walletName, setWalletName] = useState('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const password = passwordStore.password
  const saveWatchWallet = Wallet.useSaveWatchWallet()
  const chainInfos = useChainInfos()

  const onChangeHandler = (value: string) => {
    setError('')
    setWatchAddress(value)
  }

  const handleImportWallet = async () => {
    setIsLoading(true)

    if (watchAddress && password && !error) {
      try {
        await saveWatchWallet(watchAddress, walletName)
        setWatchAddress('')
        setWalletName('')
        onClose(true)
      } catch (error: any) {
        setError(error.message)
      }
    }

    setIsLoading(false)
  }

  useEffect(() => {
    async function validate() {
      if (!watchAddress) {
        setError('')
        return
      }
      if (!isValidWalletAddress(watchAddress)) {
        setError('Invalid public address, please enter a valid address')
        return
      }
      if (isCompassWallet() && !watchAddress.startsWith('sei') && !isEthAddress(watchAddress)) {
        setError('Invalid public address, please enter a valid address')
        return
      }
      const prefix = getBlockChainFromAddress(watchAddress)
      const chain = Object.values(chainInfos).find((chain) => chain.addressPrefix === prefix)
      const wallets = await KeyChain.getAllWallets()
      const addresses = Object.values(wallets).reduce((acc, wallet) => {
        if (chain) {
          const existingAddress = wallet.addresses[chain?.key]
          if (existingAddress) {
            acc.push(existingAddress)
          }
        }
        return acc
      }, [] as string[])
      if (addresses.includes(watchAddress)) {
        setError('This address already exists in your wallet')
        return
      }
      setError('')
    }
    validate()
  }, [chainInfos, watchAddress])

  if (!isVisible) return null

  return createPortal(
    <div className='panel-height panel-width bg-white-100 dark:bg-black-100 absolute top-0 z-[10000000]'>
      <Header
        title=''
        action={{
          type: HeaderActionType.BACK,
          onClick: () => {
            onClose(false)
            setError('')
            setWatchAddress('')
            setWalletName('')
          },
        }}
      />
      <div className='flex flex-col p-6 justify-between items-center'>
        <div className='flex flex-col items-center gap-y-4'>
          <img src={Images.Misc.GreenEye} className='!w-10 !h-10' />
          <div className='flex flex-col items-center gap-y-1.5'>
            <Text color='text-black-100 dark:text-white-100' className='text-[28px] font-bold'>
              Watch wallet
            </Text>
            <Text
              size='sm'
              color='text-gray-600 dark:text-gray-400'
              className='font-medium text-center'
            >
              Add a wallet address you’d like to watch. You’ll have view-only access to assets &
              balances.
            </Text>
          </div>
          <Input
            placeholder='Public address'
            spellCheck={false}
            autoFocus={true}
            onChange={(e: any) => onChangeHandler(e.target.value)}
            className={classNames(
              'border bg-gray-100 dark:bg-gray-850 text-black-100 dark:text-gray-100 p-4 rounded-2xl w-full text-sm font-medium focus:outline-none',
              {
                '!border-red-300': !!error,
                'dark:!border-gray-850 !border-gray-100 focus:!border-gray-400 dark:focus:!border-gray-400':
                  !error,
              },
            )}
          />
          {error && (
            <Text size='sm' color='text-red-300' className='mx-auto'>
              {error}
            </Text>
          )}
          <div className='flex relative justify-center shrink w-full'>
            <Input
              placeholder='Name your wallet (optional)'
              maxLength={24}
              value={walletName.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
              spellCheck={false}
              onChange={(e: any) => setWalletName(e.target.value)}
              className={classNames(
                'border bg-gray-100 dark:bg-gray-850 text-black-100 dark:text-gray-100 p-4 rounded-2xl w-full text-sm font-medium focus:outline-none dark:!border-gray-850 !border-gray-100 focus:!border-gray-400 dark:focus:!border-gray-400 placeholder:text-gray-400 placeholder:dark:text-gray-700',
              )}
            />
            {walletName.length > 0 ? (
              <div className='absolute right-[16px] top-[14px] text-gray-400 text-sm font-medium'>{`${walletName.length}/24`}</div>
            ) : null}
          </div>
        </div>
        <Buttons.Generic
          size='normal'
          disabled={!watchAddress || !!error || isLoading}
          onClick={handleImportWallet}
          color={Colors.green600}
          className='w-[344px] absolute bottom-6'
        >
          {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Start watching'}
        </Buttons.Generic>
      </div>
    </div>,
    document.getElementById('popup-layout')?.parentNode as HTMLElement,
  )
}
