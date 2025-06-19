import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CheckCircle, DotsThreeVertical, Star, TrashSimple } from '@phosphor-icons/react'
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
import React, { useState } from 'react'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'
import { starredChainsStore } from 'stores/starred-chains-store'
import { Colors } from 'theme/colors'
import { getChainName } from 'utils/getChainName'
import { imgOnError } from 'utils/imgOnError'

type Chain = SupportedChain | typeof AGGREGATED_CHAIN_KEY

type ChainCardProps = {
  img: string
  handleClick: (chainName: Chain, beta?: boolean) => void
  handleDeleteClick?: (chainKey: SupportedChain) => void
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
  handleDeleteClick,
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
  const [showDeleteBtn, setShowDeleteBtn] = useState(false)

  const isStarred = starredChainsStore.chains.includes(chainName)

  const isWatchWalletNotAvailableChain =
    chainName !== 'aggregated' && activeWallet?.watchWallet && !activeWallet?.addresses[chainName]

  const trackCTAEvent = (eventName: EventName) => {
    try {
      mixpanel.track(eventName, {
        chainSelected: formattedChainName,
        time: Date.now() / 1000,
      })
    } catch (e) {
      captureException(e)
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

  const handleToggleDelete = (e: any) => {
    e.stopPropagation()
    setShowDeleteBtn((showDeleteBtn) => !showDeleteBtn)
  }

  const deleteChain = (e: any) => {
    if (handleDeleteClick && chainName !== 'aggregated') {
      e.stopPropagation()
      handleDeleteClick(chainName)
      setShowDeleteBtn(false)
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
      className='flex flex-1 items-center px-4 py-3.5 cursor-pointer relative'
    >
      <div className='flex items-center flex-1 gap-2'>
        {showStars && (
          <>
            {isStarred ? (
              <Star
                size={20}
                weight='fill'
                className='text-yellow-500 cursor-pointer'
                onClick={onStarToggle}
              />
            ) : (
              <Star
                size={20}
                className='text-secondary-600 cursor-pointer'
                onClick={onStarToggle}
              />
            )}
          </>
        )}

        <img
          src={img ?? defaultTokenLogo}
          className={classNames('h-6 w-6 ml-1 rounded-full', {
            grayscale: isWatchWalletNotAvailableChain,
          })}
          onError={imgOnError(defaultTokenLogo)}
        />

        <Text
          size='sm'
          className='font-bold'
          color={isWatchWalletNotAvailableChain ? 'text-secondary-600' : 'text-foreground'}
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
              color: Colors.green500,
            }}
          />
        ) : null}
        {beta && (
          <DotsThreeVertical
            onClick={handleToggleDelete}
            size={20}
            className='text-gray-400 ml-2 cursor-pointer'
          />
        )}
        {isWatchWalletNotAvailableChain && (
          <img src={Images.Misc.SyncDisabled} onError={imgOnError(defaultTokenLogo)} />
        )}
      </div>

      {showDeleteBtn && (
        <div
          className='flex p-2.5 gap-x-2 absolute dark:bg-gray-900 bg-gray-50 rounded-lg items-center w-[120px] h-[42px] right-4 -bottom-[34px] z-[1]'
          onClick={deleteChain}
        >
          <TrashSimple size={16} weight='fill' className='text-black-100 dark:text-white-100' />
          <Text size='sm' className='font-medium'>
            Delete
          </Text>
        </div>
      )}
    </div>
  )
}

export const ChainCard = observer(ChainCardView)
