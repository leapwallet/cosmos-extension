import { capitalize, GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { RouteAggregator } from '@leapwallet/elements-hooks'
import { CaretDown, GasPump, Info } from '@phosphor-icons/react'
import { useDefaultGasPrice } from 'components/gas-price-options'
import Text from 'components/text'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import { useSwapContext } from 'pages/swaps-v2/context'
import { useAggregatorBridgeRelayerFee } from 'pages/swaps-v2/hooks/useBridgeFee'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { imgOnError } from 'utils/imgOnError'

import { ConversionRateDisplay } from './ConversionRateDisplay'

type SwapInfoProps = {
  setShowMoreDetailsSheet: Dispatch<SetStateAction<boolean>>
  rootDenomsStore: RootDenomsStore
}

const providerMapping = {
  'terra-astroport': 'Astroport',
  'injective-white-whale': 'White Whale',
  'terra-nauticus': 'Nauticus',
  'archway-astrovault': 'Astrovault',
  'pryzm-native': 'Pryzm',
  'migaloo-white-whale': 'White Whale',
  'sei-white-whale': 'White Whale',
  'injective-helix': 'Helix',
  'persistence-dexter': 'Dexter',
  'terra-terraswap': 'Terraswap',
  'neutron-duality': 'Duality',
  'neutron-drop': 'Drop',
  'chihuahua-white-whale': 'White Whale',
  'osmosis-poolmanager': 'Osmosis',
  'injective-astroport': 'Astroport',
  'terra-white-whale': 'White Whale',
  'injective-dojoswap': 'Dojoswap',
  'terra-phoenix': 'Phoenix',
  'neutron-astrovault': 'Astrovault',
  'neutron-lido-satellite': 'Lido Satellite',
  'sei-astroport': 'Astroport',
  'neutron-astroport': 'Astroport',
  'terra-ura': 'URA',
  'celo-uniswap': 'Uniswap',
  'avalanche-uniswap': 'Uniswap',
  'blast-uniswap': 'Uniswap',
  'polygon-uniswap': 'Uniswap',
  'optimism-uniswap': 'Uniswap',
  'binance-uniswap': 'Uniswap',
  'ethereum-uniswap': 'Uniswap',
  'arbitrum-uniswap': 'Uniswap',
  'base-uniswap': 'Uniswap',
}

export const SwapInfo = observer(({ setShowMoreDetailsSheet, rootDenomsStore }: SwapInfoProps) => {
  const {
    debouncedInAmount,
    displayFee,
    sourceChain,
    setGasOption,
    setUserPreferredGasPrice,
    setGasPriceOption,
    isSkipGasFeeLoading,
    loadingRoutes,
    loadingMessages,
    routingInfo,
  } = useSwapContext()
  const { totalBridgeFee } = useAggregatorBridgeRelayerFee(routingInfo?.route)
  const defaultTokenLogo = useDefaultTokenLogo()
  const [showProviderInfo, setShowProviderInfo] = useState(false)

  const denoms = rootDenomsStore.allDenoms

  const defaultGasPrice = useDefaultGasPrice(denoms, {
    activeChain: sourceChain?.key ?? 'cosmos',
  })

  const providerInfo = useMemo(() => {
    if (
      debouncedInAmount === '' ||
      Number(debouncedInAmount) === 0 ||
      routingInfo.aggregator !== RouteAggregator.SKIP
    ) {
      return null
    }

    if (routingInfo.route?.response.swap_venue?.name) {
      return {
        name:
          providerMapping[
            routingInfo.route?.response.swap_venue.name as keyof typeof providerMapping
          ] ??
          routingInfo.route?.response.swap_venue.name
            ?.split('-')
            .map((item) => capitalize(item))
            .join(' '),
        icon: (routingInfo.route?.response.swap_venue as any)?.logo_uri,
      }
    }

    if (routingInfo.route?.response.swap_venues.length > 0) {
      return {
        name:
          providerMapping[
            routingInfo.route?.response.swap_venues[0].name as keyof typeof providerMapping
          ] ??
          (routingInfo.route?.response.swap_venues[0].name as string)
            ?.split('-')
            .map((item) => capitalize(item))
            .join(' '),
        icon: (routingInfo.route?.response.swap_venues[0] as any)?.logo_uri,
      }
    }

    return null
  }, [debouncedInAmount, routingInfo?.aggregator, routingInfo?.route?.response])

  useEffect(() => {
    setGasPriceOption({
      option: GasOptions.LOW,
      gasPrice: defaultGasPrice.gasPrice,
    })
    setGasOption(GasOptions.LOW)
    setUserPreferredGasPrice(defaultGasPrice.gasPrice)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

  const handleGasClick = useCallback(() => {
    setShowMoreDetailsSheet(true)
  }, [setShowMoreDetailsSheet])

  const handleTooltipMouseEnter = useCallback(() => {
    setShowProviderInfo(true)
  }, [])

  const handleTooltipMouseLeave = useCallback(() => {
    setShowProviderInfo(false)
  }, [])

  return (
    <div className='flex flex-col gap-y-1'>
      <div className='w-full flex justify-between items-start gap-2 px-2 py-1'>
        <ConversionRateDisplay />
        {debouncedInAmount !== '' && Number(debouncedInAmount) !== 0 && (
          <button onClick={handleGasClick} className='flex items-center justify-end gap-1'>
            <GasPump size={16} className='dark:text-white-100' />
            {loadingRoutes || loadingMessages || isSkipGasFeeLoading ? (
              <Skeleton
                containerClassName='block !leading-none rounded-xl'
                width={35}
                height={16}
              />
            ) : (
              <span className='dark:text-white-100 text-xs font-medium'>
                {displayFee?.fiatValue}
                {totalBridgeFee && ` + $${totalBridgeFee}`}
              </span>
            )}
            <CaretDown size={16} className='dark:text-white-100' />
          </button>
        )}
      </div>
      {providerInfo && (
        <div className='relative'>
          <div className='w-full flex justify-between gap-2 pl-2 pr-3 py-1'>
            <div className='flex items-center gap-x-1'>
              <Text size='xs' color='text-black-100 dark:text-white-100' className='font-medium'>
                Provider
              </Text>
              <Info
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
                className='text-gray-600 dark:text-gray-400 cursor-pointer pr-1.5 !w-[18px] !h-12px'
              />
            </div>
            <div className='flex gap-x-1 items-center'>
              <img
                src={providerInfo.icon}
                onError={imgOnError(defaultTokenLogo)}
                className='w-[14px] h-[14px]'
              />
              <Text size='xs' color='text-black-100 dark:text-white-100' className='font-medium'>
                {providerInfo.name}
              </Text>
            </div>
          </div>
          {showProviderInfo && (
            <div onMouseEnter={handleTooltipMouseEnter} onMouseLeave={handleTooltipMouseLeave}>
              <Text
                size='sm'
                color='text-gray-800 dark:text-gray-200'
                className='absolute left-[72px] -top-[18px] w-[200px] p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100 dark:bg-gray-900'
              >
                The decentralised exchange used to complete your swap
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
