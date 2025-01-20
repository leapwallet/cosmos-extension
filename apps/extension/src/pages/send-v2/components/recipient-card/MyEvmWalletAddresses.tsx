import {
  capitalize,
  Key,
  SelectedAddress,
  sliceAddress,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React from 'react'

type WalletCardProps = {
  chainInfo: ChainInfo
  wallet: Key
  onClick: (params: { address: string; name: string; chainName: string }) => void
}

const WalletCard = ({ wallet, onClick, chainInfo }: WalletCardProps) => {
  const walletAddress = chainInfo?.evmOnlyChain
    ? pubKeyToEvmAddressToShow(wallet.pubKeys?.[chainInfo?.key])
    : wallet.addresses[chainInfo?.key]

  const walletLabel =
    wallet.walletType === WALLETTYPE.LEDGER
      ? ` · /0'/0/${wallet.addressIndex}`
      : wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
        wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
      ? ` · Imported`
      : ''

  const addressText = `${sliceAddress(walletAddress)}${walletLabel}`

  return (
    <button
      key={wallet.id}
      className='flex items-center px-4 py-4 bg-white-100 dark:bg-gray-900 gap-3 cursor-pointer rounded-2xl'
      onClick={() => {
        const name = `${
          wallet.name.length > 12 ? `${wallet.name.slice(0, 12)}...` : wallet.name
        } - ${capitalize(chainInfo.chainName === 'seiTestnet2' ? 'sei' : chainInfo.chainName)}`
        onClick({
          address: walletAddress,
          chainName: chainInfo.chainName,
          name,
        })
      }}
    >
      <img
        height={40}
        width={40}
        src={wallet?.avatar ?? Images.Misc.getWalletIconAtIndex(wallet.colorIndex)}
        alt={wallet.name}
        className='h-10 w-10 rounded-full'
      />

      <div className='flex flex-col'>
        <span className='text-md font-bold text-black-100 dark:text-white-100 text-left max-w-[170px] text-ellipsis overflow-hidden'>
          {wallet.name}
        </span>
        <span className='text-gray-600 dark:text-gray-400 text-xs'>{addressText}</span>
      </div>
    </button>
  )
}

type MyEvmWalletAddressesProps = {
  chainInfo: ChainInfo
  setSelectedAddress: (address: SelectedAddress) => void
}

export const MyEvmWalletAddresses = ({
  chainInfo,
  setSelectedAddress,
}: MyEvmWalletAddressesProps) => {
  const wallets = Wallet.useWallets()
  const { activeWallet } = useActiveWallet()
  const walletList = Object.values(wallets || {})

  return (
    <div className='flex flex-col gap-3'>
      {walletList.map((wallet) => {
        if (activeWallet?.id === wallet.id) {
          return null
        }

        return (
          <WalletCard
            key={wallet.id}
            chainInfo={chainInfo}
            wallet={wallet}
            onClick={({ address, name, chainName }) => {
              const img = wallet?.avatar ?? Images.Misc.getWalletIconAtIndex(wallet.colorIndex)

              setSelectedAddress({
                address,
                chainName,
                name,
                avatarIcon: img,
                chainIcon: img,
                emoji: undefined,
                selectionType: 'saved',
              })
            }}
          />
        )
      })}
    </div>
  )
}
