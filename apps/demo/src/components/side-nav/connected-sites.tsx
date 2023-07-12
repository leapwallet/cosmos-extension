import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import classnames from 'classnames'
import React, { useEffect, useState } from 'react'

import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { AppConfig } from '~/config'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import { Images } from '~/images'

import { SideNavSection } from './elements'
import { GENERAL_SECURITY_PAGES } from './general-security'

type Props = {
  setPage: React.Dispatch<React.SetStateAction<number>>
}

type NavCardProps = {
  imgSrc: string
  property: string
  onClick: () => void
  className?: string
}

const NavCard = ({ imgSrc, property, onClick, className }: NavCardProps) => {
  return (
    <div
      className={classnames(
        'flex justify-between items-center px-4 bg-white-100 dark:bg-gray-900 cursor-pointer rounded-[16px] w-[344px] h-[56px]',
        className,
      )}
    >
      <div className={classnames('flex items-center flex-grow')}>
        <img src={imgSrc} className='h-6 w-6 mr-3' />
        <div className={classnames('flex flex-col justify-center items-start')}>
          <div className='text-base font-bold text-black-100 dark:text-white-100 text-left max-w-[160px] text-ellipsis overflow-hidden'>
            {property}
          </div>
        </div>
        <div
          className='text-base flex-1 font-bold text-[14px] text-red-300 text-right'
          onClick={onClick}
        >
          Disconnect
        </div>
      </div>
    </div>
  )
}

const ConnectedSites = ({ setPage }: Props) => {
  const [searchSite, setSearchSite] = useState('')
  const [sites, setSites] = useState([''])

  const activeChain = useActiveChain()
  const activeWallet = useActiveWallet()

  const updateSites = () => {
    const connectionsStore = localStorage.getItem(AppConfig.STORAGE_KEYS.CONNECTIONS)
    if (typeof connectionsStore === 'string') {
      const connections = JSON.parse(connectionsStore)
      const walletConnections = connections[activeWallet.id]
      const chainId = Object.keys(walletConnections).find(
        (_chainId) => _chainId.indexOf(activeChain) > -1,
      )
      setSites(typeof chainId === 'string' ? walletConnections[chainId] : [])
    }
  }

  useEffect(() => {
    ;(async () => {
      await updateSites()
    })()
  }, [])

  const goBack = () => {
    setPage(GENERAL_SECURITY_PAGES.DEFAULT)
  }
  const handleSearchSite = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchSite(e.target.value)
  }

  const sitesToDisplay = sites?.filter((site) => site.indexOf(searchSite) > -1)

  return (
    <div className='h-[600px]'>
      <Header
        topColor={ChainInfos[activeChain].theme.primaryColor}
        title='Connected Sites'
        action={{ type: HeaderActionType.BACK, onClick: goBack }}
      />
      <div className='mx-auto mt-[28px] w-[344px] mb-[16px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
        <input
          placeholder='Search'
          className='flex flex-grow text-base text-gray-400 outline-none bg-white-0'
          value={searchSite}
          onChange={handleSearchSite}
        />
        {searchSite.length === 0 ? (
          <img src={Images.Misc.SearchIcon} />
        ) : (
          <img
            className='cursor-pointer'
            src={Images.Misc.CrossFilled}
            onClick={() => setSearchSite('')}
          />
        )}
      </div>
      <div className='flex flex-col items-center m-[28px] mt-0 dark:bg-gray-900 cursor-pointer rounded-[16px]'>
        <SideNavSection>
          {sitesToDisplay?.map((site) => {
            return (
              <div key={site}>
                <NavCard
                  imgSrc={`${site}/favicon.ico`}
                  property={site.split('//')[1]}
                  onClick={console.log}
                />
                <CardDivider />
              </div>
            )
          })}
          {sitesToDisplay.length === 0 && (
            <div className='h-48 w-full flex flex-col justify-center align-middle'>
              <img src={Images.Misc.ConnectedSitesIcon} className='h-[56px] mx-2' />
              <div className='mt-3 flex flex-col items-center'>
                <Text size='lg' className='text-center font-bold'>
                  No connections
                </Text>
                <Text size='sm' className='text-center text-gray-400'>
                  You are not connected to any sites
                </Text>
              </div>
            </div>
          )}
        </SideNavSection>
      </div>
    </div>
  )
}

export default ConnectedSites
