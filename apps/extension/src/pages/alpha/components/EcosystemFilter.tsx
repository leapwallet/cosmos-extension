import Text from 'components/text'
import { EventName, PageName } from 'config/analytics'
import { useDefaultTokenLogo, useNonNativeCustomChains } from 'hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import { useCoingeckoChains } from 'hooks/useCoingeckoChains'
import mixpanel from 'mixpanel-browser'
import React, { useCallback } from 'react'

import { useFilters } from '../context/filter-context'
import FilterItem from './FilterItem'

export default function EcosystemFilter({
  ecosystemFilters,
  pageName,
}: {
  ecosystemFilters: string[]
  pageName: PageName
}) {
  const { chains } = useCoingeckoChains()
  const nativeChains = useChainInfos()
  const nonNative = useNonNativeCustomChains()
  const defaultTokenLogo = useDefaultTokenLogo()

  const nativeChainsList = Object.values(nativeChains)
  const nonNativeChainsList = Object.values(nonNative)
  const allChains = [...nativeChainsList, ...nonNativeChainsList]

  const { selectedOpportunities, selectedEcosystems, setEcosystems } = useFilters()

  const handleEcosystemToggle = useCallback(
    (ecosystem: string) => {
      try {
        const newEcosystems = selectedEcosystems?.includes(ecosystem)
          ? selectedEcosystems.filter((o) => o !== ecosystem)
          : [...(selectedEcosystems || []), ecosystem]

        setEcosystems(newEcosystems)
        mixpanel.track(EventName.Filters, {
          filterSelected: [...(selectedOpportunities || []), ...(newEcosystems || [])],
          filterApplySource: pageName,
        })
      } catch (err) {
        // ignore
      }
    },
    [selectedOpportunities, selectedEcosystems, setEcosystems, pageName],
  )

  return (
    <div>
      <Text size='sm' className='text-gray-600 dark:text-gray-400 mb-3'>
        Ecosystem
      </Text>
      <div className='flex flex-col gap-2 bg-gray-100 dark:bg-gray-950 rounded-xl px-2 py-2'>
        {ecosystemFilters
          ?.sort((a, b) => a.localeCompare(b))
          ?.map((ecosystem, index) => {
            const coingeckoChain = chains.find((chain) =>
              chain.name.toLowerCase().startsWith(ecosystem?.toLowerCase().split(' ')[0]),
            )
            const chain = allChains.find((chain) =>
              chain.chainName.toLowerCase().startsWith(ecosystem?.toLowerCase().split(' ')[0]),
            )

            const icon =
              chain && chain?.chainSymbolImageUrl
                ? chain?.chainSymbolImageUrl
                : coingeckoChain
                ? coingeckoChain?.image?.small || coingeckoChain?.image?.large || defaultTokenLogo
                : defaultTokenLogo

            return (
              <FilterItem
                key={ecosystem}
                icon={icon}
                label={ecosystem}
                isLast={index === ecosystemFilters.length - 1}
                isSelected={selectedEcosystems?.includes(ecosystem)}
                onSelect={() => handleEcosystemToggle(ecosystem)}
                onRemove={() => handleEcosystemToggle(ecosystem)}
              />
            )
          })}
      </div>
    </div>
  )
}
