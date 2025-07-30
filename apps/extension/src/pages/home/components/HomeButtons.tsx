import {
  useActiveChain,
  useChainInfo,
  useFeatureFlags,
  useGetChains,
  useSelectedNetwork,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { isAptosChain, isSolanaChain } from '@leapwallet/cosmos-wallet-sdk'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils'
import { ArrowDown, Parachute } from '@phosphor-icons/react'
import ClickableIcon from 'components/clickable-icons'
import { useHardCodedActions } from 'components/search-modal'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useQueryParams } from 'hooks/useQuery'
import { BuyIcon } from 'icons/buy-icon'
import { EarnIcon } from 'icons/earn-icon'
import { SendIcon } from 'icons/send-icon'
import { StakeIcon } from 'icons/stake-icon'
import { SwapIcon } from 'icons/swap-icon'
import Vote from 'icons/vote'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AggregatedSupportedChain } from 'types/utility'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

export const HomeButtons = observer(({ skipVote = false }: { skipVote?: boolean }) => {
  const query = useQueryParams()

  const isTestnet = useSelectedNetwork() === 'testnet'
  const activeChain = useActiveChain()
  const { activeWallet } = useActiveWallet()
  const navigate = useNavigate()
  const { data: featureFlags } = useFeatureFlags()

  const chains = useGetChains()
  const chain = useChainInfo()
  const { handleVoteClick, onSendClick, handleBuyClick, handleNobleEarnClick, handleSwapClick } =
    useHardCodedActions()

  const disabled =
    activeWallet?.walletType === WALLETTYPE.LEDGER &&
    !isLedgerEnabled(activeChain, chain?.bip44?.coinType, Object.values(chains))

  const isNomicChain = activeChain === 'nomic'
  const walletCtaDisabled = isNomicChain || disabled

  const isStakeHidden =
    chain?.disableStaking ||
    !!chain?.evmOnlyChain ||
    isAptosChain(chain?.key) ||
    isBitcoinChain(chain?.key) ||
    isSolanaChain(chain?.key)

  const isVoteHidden =
    ['aggregated', 'noble'].includes(activeChain as AggregatedSupportedChain) ||
    !!chain?.evmOnlyChain ||
    isAptosChain(chain?.key) ||
    isBitcoinChain(chain?.key) ||
    isSolanaChain(chain?.key) ||
    skipVote

  if (activeChain === 'initia') {
    return (
      <div className='flex flex-row justify-evenly mb-5 px-7 w-full'>
        {/* Buy Button */}
        <ClickableIcon
          label='Receive'
          icon={ArrowDown}
          onClick={() => query.set('receive', 'true')}
          disabled={walletCtaDisabled}
        />

        {/* Send Button */}
        <ClickableIcon
          label='Send'
          icon={SendIcon}
          onClick={() => onSendClick()}
          disabled={walletCtaDisabled}
        />

        {/* Vote Button */}
        <ClickableIcon label='Vote' icon={Vote} onClick={() => handleVoteClick()} />
      </div>
    )
  }

  if (isTestnet) {
    return (
      <div className='flex flex-row justify-evenly mb-5 px-7 w-full'>
        {/* Send Button */}
        <ClickableIcon
          label='Send'
          icon={SendIcon}
          onClick={() => onSendClick()}
          disabled={walletCtaDisabled}
          data-testing-id='home-generic-send-btn'
        />

        {/* Receive Button */}
        <ClickableIcon
          label='Receive'
          icon={ArrowDown}
          onClick={() => query.set('receive', 'true')}
          disabled={walletCtaDisabled}
        />
      </div>
    )
  }

  return (
    <div className='flex flex-row justify-evenly mb-8 px-7 w-full'>
      {/* Buy Button */}
      <ClickableIcon
        label='Buy'
        icon={BuyIcon}
        onClick={() => handleBuyClick()}
        disabled={walletCtaDisabled}
      />

      {/* Send Button */}
      <ClickableIcon
        label='Send'
        icon={SendIcon}
        onClick={() => onSendClick()}
        disabled={walletCtaDisabled}
      />

      <ClickableIcon
        label='Swap'
        icon={SwapIcon}
        onClick={() => handleSwapClick()}
        disabled={featureFlags?.all_chains?.swap === 'disabled' || walletCtaDisabled}
      />

      {!isStakeHidden && (
        <ClickableIcon
          label='Stake'
          icon={StakeIcon}
          onClick={() => navigate('/stake')}
          disabled={walletCtaDisabled}
        />
      )}

      {!isVoteHidden ? (
        <ClickableIcon
          label='Vote'
          icon={Vote}
          onClick={() => handleVoteClick()}
          disabled={walletCtaDisabled}
        />
      ) : null}

      {activeChain === 'noble' && (
        <ClickableIcon label='Earn' icon={EarnIcon} onClick={handleNobleEarnClick} />
      )}
    </div>
  )
})
