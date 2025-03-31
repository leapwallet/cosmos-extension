import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, OnboardCard, QrCode, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { ON_RAMP_SUPPORT_CHAINS } from 'config/config'
import { useChainPageInfo } from 'hooks'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { Images } from 'images'
import kadoDarkLogo from 'images/logos/Kado-dark.svg'
import kadoLightLogo from 'images/logos/Kado-light.svg'
import rightArrow from 'images/misc/right-arrow.svg'
import React, { ReactElement } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { sliceAddress } from 'utils/strings'

export type ReceiveTokenProps = {
  isVisible: boolean
  chain?: SupportedChain
  onCloseHandler?: () => void
  tokenBalanceOnChain?: SupportedChain
}

export default function ReceiveToken({
  isVisible,
  onCloseHandler,
  tokenBalanceOnChain,
}: ReceiveTokenProps): ReactElement {
  const wallet = useActiveWallet().activeWallet
  const _activeChain = useActiveChain()
  const activeChain = tokenBalanceOnChain ?? _activeChain
  const { topChainColor } = useChainPageInfo()

  const address = wallet?.addresses[activeChain]
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK
  const walletAddress = useGetWalletAddresses(activeChain)

  const QrCodeProps = {
    height: 250,
    width: 250,
    data: address ?? '',
    image: Images.Logos.CompassCircle,
  }

  return (
    <BottomModal isOpen={isVisible} onClose={onCloseHandler} title={'Your QR code'}>
      {wallet ? (
        <div className='flex flex-col items-center'>
          <div className='rounded-[48px] overflow-hidden bg-white-100 p-[8px] shadow-[0_4px_16px_8px_rgba(0,0,0,0.04)]'>
            <QrCode {...QrCodeProps} />
          </div>
          <div className='inline-block mt-[16px] mb-[12px] text-black-100 dark:text-white-100 font-Satoshi24px text-[28px] leading-[36px] font-black'>
            {formatWalletName(wallet.name)}
          </div>

          {walletAddress.map((address, index) => (
            <React.Fragment key={address}>
              {index !== 0 && <div className='mt-2' />}
              <Buttons.CopyWalletAddress
                color={topChainColor}
                walletAddress={sliceAddress(address)}
                data-testing-id='copy-wallet-address'
                onCopy={() => {
                  if (!address) return
                  UserClipboard.copyText(address)
                }}
              />
            </React.Fragment>
          ))}

          {ON_RAMP_SUPPORT_CHAINS.includes(activeChain) && (
            <div
              className='mt-2'
              onClick={() => {
                window.open(`https://app.kado.money/?apiKey=${process.env.KADO_ON_RAMP_API_KEY}`)
              }}
            >
              <OnboardCard
                imgSrc={isDark ? kadoDarkLogo : kadoLightLogo}
                iconSrc={rightArrow}
                isFilled
                isRounded
                size='lg'
                title={`Buy ${activeChain === 'osmosis' ? 'AxlUSDC' : 'Crypto'} with Kado Ramp`}
              />
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </BottomModal>
  )
}
