import { Key, useSetPrimaryAddress } from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { WALLETTYPE } from '@leapwallet/cosmos-wallet-store'
import { KeyChain } from '@leapwallet/leap-keychain'
import { MinusCircle } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { DISABLE_BANNER_ADS, PRIMARY_WALLET_ADDRESS } from 'config/storage-keys'
import { getPrimaryWalletAddress } from 'hooks/wallet/useInitPrimaryWalletAddress'
import React from 'react'
import browser from 'webextension-polyfill'

import { Wallet } from '../../hooks/wallet/useWallet'
import { CopyButton } from './EditWallet/copy-address'

type EditWalletFormProps = {
  wallet: Key
  isVisible: boolean
  address: string
  onClose: (closeParent: boolean) => void
}

export const RemoveWallet = ({ isVisible, wallet, onClose, address }: EditWalletFormProps) => {
  const { removeWallets } = Wallet.useRemoveWallet()
  const setPrimaryWalletAddress = useSetPrimaryAddress()

  const handleRemoveWallet = async () => {
    if (wallet) {
      await removeWallets([wallet.id])

      const storedDisabledBannerAds = await browser.storage.local.get([DISABLE_BANNER_ADS])
      const parsedDisabledAds = JSON.parse(storedDisabledBannerAds[DISABLE_BANNER_ADS] ?? '{}')

      let walletAddress = wallet?.addresses?.cosmos
      if (!walletAddress) {
        const evmPubKey = wallet?.pubKeys?.ethereum
        if (evmPubKey) {
          walletAddress = pubKeyToEvmAddressToShow(evmPubKey, true) || ''
        }
        if (!evmPubKey) {
          const solanaPubKey = wallet?.pubKeys?.solana
          if (solanaPubKey) {
            walletAddress = solanaPubKey
          }
          if (!solanaPubKey) {
            const suiPubKey = wallet?.addresses?.sui
            if (suiPubKey) {
              walletAddress = suiPubKey
            }
          }
        }
      }

      if (parsedDisabledAds[walletAddress]) {
        delete parsedDisabledAds[walletAddress]

        await browser.storage.local.set({
          [DISABLE_BANNER_ADS]: JSON.stringify(parsedDisabledAds),
        })
      }

      onClose(true)

      let primaryWalletAddress = ''
      const res = await browser.storage.local.get([PRIMARY_WALLET_ADDRESS])
      primaryWalletAddress = res[PRIMARY_WALLET_ADDRESS]
      if (primaryWalletAddress === walletAddress) {
        getPrimaryWalletAddress(setPrimaryWalletAddress)
      }
    }
  }

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => onClose(false)}
      title={'Remove wallet?'}
      footerComponent={
        <>
          <Button variant='secondary' size='md' onClick={() => onClose(false)} className='flex-1'>
            Don&apos;t Remove
          </Button>
          <Button
            data-testing-id='btn-remove-wallet'
            onClick={handleRemoveWallet}
            size='md'
            variant='destructive'
            className='flex-1'
          >
            Remove
          </Button>
        </>
      }
    >
      <div className='flex flex-col justify-center gap-y-5 items-center p-6'>
        <div className='rounded-full bg-secondary-500 size-20 flex items-center justify-center'>
          <MinusCircle weight='fill' className='text-foreground/80 size-9' />
        </div>

        <span className='flex flex-col justify-center items-center'>
          <span className='text-md font-medium text-center text-muted-foreground'>
            Are you sure you want to remove
          </span>
          <span className='text-lg font-bold'>{wallet?.name}</span>
        </span>

        {address && <CopyButton address={address} />}
      </div>
    </BottomModal>
  )
}
