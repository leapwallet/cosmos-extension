import { useActiveChain, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  Buttons,
  HeaderActionType,
  OnboardCard,
  QrCode,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { ON_RAMP_SUPPORT_CHAINS } from 'config/config'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import kadoDarkLogo from 'images/logos/Kado-dark.svg'
import kadoLightLogo from 'images/logos/Kado-light.svg'
import rightArrow from 'images/misc/right-arrow.svg'
import React, { ReactElement } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { isCompassWallet } from 'utils/isCompassWallet'
import { sliceAddress } from 'utils/strings'

export type ReceiveTokenProps = {
  isVisible: boolean
  chain?: SupportedChain
  onCloseHandler?: () => void
}

export default function ReceiveToken({
  isVisible,
  onCloseHandler,
}: ReceiveTokenProps): ReactElement {
  const wallet = useActiveWallet().activeWallet
  const activeChainInfo = useChainInfo()
  const activeChain = useActiveChain()
  const address = wallet?.addresses[activeChainInfo.key]
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK
  const QrCodeProps = {
    height: 250,
    width: 250,
    data: address ?? '',
  }
  if (isCompassWallet()) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    QrCodeProps.image = Images.Logos.CompassCircle
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler as () => void}
      headerTitle={'Your QR code'}
      closeOnClickBackDrop={true}
      headerActionType={HeaderActionType.CANCEL}
    >
      {wallet ? (
        <div className='flex flex-col items-center w-[400px] mb-[40px]'>
          <div className='rounded-[48px] overflow-hidden mt-[28px] bg-white-100 p-[8px] ml-[40px] mr-[40px] shadow-[0_4px_16px_8px_rgba(0,0,0,0.04)]'>
            <QrCode {...QrCodeProps} />
          </div>
          <div className='inline-block mt-[16px] mb-[12px] text-black-100 dark:text-white-100 font-Satoshi24px text-[28px] leading-[36px] font-black'>
            {formatWalletName(wallet.name)}
          </div>
          <Buttons.CopyWalletAddress
            color={Colors.getChainColor(activeChain)}
            walletAddress={sliceAddress(address)}
            data-testing-id='copy-wallet-address'
            onCopy={() => {
              if (!address) return
              UserClipboard.copyText(address)
            }}
          />
          {ON_RAMP_SUPPORT_CHAINS.includes(activeChainInfo.key) && (
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
                title={`Buy ${
                  activeChainInfo.key === 'osmosis' ? 'AxlUSDC' : 'Crypto'
                } with Kado Ramp`}
              />
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </BottomSheet>
  )
}
