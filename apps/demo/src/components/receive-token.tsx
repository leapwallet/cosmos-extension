import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  Buttons,
  HeaderActionType,
  OnboardCard,
  QrCode,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import React, { ReactElement } from 'react'

import BottomSheet from '~/components/bottom-sheet'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import kadoDarkLogo from '~/images/logos/Kado-dark.svg'
import kadoLightLogo from '~/images/logos/Kado-light.svg'
import rightArrow from '~/images/misc/right-arrow.svg'
import { Colors } from '~/theme/colors'
import { sliceAddress } from '~/util/strings'

export type ReceiveTokenProps = {
  isVisible: boolean
  chain?: SupportedChain
  onCloseHandler: () => void
}

export default function ReceiveToken({
  isVisible,
  onCloseHandler,
}: ReceiveTokenProps): ReactElement {
  const wallet = useActiveWallet()
  const activeChain = useActiveChain()
  const address = wallet?.addresses[activeChain]
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle={'Your QR code'}
      closeOnClickBackDrop={true}
      headerActionType={HeaderActionType.CANCEL}
    >
      {!!wallet && (
        <div className='flex flex-col items-center w-[420px] mb-[40px]'>
          <div className='rounded-[48px] overflow-hidden mt-[28px] bg-white-100 p-[8px] ml-[40px] mr-[40px] shadow-[0_4px_16px_8px_rgba(0,0,0,0.04)]'>
            <QrCode height={312} width={312} data={address} />
          </div>
          <div className='inline-block mt-[16px] mb-[12px] text-black-100 dark:text-white-100 font-Satoshi24px text-[28px] leading-[36px] font-black'>
            {wallet.name}
          </div>
          <Buttons.CopyWalletAddress
            color={Colors.getChainColor(activeChain)}
            walletAddress={sliceAddress(address)}
            data-testing-id='copy-wallet-address'
            onCopy={async () => {
              await navigator.clipboard.writeText(address)
            }}
          />
          {['osmosis', 'juno', 'kujira'].includes(activeChain) && (
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
      )}
    </BottomSheet>
  )
}
