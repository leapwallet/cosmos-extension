import Text from 'components/text'
import { EventName, PageName } from 'config/analytics'
import { useDefaultTokenLogo, useNonNativeCustomChains } from 'hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import { useCoingeckoChains } from 'hooks/useCoingeckoChains'
import mixpanel from 'mixpanel-browser'
import React, { useCallback } from 'react'

import FilterItem from '../components/FilterItem'
import { useChadProvider } from '../context/chad-exclusives-context'

export default function EcosystemFilter({
  ecosystemFilters,
  pageName,
  isChad,
  onClose,
}: {
  ecosystemFilters: string[]
  pageName: PageName
  isChad: boolean
  onClose: () => void
}) {
  const { chains } = useCoingeckoChains()
  const nativeChains = useChainInfos()
  const nonNative = useNonNativeCustomChains()
  const defaultTokenLogo = useDefaultTokenLogo()

  const nativeChainsList = Object.values(nativeChains)
  const nonNativeChainsList = Object.values(nonNative)
  const allChains = [...nativeChainsList, ...nonNativeChainsList]
  const { selectedOpportunities, selectedEcosystems, setEcosystems } = useChadProvider()

  const handleEcosystemToggle = useCallback(
    (ecosystem: string) => {
      try {
        const newEcosystems = selectedEcosystems?.includes(ecosystem)
          ? selectedEcosystems.filter((o) => o !== ecosystem)
          : [...(selectedEcosystems || []), ecosystem]

        setEcosystems(newEcosystems)
        onClose()
        mixpanel.track(EventName.Filters, {
          filterSelected: [...(selectedOpportunities || []), ...(newEcosystems || [])],
          filterApplySource: pageName,
          isChad,
        })
      } catch (err) {
        // ignore
      }
    },
    [selectedOpportunities, selectedEcosystems, setEcosystems, pageName, isChad, onClose],
  )

  return (
    <div className='flex flex-col gap-5'>
      <span className='text-muted-foreground text-sm uppercase font-bold'>Ecosystem</span>

      <div className='flex flex-col'>
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
