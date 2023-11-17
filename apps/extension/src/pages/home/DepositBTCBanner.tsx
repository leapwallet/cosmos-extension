import { sliceAddress, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { LoaderAnimation } from 'components/loader/Loader'
import { useGetBTCDepositInfo, useNomicBTCDepositConstants } from 'hooks/nomic-btc-deposit'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { formatAuthzDate } from 'utils/formatAuthzDate'
import { imgOnError } from 'utils/imgOnError'

import { SelectChainSheet } from './side-nav/CustomEndpoints'

export function DepositBTCBanner({ handleClick }: { handleClick: () => void }) {
  const { data } = useNomicBTCDepositConstants()
  const activeChain = useActiveChain()

  if (data && !data.banner.chains.includes(activeChain) && !data.banner.chains.includes('All')) {
    return null
  }

  return data ? (
    <button className='rounded-[20px] w-[312px] h-[62px] mb-4' onClick={handleClick}>
      <img
        src={data?.banner.banner_url ?? ''}
        alt='Deposit BTC to get nBTC - Powered by Nomic'
        className='h-full w-full'
      />
    </button>
  ) : null
}

type NomicBTCDepositProps = {
  selectedChain: SupportedChain
  handleChainBtnClick: () => void
}

function NomicBTCDeposit({ selectedChain, handleChainBtnClick }: NomicBTCDepositProps) {
  const { data: btcDepositInfo, status } = useGetBTCDepositInfo(selectedChain)
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()
  const { data } = useNomicBTCDepositConstants()

  if (status === 'loading') {
    return (
      <div className='flex flex-col items-center w-[400px] mb-[40px] p-4 h-[450px]'>
        <LoaderAnimation color='' />
      </div>
    )
  }

  if (status === 'success' && btcDepositInfo) {
    const SelectChainDropdown = (
      <div className='flex justify-between items-center rounded-3xl dark:bg-gray-900 bg-white-100 px-3 py-1.5 w-full text-gray-800 dark:text-white-100'>
        <span>Receive nBTC on</span>
        <button
          className='flex item-center rounded-3xl p-2 dark:bg-gray-800'
          onClick={handleChainBtnClick}
        >
          <img
            src={chainInfos[selectedChain].chainSymbolImageUrl ?? defaultTokenLogo}
            className='w-[24px] h-[24px] mr-2 border rounded-full dark:border-[#333333] border-[#cccccc]'
            onError={imgOnError(defaultTokenLogo)}
          />
          {chainInfos[selectedChain]?.chainName ?? ''}
          <img src={Images.Misc.ArrowDown} alt='' className='self-center ml-2 mr-1' />
        </button>
      </div>
    )

    if (btcDepositInfo.code === 0) {
      const { qrCodeData, bitcoinAddress, expirationTimeMs } = btcDepositInfo
      const date = formatAuthzDate(expirationTimeMs)

      return (
        <div className='flex flex-col items-center w-[400px] gap-4 pt-2 pb-4 px-6'>
          {SelectChainDropdown}

          <div className='rounded-[18px] overflow-hidden bg-white-100 p-[4px] shadow-[0_4px_16px_8px_rgba(0,0,0,0.04)]'>
            <img src={qrCodeData} className='w-[232px] h-[233px]' />
          </div>

          <Buttons.CopyWalletAddress
            color={Colors.getChainColor(activeChain)}
            walletAddress={sliceAddress(bitcoinAddress)}
            data-testing-id='copy-wallet-address'
            onCopy={() => {
              UserClipboard.copyText(bitcoinAddress)
            }}
          />

          <p className='text-gray-800 dark:text-white-100 text-base'>
            Deposit BTC to this address to receive nBTC
          </p>
          <p className='text-red-300 text-sm text-center w-[250px]'>
            {date === 'Expired'
              ? 'This address is Expired.'
              : `This address is valid till ${date}. Deposits sent after this time will be lost.`}
          </p>

          <div
            className='flex flex-col rounded-2xl p-3 w-full gap-3'
            style={{
              background: 'linear-gradient(93deg, #54298D 37.84%, #310E6F 95.03%)',
            }}
          >
            <div className='flex justify-between items-center'>
              <div className='flex flex-col text-white-100'>
                <p className='text-[14px]'>Powered by Nomic</p>
                <p className='text-[12px]'>Transaction details</p>
              </div>
              <img
                className='w-[84px] h-[32px]'
                src={Images.Logos.NomicFullnameLogo}
                alt='nomic logo'
              />
            </div>

            <div style={{ border: '0.05px solid #48237A' }} />

            <div className='flex flex-col gap-1'>
              <p className='flex justify-between items-center text-gray-300 text-[12px]'>
                <span>Bitcoin Miner Fee:</span>{' '}
                <span>{data?.deposit_sheet.bitcoin_miner_fee ?? ''}</span>
              </p>
              <p className='flex justify-between items-center text-gray-300 text-[12px]'>
                <span>Estimated Arrival:</span>{' '}
                <span>{data?.deposit_sheet.estimated_arrival ?? ''}</span>
              </p>
              <p className='flex justify-between items-center text-gray-300 text-[12px]'>
                <span>Nomic Bridge Fee:</span>{' '}
                <span>
                  {data?.deposit_sheet.nomic_bridge_fee[
                    selectedChain === 'nomic' ? 'nomic' : 'non_nomic'
                  ] ?? ''}
                </span>
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (btcDepositInfo.code === 2 || btcDepositInfo.code === 1) {
      return (
        <div className='flex flex-col items-center w-[400px] gap-4 pt-2 pb-4 px-6 h-[450px]'>
          {SelectChainDropdown}
          <img src='https://assets.leapwallet.io/nomic-btc-deposit-error.png' alt='' />

          {btcDepositInfo.code === 2 ? (
            <>
              <p className='text-red-300 text-base'>Bridge limit reached.</p>
              <p className='text-center text-gray-800 dark:text-white-100 text-base'>
                The Nomic Bitcoin bridge is currently at capacity.\nPlease try again later.
              </p>
            </>
          ) : (
            <>
              <p className='text-red-300 text-base'>Error</p>
              <p className='text-center text-gray-800 dark:text-white-100 text-base'>
                {btcDepositInfo.reason}
              </p>
            </>
          )}
        </div>
      )
    }
  }

  return null
}

export function BitcoinDeposit({
  isVisible,
  onCloseHandler,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const activeChain = useActiveChain()
  const [showSelectChain, setShowSelectChain] = useState(false)
  const { data } = useNomicBTCDepositConstants()
  const [selectedChain, setSelectedChain] = useState(activeChain)

  useEffect(() => {
    if (data && data.ibcChains.length) {
      setSelectedChain(data.ibcChains[0] as SupportedChain)
    }
  }, [data])

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      closeOnClickBackDrop={true}
      customHeader={() => {
        return <div />
      }}
    >
      <>
        <div className='sticky top-0 bg-gray-50 dark:bg-black-100 pb-4 '>
          <Header
            title='Bitcoin Deposit Address'
            action={{
              type: HeaderActionType.CANCEL,
              onClick: onCloseHandler,
            }}
          />
        </div>
        <NomicBTCDeposit
          selectedChain={selectedChain}
          handleChainBtnClick={() => setShowSelectChain(true)}
        />
        <SelectChainSheet
          chainsToShow={data?.ibcChains}
          isVisible={showSelectChain}
          onClose={() => setShowSelectChain(false)}
          selectedChain={selectedChain}
          onChainSelect={(chaiName: SupportedChain) => {
            setSelectedChain(chaiName)
            setShowSelectChain(false)
          }}
        />
      </>
    </BottomSheet>
  )
}
