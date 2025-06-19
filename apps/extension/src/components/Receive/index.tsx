import { useActiveChain, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, OnboardCard, QrCode, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BottomModal from 'components/new-bottom-modal'
import { ON_RAMP_SUPPORT_CHAINS } from 'config/config'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useChainPageInfo } from 'hooks'
import { useNomicBTCDepositConstants } from 'hooks/nomic-btc-deposit'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { useQueryParams } from 'hooks/useQuery'
import { Images } from 'images'
import { nBtcSymbol } from 'images/misc'
import rightArrow from 'images/misc/right-arrow.svg'
import React, { ReactElement } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { queryParams } from 'utils/query-params'
import { sliceAddress } from 'utils/strings'

function BtcButton() {
  const { data: nomicBtcDeposit } = useNomicBTCDepositConstants()
  const activeChainInfo = useChainInfo()
  const query = useQueryParams()

  return nomicBtcDeposit && nomicBtcDeposit.ibcChains.includes(activeChainInfo?.key) ? (
    <div
      className='mt-2'
      onClick={() => {
        query.set('btcDeposit', 'true')
      }}
    >
      <OnboardCard
        imgSrc={nBtcSymbol}
        iconSrc={rightArrow}
        isFilled
        isRounded
        size='lg'
        title='Depost BTC to get nBTC'
      />
    </div>
  ) : null
}

export default function ReceiveToken({
  forceChain,
}: {
  forceChain?: SupportedChain
}): ReactElement {
  const query = useQueryParams()

  const isVisible = query.get(queryParams.receive) === 'true'
  const wallet = useActiveWallet().activeWallet
  const _activeChain = useActiveChain()
  const activeChain = forceChain ?? _activeChain

  const { topChainColor } = useChainPageInfo()
  const activeChainInfo = useChainInfo(activeChain)
  const isEvmOnlyChain = activeChainInfo?.evmOnlyChain
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK
  const walletAddress = useGetWalletAddresses(activeChain)
  const address = isEvmOnlyChain ? walletAddress[0] : wallet?.addresses[activeChain]

  const QrCodeProps = {
    height: 250,
    width: 250,
    data: address ?? '',
  }

  return (
    <BottomModal isOpen={isVisible} onClose={() => query.remove('receive')} title={'Your QR code'}>
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
                window.open(`https://widget.swapped.com`)
              }}
            >
              <OnboardCard
                imgSrc={isDark ? Images.Logos.SwappedDark : Images.Logos.SwappedLight}
                iconSrc={rightArrow}
                isFilled
                isRounded
                size='lg'
                title={`Buy ${activeChain === 'osmosis' ? 'AxlUSDC' : 'Crypto'} with Swapped Ramp`}
              />
            </div>
          )}

          {(activeChain as string) !== AGGREGATED_CHAIN_KEY && <BtcButton />}
        </div>
      ) : (
        <></>
      )}
    </BottomModal>
  )
}
