import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useModifyStarredChains, useStarredChains } from 'hooks/settings'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import mixpanel from 'mixpanel-browser'
import React from 'react'
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

export function ChainCard({
  img,
  handleClick,
  beta,
  formattedChainName,
  chainName,
  selectedChain,
  onPage,
  showNewTag,
  showStars,
}: ChainCardProps) {
  const defaultTokenLogo = useDefaultTokenLogo()
  const starredChains = useStarredChains()
  const { addStarredChain, removeStarredChain } = useModifyStarredChains()

  const isStarred = starredChains.includes(chainName)

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
      removeStarredChain(chainName)
      trackCTAEvent(EventName.ChainUnfavorited)
    } else {
      addStarredChain(chainName)
      trackCTAEvent(EventName.ChainFavorited)
    }
  }

  return (
    <div
      onClick={() => handleClick(chainName, beta)}
      className='flex flex-1 items-center pr-4 p-3 cursor-pointer'
    >
      <div className='flex items-center flex-1 gap-2'>
        {showStars && (
          <span
            className={classNames('material-icons-round', {
              'text-yellow-500': isStarred,
              'text-gray-200 dark:text-gray-800': !isStarred,
            })}
            onClick={onStarToggle}
          >
            {isStarred ? 'star' : 'star_outline'}
          </span>
        )}

        <img
          src={img ?? defaultTokenLogo}
          className='h-6 w-6'
          onError={imgOnError(defaultTokenLogo)}
        />

        <Text
          size='sm'
          className='font-bold'
          data-testing-id={`switch-chain-${formattedChainName.toLowerCase()}-ele`}
        >
          {onPage === 'AddCollection' ? getChainName(formattedChainName) : formattedChainName}
        </Text>

        {(beta !== false || showNewTag) && (
          <span className='text-xs font-bold text-green-500 bg-green-500/10 py-1 px-2 rounded-2xl'>
            {showNewTag ? 'New' : 'Custom'}
          </span>
        )}
      </div>

      <div className='ml-auto flex items-center'>
        {selectedChain === chainName ? (
          <span
            className='material-icons-round ml-2'
            style={{
              fontSize: 20,
              color:
                selectedChain === AGGREGATED_CHAIN_KEY
                  ? Colors.green600
                  : Colors.getChainColor(selectedChain),
            }}
          >
            check_circle
          </span>
        ) : null}
      </div>
    </div>
  )
}
