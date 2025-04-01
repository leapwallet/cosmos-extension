import {
  useActiveChain,
  useChainInfo,
  useFeatureFlags,
  useGetChains,
  useSelectedNetwork,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import {
  ArrowDown,
  ArrowsLeftRight,
  ArrowUp,
  CurrencyCircleDollar,
  Parachute,
  Path,
  ShoppingBag,
  Star,
} from '@phosphor-icons/react'
import classNames from 'classnames'
import ClickableIcon from 'components/clickable-icons'
import { useHardCodedActions } from 'components/search-modal'
import { PageName } from 'config/analytics'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import Vote from 'icons/vote'
import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

type HomeButtonsProps = {
  setShowReceiveSheet: () => void
}

export const HomeButtons = observer(({ setShowReceiveSheet }: HomeButtonsProps) => {
  const isTestnet = useSelectedNetwork() === 'testnet'
  const activeChain = useActiveChain()
  const { activeWallet } = useActiveWallet()
  const navigate = useNavigate()
  const { data: featureFlags } = useFeatureFlags()

  const chains = useGetChains()
  const chain = useChainInfo()
  const {
    handleVoteClick,
    handleNftsClick,
    onSendClick,
    handleBuyClick,
    handleBridgeClick,
    handleSwapClick,
  } = useHardCodedActions()

  const darkTheme = (useTheme()?.theme ?? '') === ThemeName.DARK
  const disabled =
    activeWallet?.walletType === WALLETTYPE.LEDGER &&
    !isLedgerEnabled(activeChain, chain?.bip44?.coinType, Object.values(chains))

  const isNomicChain = activeChain === 'nomic'
  const walletCtaDisabled = isNomicChain || disabled

  const handleStakeClick = useCallback(() => {
    navigate('/stake')
  }, [navigate])

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

        {/* Airdrops Icon */}
        {featureFlags?.airdrops.extension !== 'disabled' ? (
          <ClickableIcon
            label='Airdrops'
            icon={<Parachute size={20} weight='fill' />}
            onClick={() => navigate('/airdrops')}
          />
        ) : null}
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
        <ClickableIcon
          label='Buy'
          icon={<ShoppingBag size={20} weight='fill' />}
          onClick={() => handleBuyClick()}
          disabled={walletCtaDisabled}
        />
        <ClickableIcon
          label='Send'
          icon={<ArrowUp size={20} />}
          onClick={() => onSendClick()}
          disabled={walletCtaDisabled}
        />
        <ClickableIcon
          label='Swap'
          icon={<ArrowsLeftRight size={20} />}
          onClick={() => handleSwapClick(undefined, `/swap?pageSource=${PageName.Home}`)}
          disabled={walletCtaDisabled}
        />
        <ClickableIcon
          label='Receive'
          icon={<ArrowDown size={20} />}
          onClick={setShowReceiveSheet}
          disabled={walletCtaDisabled}
        />
        <ClickableIcon
          label='Stake'
          icon={<CurrencyCircleDollar size={20} />}
          onClick={handleStakeClick}
          disabled={walletCtaDisabled}
        />
      </div>
    )
  }

  if (isTestnet) {
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

        {!['bitcoin', 'bitcoinSignet'].includes(chain?.key) ? (
          <ClickableIcon
            label='NFTs'
            icon={
              <div className='bg-white-100 h-5 w-5 rounded-full flex items-center justify-center'>
                <Star size={12} weight='fill' className='text-black-100' />
              </div>
            }
            onClick={() => handleNftsClick()}
          />
        ) : null}

        {/* Airdrops Icon */}
        {featureFlags?.airdrops.extension !== 'disabled' ? (
          <ClickableIcon
            label='Airdrops'
            icon={<Parachute size={20} weight='fill' />}
            onClick={() => navigate('/airdrops')}
          />
        ) : null}
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
      {activeChain === 'mainCoreum' ? (
        <ClickableIcon
          label='Bridge'
          icon={<Path size={20} />}
          onClick={() => handleBridgeClick(`/swap?pageSource=${PageName.Home}`)}
        />
      ) : null}

      {/* Vote Button */}
      {!chain?.evmOnlyChain && !['mantra', 'bitcoin', 'bitcoinSignet'].includes(chain?.key) ? (
        <ClickableIcon
          label='Vote'
          icon={<Vote weight='fill' size={20} />}
          onClick={() => handleVoteClick()}
        />
      ) : null}

      {/* NFTs Button */}
      {!['bitcoin', 'bitcoinSignet'].includes(chain?.key) ? (
        <ClickableIcon
          label='NFTs'
          icon={
            <div className='bg-white-100 h-5 w-5 rounded-full flex items-center justify-center'>
              <Star size={12} weight='fill' className='text-black-100' />
            </div>
          }
          onClick={() => handleNftsClick()}
        />
      ) : null}

      {/* Airdrops Icon */}
      {featureFlags?.airdrops.extension !== 'disabled' ? (
        <ClickableIcon
          label='Airdrops'
          icon={<Parachute size={20} weight='fill' />}
          onClick={() => navigate('/airdrops')}
        />
      ) : null}
    </div>
  )
})
