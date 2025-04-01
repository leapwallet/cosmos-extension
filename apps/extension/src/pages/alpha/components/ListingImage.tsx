import { useNonNativeCustomChains } from 'hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import { useCoingeckoChains } from 'hooks/useCoingeckoChains'
import React from 'react'

export default function ListingImage({
  ecosystemFilter,
  categoryFilter,
  image,
}: {
  ecosystemFilter: string | undefined
  categoryFilter: string | undefined
  image: string | undefined
}) {
  const { chains } = useCoingeckoChains()
  const nativeChains = useChainInfos()
  const nonNative = useNonNativeCustomChains()

  const nativeChainsList = Object.values(nativeChains)
  const nonNativeChainsList = Object.values(nonNative)

  const coingeckoChain = ecosystemFilter
    ? chains.find((chain) =>
        chain.name.toLowerCase().startsWith(ecosystemFilter.toLowerCase().split(' ')[0]),
      )
    : null

  const chain = ecosystemFilter
    ? [...nativeChainsList, ...nonNativeChainsList].find((chain) =>
        chain.chainName.toLowerCase().startsWith(ecosystemFilter.toLowerCase().split(' ')[0]),
      )
    : null

  const icon =
    chain?.chainSymbolImageUrl ?? (coingeckoChain?.image?.small || coingeckoChain?.image?.large)

  return (
    <img
      src={image}
      alt='icon'
      className='w-full h-full object-cover'
      onError={(e) => {
        e.currentTarget.src = icon ?? `https://placehold.co/40x40?text=${categoryFilter}`
      }}
    />
  )
}
