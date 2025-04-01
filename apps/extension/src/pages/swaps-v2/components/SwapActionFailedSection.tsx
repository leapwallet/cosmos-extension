import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { LightbulbFilament } from '@phosphor-icons/react'
import { TransferAssetRelease } from '@skip-go/client'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { observer } from 'mobx-react-lite'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { useDenomData, useGetChainsToShow } from '../hooks'

type Props = { transferAssetRelease: TransferAssetRelease; rootDenomsStore: RootDenomsStore }

export const SwapActionFailedSection = observer(
  ({ transferAssetRelease, rootDenomsStore }: Props) => {
    const { chainsToShow: chains, chainsToShowLoading: isLoadingChainsInfo } = useGetChainsToShow()
    const { chainID, denom, released } = transferAssetRelease
    const { data: denomInfo, isLoading: isLoadingDenomsInfo } = useDenomData(
      denom,
      chainID,
      rootDenomsStore.allDenoms,
    )

    const chain = chains?.find((chain) => chain.chainId === chainID)

    return (
      <div className='flex w-full rounded-2xl bg-white-100 dark:bg-gray-950 flex-col items-center justify-center gap-4 p-4'>
        <div className='flex w-full flex-row justify-between items-center gap-2'>
          <div className='flex flex-row items-center gap-2 justify-start'>
            <TokenImageWithFallback
              assetImg={denomInfo?.icon}
              text={denomInfo?.coinDenom ?? denom}
              altText={denomInfo?.coinDenom ?? denom}
              imageClassName='rounded-full h-6 w-6'
              containerClassName='rounded-full h-6 w-6 bg-gray-100 dark:bg-gray-850'
              textClassName='text-[7px] !leading-[12px]'
            />
            <span className='text-sm font-bold text-black-100 dark:text-white-100 !leading-[19.6px]'>
              {isLoadingDenomsInfo ? (
                <Skeleton
                  width={50}
                  height={20}
                  containerClassName='block !leading-none rounded-xl'
                />
              ) : (
                denomInfo?.coinDenom ?? denom
              )}
            </span>
          </div>
          <span className='text-sm font-medium dark:text-gray-200 text:gray-800 !leading-[22.4px]'>
            {released ? 'Refunded to' : 'Will be refunded to'}{' '}
            {isLoadingChainsInfo ? (
              <Skeleton
                width={70}
                height={17}
                containerClassName='inline rounded-xl !leading-none'
              />
            ) : (
              chain?.chainName ?? chainID
            )}
          </span>
        </div>
        <div className='flex w-full flex-row justify-start p-2 items-start gap-2 rounded-xl dark:bg-gray-900 bg-gray-50'>
          <LightbulbFilament size={14} className='text-black-100 dark:text-white-100' />
          <span className='text-xs font-medium dark:text-gray-200 text:gray-800 !leading-[19.6px]'>
            Try the transaction with a higher slippage value
          </span>
        </div>
      </div>
    )
  },
)
