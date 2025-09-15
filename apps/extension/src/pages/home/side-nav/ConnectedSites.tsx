import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { SearchInput } from 'components/ui/input/search-input'
import { CONNECTIONS } from 'config/storage-keys'
import Fuse from 'fuse.js'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { sendMessageToAllTabs } from 'utils'
import { cn } from 'utils/cn'
import Browser, { Storage } from 'webextension-polyfill'

import { ChainsList } from './components/ChainsList'
import { ConnectedSiteCard } from './components/ConnectedSiteCard'

type Props = {
  isVisible: boolean
  onClose: () => void
}

const ConnectedSites = ({ isVisible, onClose }: Props) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [siteConnections, setSiteConnections] = useState<Record<string, SupportedChain[]>>({})
  const [selectedSite, setSelectedSite] = useState<string | undefined>(undefined)

  const chainInfos = useChainInfos()
  const { activeWallet } = useActiveWallet()

  const sitesFuse = useMemo(() => {
    return new Fuse(Object.keys(siteConnections), {
      threshold: 0.3,
    })
  }, [siteConnections])

  const sitesToDisplay = useMemo(() => {
    const clearSearchQuery = searchQuery.trim()
    if (!searchQuery) {
      return siteConnections
    }

    return sitesFuse
      .search(clearSearchQuery)
      .map((site) => site.item)
      .filter((site) => {
        // filtering Invalid URLs
        try {
          new URL(site) // throws TypeError incase of an Invalid URL
          return true
        } catch (_) {
          return false
        }
      })
      .reduce((acc, site) => {
        acc[site] = siteConnections[site]
        return acc
      }, {} as Record<string, SupportedChain[]>)
  }, [searchQuery, siteConnections, sitesFuse])

  const updateSites = useCallback(async () => {
    const { connections } = await Browser.storage.local.get(CONNECTIONS)
    const chainInfosArray = Object.values(chainInfos)
    const walletConnections: Record<string, string[]> =
      connections?.[activeWallet?.id as string] ?? ({} as Record<string, string[]>)
    const siteConnections = Object.entries(walletConnections).reduce((acc, [chainId, sites]) => {
      const chain = chainInfosArray.find((chain) => chain.chainId === chainId)?.key
      if (!chain) {
        return acc
      }
      sites.forEach((site) => {
        if (!acc[site]) {
          acc[site] = []
        }
        if (!acc[site].includes(chain)) {
          acc[site].push(chain)
        }
      })
      return acc
    }, {} as Record<string, SupportedChain[]>)
    setSiteConnections(siteConnections)
  }, [activeWallet?.id, chainInfos])

  useEffect(() => {
    const connectionChangeListener = (changes: Record<string, Storage.StorageChange>) => {
      const { newValue } = changes[CONNECTIONS] || {}
      if (newValue) {
        updateSites().catch(captureException)
      }
    }
    Browser.storage.onChanged.addListener(connectionChangeListener)
    return () => {
      Browser.storage.onChanged.removeListener(connectionChangeListener)
    }
  }, [updateSites])

  useEffect(() => {
    updateSites().catch(captureException)
  }, [updateSites])

  const handleSearchSite = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleDisconnect = useCallback(
    async (siteNames: string[], _chain?: SupportedChain) => {
      const { connections } = await Browser.storage.local.get(CONNECTIONS)
      const walletConnections = connections[activeWallet?.id as string]
      if (!walletConnections) {
        return
      }
      await Promise.all(
        siteNames.map(async (siteName) => {
          let chains: SupportedChain[] = []
          if (_chain) {
            chains = [_chain]
          } else {
            chains = siteConnections[siteName]
          }

          await Promise.all(
            chains.map((chain) => {
              const chainId = chainInfos[chain].chainId
              const websites: string[] = walletConnections[chainId]
              if (!websites) {
                return
              }
              const index = websites.findIndex((site) => site === siteName)
              websites.splice(index, 1)
              const testnetChainId = chainInfos[chain].testnetChainId
              if (!testnetChainId) {
                return
              }
              const testnetWebsites: string[] = walletConnections[testnetChainId]
              if (!testnetWebsites) {
                return
              }
              const testnetIndex = testnetWebsites.findIndex((site) => site === siteName)
              testnetWebsites.splice(testnetIndex, 1)
            }),
          )
        }),
      )

      await Browser.storage.local.set({ [CONNECTIONS]: { ...connections } })
      await updateSites()
      await Promise.all(
        siteNames.map((siteName) => {
          sendMessageToAllTabs({ event: 'disconnectFromOrigin', data: siteName })
        }),
      )
    },
    [activeWallet?.id, chainInfos, siteConnections, updateSites],
  )

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={onClose}
      title='Connected Sites'
      className='!p-0 h-full'
    >
      {Object.keys(siteConnections).length === 0 ? (
        <div
          className={cn(
            'w-auto flex items-center mt-7 mx-6 justify-center rounded-2xl border border-secondary-200 h-[calc(100%-63px)]',
          )}
        >
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='p-5 bg-secondary-200 rounded-full flex items-center justify-center'>
              <MagnifyingGlassMinus size={24} className='text-foreground' />
            </div>
            <div className='flex flex-col items-center gap-3'>
              <p className='text-[18px] !leading-[24px] font-bold text-foreground text-center'>
                No apps connected
              </p>
              <p className='text-sm text-secondary-800 text-center w-[225px]'>
                Connect to an app to view and manage your active sessions here.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <SearchInput
            placeholder='Search sites...'
            onChange={handleSearchSite}
            value={searchQuery}
            onClear={() => setSearchQuery('')}
            className='m-6 w-auto'
          />

          {Object.keys(sitesToDisplay).length > 0 ? (
            <>
              <div className='flex flex-col gap-3 px-6 pb-6 h-[calc(100%-158px)] overflow-y-scroll'>
                {Object.entries(sitesToDisplay).map(([site, chains]) => {
                  return (
                    <div key={site} className='!m-0'>
                      <ConnectedSiteCard
                        site={site}
                        chains={chains}
                        onClick={(chain?: SupportedChain) => handleDisconnect([site], chain)}
                        setSelectedSite={setSelectedSite}
                      />
                    </div>
                  )
                })}
              </div>
              <div className='w-full py-[5px] mt-auto sticky bottom-0 border-t border-secondary-200 '>
                <Button
                  className={cn('w-full text-red-300 hover:text-red-300')}
                  variant={'ghost'}
                  onClick={() => {
                    handleDisconnect(Object.keys(siteConnections))
                  }}
                >
                  Disconnect all apps
                </Button>
              </div>
            </>
          ) : (
            <div
              className={cn(
                'flex items-center justify-center rounded-2xl border border-secondary-200 w-auto mx-6 h-[calc(100%-84px)]',
              )}
            >
              <div className='flex items-center justify-center flex-col gap-4'>
                <div className='p-5 bg-secondary-200 rounded-full flex items-center justify-center'>
                  <MagnifyingGlassMinus size={24} className='text-foreground' />
                </div>
                <p className='text-[18px] !leading-[24px] font-bold text-foreground text-center'>
                  No results found
                </p>
              </div>
            </div>
          )}
        </>
      )}
      {selectedSite && siteConnections[selectedSite]?.length > 0 && (
        <ChainsList
          chains={siteConnections[selectedSite]}
          isVisible={!!selectedSite}
          onClose={() => setSelectedSite(undefined)}
          onDisconnect={(chain) => handleDisconnect([selectedSite], chain)}
        />
      )}
    </BottomModal>
  )
}

export default ConnectedSites
