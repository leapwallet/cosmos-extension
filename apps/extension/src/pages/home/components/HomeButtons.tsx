import {
  useActiveChain,
  useChainInfo,
  useGetChains,
  useSelectedNetwork,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { ArrowDown, ArrowUp, Path, ShoppingBag, Star } from '@phosphor-icons/react'
import classNames from 'classnames'
import ClickableIcon from 'components/clickable-icons'
import { useHardCodedActions } from 'components/search-modal'
import { ON_RAMP_SUPPORT_CHAINS } from 'config/config'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import Vote from 'icons/vote'
import React from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { isSidePanel } from 'utils/isSidePanel'

type HomeButtonsProps = {
  setShowReceiveSheet: () => void
}

export function HomeButtons({ setShowReceiveSheet }: HomeButtonsProps) {
  const isTestnet = useSelectedNetwork() === 'testnet'
  const activeChain = useActiveChain()
  const { activeWallet } = useActiveWallet()

  const chains = useGetChains()
  const chain = useChainInfo()
  const { handleVoteClick, handleNftsClick, onSendClick, handleBuyClick, handleBridgeClick } =
    useHardCodedActions()

  const darkTheme = (useTheme()?.theme ?? '') === ThemeName.DARK
  const disabled =
    activeWallet?.walletType === WALLETTYPE.LEDGER &&
    !isLedgerEnabled(activeChain, chain?.bip44?.coinType, Object.values(chains))

  const isNomicChain = activeChain === 'nomic'
  const walletCtaDisabled = isNomicChain || disabled

  if (activeChain === 'initia') {
    return (
      <div className='flex flex-row justify-center mb-6 gap-6 w-full'>
        {/* Buy Button */}
        <ClickableIcon
          label='Receive'
          icon={<ArrowDown size={20} />}
          onClick={setShowReceiveSheet}
          disabled={walletCtaDisabled}
        />

        {/* Send Button */}
        <ClickableIcon
          label='Send'
          icon={<ArrowUp size={20} />}
          onClick={() => onSendClick()}
          disabled={walletCtaDisabled}
        />

        {/* Vote Button */}
        <ClickableIcon
          label='Vote'
          icon={<Vote weight='fill' size={20} />}
          onClick={() => handleVoteClick()}
        />
      </div>
    )
  }

  if (isCompassWallet() && isTestnet === false) {
    const isPacificChain = chain?.chainId === 'pacific-1'

    return (
      <div
        className={classNames('flex flex-row justify-evenly mb-4 w-full', {
          'gap-2': isPacificChain,
        })}
      >
        {isPacificChain ? (
          // Buy Button
          <Buttons.Generic
            size='sm'
            disabled={walletCtaDisabled}
            color={darkTheme ? undefined : Colors.white100}
            onClick={() => handleBuyClick()}
          >
            <div className='flex justify-center text-black-100 items-center'>
              <ShoppingBag size={20} className='mr-2' />
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
              <ArrowDown size={20} className='mr-2' />
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
            <ArrowUp size={20} className='mr-2' />
            <span>Send</span>
          </div>
        </Buttons.Generic>
      </div>
    )
  }

  if (isTestnet) {
    if (isSidePanel()) {
      return (
        <div className='flex flex-row justify-center gap-[32px] mb-4 w-full'>
          {/* Send Button */}
          <ClickableIcon
            label='Send'
            icon={<ArrowUp size={20} />}
            onClick={() => onSendClick()}
            disabled={walletCtaDisabled}
            data-testing-id='home-generic-send-btn'
          />

          {/* Receive Button */}
          <ClickableIcon
            label='Receive'
            icon={<ArrowDown size={20} />}
            onClick={setShowReceiveSheet}
            disabled={walletCtaDisabled}
          />
        </div>
      )
    }

    return (
      <div className='flex justify-between mb-4 w-full'>
        {/* Deposit/Receive Button */}
        <Buttons.Generic
          size='sm'
          disabled={walletCtaDisabled}
          color={darkTheme ? undefined : Colors.white100}
          onClick={setShowReceiveSheet}
        >
          <div className='flex justify-center text-black-100 items-center'>
            <ArrowDown size={20} className='mr-2' />
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
          onClick={() => onSendClick()}
          data-testing-id='home-generic-send-btn'
        >
          <div className='flex justify-center text-black-100 items-center'>
            <ArrowUp size={20} className='mr-2' />
            <span>Send</span>
          </div>
        </Buttons.Generic>
      </div>
    )
  }

  return (
    <div className='flex flex-row justify-evenly mb-4 w-full'>
      {/* Buy Button */}
      <ClickableIcon
        label='Buy'
        icon={<ShoppingBag size={20} weight='fill' />}
        onClick={() => handleBuyClick()}
        disabled={walletCtaDisabled}
      />

      {/* Send Button */}
      <ClickableIcon
        label='Send'
        icon={<ArrowUp size={20} />}
        onClick={() => onSendClick()}
        disabled={walletCtaDisabled}
      />

      {/* Bridge Button */}
      <ClickableIcon
        label='Bridge'
        icon={<Path size={20} />}
        onClick={() => handleBridgeClick()}
        disabled={walletCtaDisabled}
      />

      {/* Vote Button */}
      {!chain?.evmOnlyChain && chain?.key !== 'mantra' ? (
        <ClickableIcon
          label='Vote'
          icon={<Vote weight='fill' size={20} />}
          onClick={() => handleVoteClick()}
        />
      ) : null}

      {/* NFTs Button */}
      <ClickableIcon
        label='NFTs'
        icon={
          <div className='bg-white-100 h-5 w-5 rounded-full flex items-center justify-center'>
            <Star size={12} weight='fill' className='text-black-100' />
          </div>
        }
        onClick={() => handleNftsClick()}
      />
    </div>
  )
}
