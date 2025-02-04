import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CheckCircle, Star } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'
import { starredChainsStore } from 'stores/starred-chains-store'
import { Colors } from 'theme/colors'
import { getChainName } from 'utils/getChainName'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

type Chain = SupportedChain | typeof AGGREGATED_CHAIN_KEY

type ChainCardProps = {
  img: string
  handleClick: (chainName: Chain, beta?: boolean) => void
  beta?: boolean
  onPage?: 'AddCollection'
  formattedChainName: string
  chainName: Chain
  selectedChain: Chain
  showNewTag?: boolean
  showStars?: boolean
}

const ChainCardView = ({
  img,
  handleClick,
  beta,
  formattedChainName,
  chainName,
  selectedChain,
  onPage,
  showNewTag,
  showStars,
}: ChainCardProps) => {
  const { activeWallet } = useActiveWallet()
  const defaultTokenLogo = useDefaultTokenLogo()

  const isStarred = starredChainsStore.chains.includes(chainName)

  const isWatchWalletNotAvailableChain =
    chainName !== 'aggregated' && activeWallet?.watchWallet && !activeWallet?.addresses[chainName]

  const trackCTAEvent = (eventName: EventName) => {
    if (!isCompassWallet()) {
      try {
        mixpanel.track(eventName, {
          chainSelected: formattedChainName,
          time: Date.now() / 1000,
        })
      } catch (e) {
        captureException(e)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onStarToggle = (e: any) => {
    e.stopPropagation()
    if (isStarred) {
      starredChainsStore.removeStarredChain(chainName)
      trackCTAEvent(EventName.ChainUnfavorited)
    } else {
      starredChainsStore.addStarredChain(chainName)
      trackCTAEvent(EventName.ChainFavorited)
    }
  }

  return (
    <div
      onClick={() => {
        if (isWatchWalletNotAvailableChain) {
          importWatchWalletSeedPopupStore.setShowPopup(true)
        } else {
          handleClick(chainName, beta)
        }
      }}
      className='flex flex-1 items-center pr-4 p-3 cursor-pointer'
    >
      <div className='flex items-center flex-1 gap-2'>
        {showStars && (
          <>
            {isStarred ? (
              <Star
                size={16}
                weight='fill'
                className='text-yellow-500 cursor-pointer'
                onClick={onStarToggle}
              />
            ) : (
              <Star
                size={16}
                className='text-gray-200 dark:text-gray-800 cursor-pointer'
                onClick={onStarToggle}
              />
            )}
          </>
        )}

        <img
          src={img ?? defaultTokenLogo}
          className={classNames('h-6 w-6', {
            grayscale: isWatchWalletNotAvailableChain,
          })}
          onError={imgOnError(defaultTokenLogo)}
        />

        <Text
          size='sm'
          className='font-bold'
          color={
            isWatchWalletNotAvailableChain
              ? 'dark:text-gray-800 text-gray-200'
              : 'dark:text-white-100 text-black-100'
          }
          data-testing-id={`switch-chain-${formattedChainName.toLowerCase()}-ele`}
        >
          {onPage === 'AddCollection' ? getChainName(formattedChainName) : formattedChainName}
        </Text>

        {(beta !== false || showNewTag) && (
          <span
            className={classNames('text-xs font-bold  py-1 px-2 rounded-2xl', {
              'text-green-500 bg-green-500/10': !activeWallet?.watchWallet || showNewTag,
              'text-gray-400 dark:text-gray-700 bg-gray-100 dark:bg-gray-850':
                activeWallet?.watchWallet && !showNewTag,
            })}
          >
            {showNewTag ? 'New' : 'Custom'}
          </span>
        )}
      </div>

      <div className='ml-auto flex items-center'>
        {selectedChain === chainName ? (
          <CheckCircle
            size={24}
            weight='fill'
            className='ml-2'
            style={{
              color:
                selectedChain === AGGREGATED_CHAIN_KEY
                  ? Colors.green600
                  : Colors.getChainColor(selectedChain),
            }}
          />
        ) : null}
        {isWatchWalletNotAvailableChain && (
          <img src={Images.Misc.SyncDisabled} onError={imgOnError(defaultTokenLogo)} />
        )}
      </div>
    </div>
  )
}

export const ChainCard = observer(ChainCardView)
