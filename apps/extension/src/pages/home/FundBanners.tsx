import { useActiveWallet, useChainInfo, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { useHardCodedActions } from 'components/search-modal'
import Text from 'components/text'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { useAddress } from 'hooks/wallet/useAddress'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useEffect, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

export default function FundBanners() {
  const address = useAddress()
  const activeWallet = useActiveWallet()
  const chain = useChainInfo()
  const { handleSwapClick } = useHardCodedActions()

  const transactUrl = (type: 'buy' | 'swap' | 'bridge') =>
    `https://cosmos.leapwallet.io/transact/${type}?destinationChainId=${chain?.chainId}`

  const [showCopyAddress, setShowCopyAddress] = useState<boolean>(false)

  const trackCTAEvent = (buttonName: string, redirectURL?: string) => {
    mixpanel.track(EventName.ButtonClick, {
      buttonType: ButtonType.ADD_FUNDS,
      buttonName,
      redirectURL,
      time: Date.now() / 1000,
      chainId: chain.chainId,
      chainName: chain.chainName,
    })
  }

  useEffect(() => {
    if (showCopyAddress) {
      setTimeout(() => {
        setShowCopyAddress(false)
      }, 2000)
    }
  }, [showCopyAddress])

  const bannerData = [
    {
      icon: 'copy',
      title: 'Receive Assets',
      content: 'Copy address and transfer funds to this wallet ',
      textColor: '#8583EC',
      onClick: () => {
        if (!activeWallet) return
        if (
          activeWallet.walletType === WALLETTYPE.LEDGER &&
          isLedgerEnabled(chain.key, chain.bip44.coinType)
        ) {
          return
        }
        UserClipboard.copyText(address)
        setShowCopyAddress(true)
        trackCTAEvent(ButtonName.RECEIVE_ASSETS)
      },
    },
    {
      icon: Images.Misc.IbcProtocol,
      type: 'image',
      title: 'IBC Swaps',
      content: 'Swap or transfer from other Cosmos chains',
      textColor: '#C984EB',
      onClick: () => {
        handleSwapClick(transactUrl('swap'))
        trackCTAEvent(ButtonName.IBC_SWAP, transactUrl('swap'))
      },
    },
    {
      icon: 'route',
      title: 'Bridge',
      content: 'Bridge or swap from EVM chains',
      textColor: '#E18881',
      onClick: () => {
        window.open(transactUrl('bridge'), '_blank')
        trackCTAEvent(ButtonName.BRIDGE, transactUrl('bridge'))
      },
    },
    {
      icon: Images.Misc.Add,
      type: 'image',
      title: 'Fiat On-Ramp',
      content: 'Buy assets using any currency',
      textColor: '#FFC770',
      onClick: () => {
        window.open(transactUrl('buy'), '_blank')
        trackCTAEvent(ButtonName.BUY, transactUrl('buy'))
      },
    },
  ]

  return (
    <div className='w-full px-7'>
      <Text size='sm' color='text-gray-500'>
        Deposit {chain?.denom} into this wallet
      </Text>
      <div className='my-4'>
        {bannerData.map((d, index) => (
          <div
            key={index}
            onClick={d.onClick}
            className='flex relative overflow-hidden gap-6 items-center cursor-pointer mb-4 px-4 py-3 rounded-lg dark:bg-gray-900 bg-white-100 dark:shadow-[0px_7px_24px_rgba(0,0,0,0.25)] shadow-[0px_7px_24px_rgba(255,255,255,0.25)]'
          >
            {d?.type === 'image' ? (
              <img src={d.icon} className='w-[30px]' />
            ) : (
              <div className='material-icons-round !text-[30px]' style={{ color: d.textColor }}>
                {d.icon}
              </div>
            )}
            <div>
              <Text className='font-medium mb-1 !leading-5'>{d.title}</Text>
              <Text size='xs' color='text-gray-500' className='font-medium'>
                {d.content}
              </Text>
            </div>
            {showCopyAddress && d.title === 'Receive Assets' && (
              <div className='flex absolute w-full h-full bg-green-600 top-0 left-0 px-4 items-center'>
                <div className='material-icons-round !text-[30px] text-white-100 mr-6'>
                  check_circle
                </div>
                <Text size='sm' className='font-bold dark:text-white-100 text-white-100'>
                  Copied Address
                </Text>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
