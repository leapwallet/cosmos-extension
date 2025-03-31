import { Key } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Images } from 'images'
import { addToConnections } from 'pages/ApproveConnection/utils'
import React from 'react'

export const WalletNotConnectedMsg = ({
  currentWalletInfo,
  onClose,
}: {
  currentWalletInfo?: {
    wallets: [Key]
    chainIds: [string]
    origin: string
  } | null
  onClose: VoidFunction
}) => {
  const walletName = currentWalletInfo?.wallets?.[0]?.name
  const walletColorIndex = currentWalletInfo?.wallets?.[0]?.colorIndex
  const siteName =
    currentWalletInfo?.origin?.split('//')?.at(-1)?.split('.')?.at(-2) ||
    currentWalletInfo?.origin?.split('//')?.at(-1)

  const siteLogo = useSiteLogo(currentWalletInfo?.origin)

  const handleConnectWalletClick = async () => {
    const walletIds = currentWalletInfo?.wallets.map((wallet) => wallet.id)
    await addToConnections(
      currentWalletInfo?.chainIds as [string],
      walletIds ?? [],
      currentWalletInfo?.origin as string,
    )
    onClose()
  }

  return (
    <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 min-h-[100px] justify-center items-center p-2 mb-4'>
      <div className='pt-8 pb-2 flex flex-row'>
        <img
          src={Images.Misc.getWalletIconAtIndex(
            walletColorIndex as number,
            currentWalletInfo?.wallets?.[0]?.watchWallet,
          )}
          className='z-10 border-2 border-gray-900 rounded-full relative left-2'
        />
        <object data={siteLogo} type='image' className='relative -left-2 z-0'>
          <img src={Images.Misc.DefaultWebsiteIcon} alt='Website default icon' />
        </object>
      </div>
      <Text size='md' color='text-green-600' className='font-bold my-2'>
        {siteName}
      </Text>
      <Text size='xl' className='my-0 font-extrabold'>
        {walletName} not Connected
      </Text>
      <Text size='xs' style={{ textAlign: 'center' }} className='mb-2' color='text-gray-400'>
        You can connect this wallet, or can switch to an already connected wallet.
      </Text>
      <div
        onClick={handleConnectWalletClick}
        style={{ background: 'rgba(225, 136, 129, 0.1)', color: '#E18881' }}
        className='font-bold p-1 px-2 rounded-2xl cursor-pointer my-2'
      >
        Connect {walletName}
      </div>
    </div>
  )
}
