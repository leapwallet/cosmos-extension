import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, GenericCard } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

type CantSeeNftsProps = {
  openAddCollectionSheet: () => void
  className?: string
}

export function CantSeeNfts({ openAddCollectionSheet, className }: CantSeeNftsProps) {
  const activeWallet = useActiveWallet()
  const [showDetails, setShowDetails] = useState(false)
  const detailsRef = React.useRef<HTMLDivElement>(null)

  const externalPlatforms = useMemo(() => {
    const palletSei = {
      title: 'Pallet (Sei)',
      account: `https://pallet.exchange/profile/${activeWallet?.addresses.seiTestnet2}`,
    }

    if (isCompassWallet()) {
      return [palletSei]
    }

    const stargaze = {
      title: 'Stargaze',
      account: `https://www.stargaze.zone/p/${activeWallet?.addresses.stargaze}/tokens`,
    }

    const omniflix = {
      title: 'OmniFlix',
      account: `https://omniflix.market/account/${activeWallet?.addresses.omniflix}/nfts`,
    }

    return [stargaze, omniflix]
  }, [
    activeWallet?.addresses.omniflix,
    activeWallet?.addresses.seiTestnet2,
    activeWallet?.addresses.stargaze,
  ])

  useEffect(() => {
    if (showDetails) {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [showDetails])

  return (
    <div
      className={classNames(
        'bg-white-100 dark:bg-gray-950 text-gray-400 w-[344px] rounded-[16px] overflow-hidden',
        className,
      )}
    >
      <GenericCard
        onClick={() => setShowDetails(!showDetails)}
        title="Can't see your NFTs?"
        isRounded={true}
        className='bg-white-100 dark:bg-gray-950 w-full'
        icon={
          <img
            className={classNames('w-[10px] h-[10px] ml-2', {
              'transform rotate-180': showDetails,
            })}
            src={Images.Misc.DownArrow}
          />
        }
      />

      <div
        ref={detailsRef}
        className={classNames('bg-white-100 dark:bg-gray-950 text-[14px]', {
          'px-4 pb-4': showDetails,
          'p-0 h-0': !showDetails,
        })}
        style={{
          transition: 'height 0.3s',
        }}
      >
        <ol className='list-decimal'>
          <p className='mb-2'>It could be because:</p>

          <li className='mb-4 ml-4'>
            Your NFT collection is not in our auto-fetch list. Add it manually to view your NFTs.
            <Buttons.Generic
              onClick={openAddCollectionSheet}
              size='normal'
              style={{ width: '100%', height: 44 }}
              className='mt-2 dark:text-gray-900 text-gray-400'
            >
              Add your collection
            </Buttons.Generic>
          </li>

          <li className='ml-4'>
            We&apos;re temporarily unable to fetch your NFTs from some platforms. You can still view
            them on the marketplace.
            <ul className='mt-2 flex items-center gap-4'>
              {externalPlatforms.map((platform) => (
                <li key={platform.title} className='list-none ml-0'>
                  <a
                    href={platform.account}
                    target='_blank'
                    className='text-black-100 dark:text-white-100'
                    rel='noreferrer'
                  >
                    {platform.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ol>
      </div>
    </div>
  )
}
