import { useChains, useDenomData } from '@leapwallet/elements-hooks'
import { LightbulbFilament } from '@phosphor-icons/react'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { imgOnError } from 'utils/imgOnError'

type Props = { transferAssetRelease: { chainId: string; released?: boolean; denom: string } }

export default function SwapActionFailedSection({ transferAssetRelease }: Props) {
  const defaultTokenLogo = useDefaultTokenLogo()

  const { data: chains, isLoading: isLoadingChainsInfo } = useChains()
  const { chainId, denom, released } = transferAssetRelease
  const { data: denomInfo, isLoading: isLoadingDenomsInfo } = useDenomData(denom, chainId)

  const chain = chains?.find((chain) => chain.chainId === chainId)

  return (
    <div className='flex w-full rounded-2xl bg-white-100 dark:bg-gray-950 flex-col items-center justify-center gap-4 p-4'>
      <div className='flex w-full flex-row justify-between items-center gap-2'>
        <div className='flex flex-row items-center gap-2 justify-start'>
          <img
            src={denomInfo?.icon ?? defaultTokenLogo}
            onError={imgOnError(defaultTokenLogo)}
            className='rounded-full h-6 w-6'
            alt={'token-logo'}
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
            <Skeleton width={70} height={17} containerClassName='inline rounded-xl !leading-none' />
          ) : (
            chain?.chainName ?? chainId
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
}
