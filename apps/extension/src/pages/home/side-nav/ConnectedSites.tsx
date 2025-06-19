import { Avatar, Buttons, CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import { CONNECTIONS } from 'config/storage-keys'
import Fuse from 'fuse.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { sendMessageToAllTabs } from 'utils'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import Browser, { Storage } from 'webextension-polyfill'

import { GENERAL_SECURITY_PAGES } from './GeneralSecurity'

type Props = {
  setPage: React.Dispatch<React.SetStateAction<number>>
}

type ConnectedSiteCardProps = {
  site: string
  onClick: () => void
  className?: string
}

const ConnectedSiteCard = ({ site, onClick, className }: ConnectedSiteCardProps) => {
  // generate url object from site
  const siteURL = new URL(site)
  // get site logo
  const siteLogo = useSiteLogo(siteURL.origin)
  // use top level domain as name (without tld)
  const name = siteURL.host.split('.').slice(-2)[0]

  return (
    <div
      className={classNames(
        'flex gap-4 justify-between items-center bg-white-100 dark:bg-gray-900 rounded-2xl w-full px-4 py-3',
        className,
      )}
    >
      <div className='flex w-[160px] items-center'>
        <div className='flex-shrink-0 p-1'>
          <Avatar
            avatarImage={siteLogo}
            avatarOnError={imgOnError(Images.Misc.Globe)}
            size='sm'
            className={classNames('rounded-full overflow-hidden', {
              'h-5 w-5': isSidePanel(),
            })}
          />
        </div>
        <div className='flex flex-col justify-center items-start ml-3 w-full'>
          <h3
            title={name}
            className={classNames(
              'capitalize font-bold text-black-100 dark:text-white-100 text-left w-full text-ellipsis overflow-clip',
              { 'text-sm !leading-[19.6px]': isSidePanel() },
            )}
          >
            {name}
          </h3>
          <p
            title={siteURL.host}
            className='text-xs text-gray-400 text-left w-full text-ellipsis overflow-clip'
          >
            {siteURL.host}
          </p>
        </div>
      </div>
      {!isSidePanel() ? (
        <button
          className='text-base block flex-shrink-0 px-3 py-1 font-bold text-sm text-red-300 bg-red-300/10 rounded-full text-right cursor-pointer'
          onClick={onClick}
        >
          Disconnect
        </button>
      ) : (
        <Buttons.Cancel onClick={onClick} className='h-5 w-5' />
      )}
    </div>
  )
}

const ConnectedSites = ({ setPage }: Props) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sites, setSites] = useState<string[]>([])

  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const { activeWallet } = useActiveWallet()

  const sitesFuse = useMemo(() => {
    return new Fuse(sites, {
      threshold: 0.3,
    })
  }, [sites])

  const sitesToDisplay = useMemo(() => {
    const clearSearchQuery = searchQuery.trim()
    if (!searchQuery) {
      return sites
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
  }, [searchQuery, sites, sitesFuse])

  const activeChainId = useMemo(() => {
    return chainInfos[activeChain].chainId
  }, [activeChain, chainInfos])

  const updateSites = useCallback(async () => {
    const { connections } = await Browser.storage.local.get(CONNECTIONS)
    const walletConnections =
      connections?.[activeWallet?.id as string] ?? ({} as Record<string, string[]>)
    setSites(walletConnections[activeChainId] ?? [])
  }, [activeChainId, activeWallet?.id])

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

  const goBack = useCallback(() => {
    setPage(GENERAL_SECURITY_PAGES.DEFAULT)
  }, [setPage])

  const handleSearchSite = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDisconnect = useCallback(
    async (siteName: string) => {
      const { connections } = await Browser.storage.local.get(CONNECTIONS)
      const walletConnections = connections[activeWallet?.id as string]
      if (!walletConnections) {
        return
      }
      const websites: string[] = walletConnections[activeChainId]
      if (!websites) {
        return
      }
      const index = websites.findIndex((site) => site === siteName)
      websites.splice(index, 1)
      await Browser.storage.local.set({ [CONNECTIONS]: { ...connections } })
      await updateSites()
      await sendMessageToAllTabs({ event: 'disconnectFromOrigin', data: siteName })
    },
    [activeChainId, activeWallet?.id, updateSites],
  )

  return (
    <div className='panel-height enclosing-panel'>
      <Header title='Connected Sites' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <div className='h-[calc(100%-72px)] overflow-y-auto'>
        <div className='flex flex-col items-center mx-7 mt-7 px-4 py-6 dark:bg-gray-900 bg-white-100 rounded-2xl'>
          <div className='w-full flex flex-col justify-center align-middle'>
            <img src={Images.Misc.ConnectedSitesIcon} className='h-12 mx-2' />
            {sitesToDisplay.length === 0 ? (
              <div className='mt-3 flex flex-col items-center'>
                <Text size='lg' className='text-center font-bold'>
                  {sites.length === 0 ? 'No sites connected' : 'No results found'}
                </Text>
                <Text size='sm' className='text-center text-gray-400'>
                  {sites.length === 0
                    ? 'You are not connected to any sites'
                    : 'Change your search query and try again'}
                </Text>
              </div>
            ) : (
              <p className='mt-5 px-4 text-sm text-center dark:text-gray-300 text-gray-700'>
                <strong>{activeWallet?.name ?? 'Your wallet'}</strong> is connected to the following
                dapps
              </p>
            )}
          </div>
        </div>

        <div className='sticky top-0 z-[1] bg-gray-50 dark:bg-black-100 px-7 py-4'>
          <SearchInput
            placeholder='Search sites...'
            onChange={handleSearchSite}
            value={searchQuery}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <ul className='mx-7 mb-4 dark:bg-gray-900 bg-white-100 rounded-2xl list-none'>
          {sitesToDisplay.map((site, index, arr) => {
            const isLast = index === arr.length - 1
            return (
              <li key={site} className='!m-0'>
                <ConnectedSiteCard site={site} onClick={() => handleDisconnect(site)} />
                {isLast ? null : <CardDivider />}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default ConnectedSites
