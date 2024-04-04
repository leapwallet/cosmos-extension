import {
  useActiveChain,
  useAddress,
  useChainInfo,
  useFeatureFlags,
  useSelectedNetwork,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import ClickableIcon from 'components/clickable-icons'
import { useHardCodedActions } from 'components/search-modal'
import { ON_RAMP_SUPPORT_CHAINS } from 'config/config'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import React from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

type HomeButtonsProps = {
  setShowReceiveSheet: () => void
}

export function HomeButtons({ setShowReceiveSheet }: HomeButtonsProps) {
  const isTestnet = useSelectedNetwork() === 'testnet'
  const activeChain = useActiveChain()
  const navigate = useNavigate()
  const { activeWallet } = useActiveWallet()
  const chain = useChainInfo()
  const { handleSwapClick, handleVoteClick, handleNftsClick, onSendClick, handleBuyClick } =
    useHardCodedActions()

  const walletAddress = useAddress()
  const { data: featureFlags } = useFeatureFlags()
  const darkTheme = (useTheme()?.theme ?? '') === ThemeName.DARK
  const disabled =
    activeWallet?.walletType === WALLETTYPE.LEDGER &&
    !isLedgerEnabled(activeChain, chain.bip44.coinType)

  const isNomicChain = activeChain === 'nomic'
  const walletCtaDisabled = isNomicChain || disabled

  if (isCompassWallet() && isTestnet === false) {
    const isPacificChain = chain.chainId === 'pacific-1'

    return (
      <div
        className={classNames('flex flex-row justify-evenly mb-6 w-full', {
          'gap-2': isPacificChain,
        })}
      >
        {isPacificChain ? (
          // Buy Button
          <Buttons.Generic
            size='sm'
            disabled={walletCtaDisabled}
            color={darkTheme ? undefined : Colors.white100}
            onClick={() => handleBuyClick('compass')}
          >
            <div className='flex justify-center text-black-100 items-center'>
              <span className='mr-2 material-icons-round'>add</span>
              <span>Buy</span>
            </div>
          </Buttons.Generic>
        ) : (
          // Receive Button
          <Buttons.Generic
            size='sm'
            disabled={walletCtaDisabled}
            color={darkTheme ? undefined : Colors.white100}
            onClick={setShowReceiveSheet}
          >
            <div className='flex justify-center text-black-100 items-center'>
              <span className='mr-2 material-icons-round'>download</span>
              <span>Receive</span>
            </div>
          </Buttons.Generic>
        )}

        {/* Send Button */}
        <Buttons.Generic
          size='sm'
          disabled={walletCtaDisabled}
          color={darkTheme ? undefined : Colors.white100}
          onClick={() => onSendClick()}
          data-testing-id='home-generic-send-btn'
        >
          <div className='flex justify-center text-black-100 items-center'>
            <span className='mr-2 material-icons-round'>file_upload</span>
            <span>Send</span>
          </div>
        </Buttons.Generic>
      </div>
    )
  }

  if (isTestnet) {
    return (
      <div className='flex justify-between mb-6 w-full'>
        {/* Deposit/Receive Button */}
        <Buttons.Generic
          size='sm'
          disabled={walletCtaDisabled}
          color={darkTheme ? undefined : Colors.white100}
          onClick={setShowReceiveSheet}
        >
          <div className='flex justify-center text-black-100 items-center'>
            <span className='mr-2 material-icons-round'>download</span>
            {ON_RAMP_SUPPORT_CHAINS.includes(activeChain) ? (
              <span>Deposit</span>
            ) : (
              <span>Receive</span>
            )}
          </div>
        </Buttons.Generic>

        {/* Send Button */}
        <Buttons.Generic
          size='sm'
          disabled={walletCtaDisabled}
          color={darkTheme ? undefined : Colors.white100}
          onClick={() => navigate('/send')}
          data-testing-id='home-generic-send-btn'
        >
          <div className='flex justify-center text-black-100 items-center'>
            <span className='mr-2 material-icons-round'>file_upload</span>
            <span>Send</span>
          </div>
        </Buttons.Generic>
      </div>
    )
  }

  return (
    <div className='flex flex-row justify-evenly mb-6 w-full'>
      {/* Buy Button */}
      <ClickableIcon
        image={{ src: 'local_mall', alt: 'Buy' }}
        onClick={() => handleBuyClick('leap')}
        disabled={walletCtaDisabled}
      />

      {/* Send Button */}
      <ClickableIcon
        image={{ src: 'north', alt: 'Send' }}
        onClick={() => onSendClick()}
        disabled={walletCtaDisabled}
      />

      {/* Bridge Button */}
      <ClickableIcon
        image={{ src: 'route', alt: 'Bridge' }}
        onClick={() => {
          const baseUrl = 'https://cosmos.leapwallet.io/transact/bridge'
          window.open(`${baseUrl}?destinationChainId=${chain.chainId}`, '_blank')
        }}
        disabled={walletCtaDisabled}
      />

      {/* Vote Button */}
      <ClickableIcon
        image={{ src: 'how_to_vote', alt: 'Vote' }}
        onClick={() => handleVoteClick()}
      />

      {/* NFTs Button */}
      <ClickableIcon image={{ src: 'stars', alt: 'NFTs' }} onClick={() => handleNftsClick()} />
    </div>
  )
}
