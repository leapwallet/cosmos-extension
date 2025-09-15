import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { DotsThreeVertical } from '@phosphor-icons/react'
import Text from 'components/text'
import { useChainInfos } from 'hooks/useChainInfos'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { ConnectionsIcon } from 'icons/connections'
import { UnlinkIcon } from 'icons/unlink'
import { Images } from 'images'
import React, { useState } from 'react'
import { imgOnError } from 'utils/imgOnError'

type ConnectedSiteCardProps = {
  site: string
  chains: SupportedChain[]
  onClick: (chain?: SupportedChain) => void
  className?: string
  setSelectedSite: (site: string) => void
}

export const ConnectedSiteCard = ({
  site,
  chains,
  onClick,
  setSelectedSite,
}: ConnectedSiteCardProps) => {
  const [showMore, setShowMore] = useState(false)
  // generate url object from site
  const siteURL = new URL(site)
  // get site logo
  const siteLogo = useSiteLogo(siteURL.origin)
  // use top level domain as name (without tld)
  const name = siteURL.host.split('.').slice(-2)[0]
  const chainInfos = useChainInfos()
  const isMoreThanOne = chains.length > 1

  return (
    <div
      onClick={() => setShowMore(false)}
      className='rounded-xl bg-secondary-100 p-3 flex relative w-full justify-between items-center'
    >
      <div className='flex gap-3 items-center'>
        <div className='relative w-9 h-9 shrink-0 flex flex-row items-center justify-center'>
          <img
            src={siteLogo}
            onError={imgOnError(Images.Misc.Globe)}
            className='w-8 h-8 rounded-full'
          />
          {!isMoreThanOne && (
            <img
              src={chainInfos[chains[0]]?.chainSymbolImageUrl ?? Images.Misc.Globe}
              onError={imgOnError(Images.Misc.Globe)}
              className='w-3 h-3 bg-secondary-200 rounded-full absolute bottom-0 right-0'
            />
          )}
        </div>
        <div className='flex flex-col items-start'>
          <Text className='font-bold' color='text-monochrome'>
            {name}
          </Text>
          <Text className='font-medium text-xs' color='text-muted-foreground'>
            {chains
              .slice(0, 2)
              .map((chain) => chainInfos[chain]?.chainName)
              .join(', ')}
            {chains.length > 2 && ` +${chains.length - 2} more`}
          </Text>
        </div>
      </div>
      <DotsThreeVertical
        onClick={(e) => {
          e.stopPropagation()
          setShowMore((val) => !val)
        }}
        size={20}
        className='text-secondary-600 cursor-pointer hover:text-secondary-700'
      />
      {showMore && (
        <div className='absolute overflow-hidden rounded-lg w-[150px] right-4 top-[70px] flex flex-col z-[1]'>
          {isMoreThanOne && (
            <div
              className='flex p-2.5 gap-x-2 bg-secondary-300 items-center cursor-pointer hover:bg-secondary-400'
              onClick={() => setSelectedSite(site)}
            >
              <ConnectionsIcon size={16} weight='fill' />
              <Text size='xs' color='text-monochrome' className='font-medium'>
                View connections
              </Text>
            </div>
          )}
          <div
            className='flex p-2.5 gap-x-2 bg-secondary-300 items-center cursor-pointer hover:bg-secondary-400'
            onClick={() => {
              if (isMoreThanOne) {
                onClick()
              } else {
                onClick(chains[0])
              }
            }}
          >
            <UnlinkIcon size={16} weight='fill' className='text-red-300' />
            <Text size='xs' color='text-red-300' className='font-medium'>
              {isMoreThanOne ? 'Disconnect all' : 'Disconnect'}
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}
