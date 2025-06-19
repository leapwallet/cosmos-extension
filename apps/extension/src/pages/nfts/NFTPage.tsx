import { NftPage, useDisabledNFTsCollections } from '@leapwallet/cosmos-wallet-hooks'
import { NftStore } from '@leapwallet/cosmos-wallet-store'
import { ArrowCounterClockwise, Faders, MagnifyingGlassMinus } from '@phosphor-icons/react'
import { WalletButtonV2 } from 'components/button'
import { PageHeader } from 'components/header/PageHeaderV2'
import { SideNavMenuOpen } from 'components/header/sidenav-menu'
import { SidePanelTrigger } from 'components/header/sidepanel-trigger'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { SearchInput } from 'components/ui/input/search-input'
import { motion } from 'framer-motion'
import { useWalletInfo } from 'hooks'
import useQuery from 'hooks/useQuery'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectWallet from 'pages/home/SelectWallet/v2'
import { createWalletLoaderVariants } from 'pages/onboarding/create/creating-wallet-loader'
import React, { useEffect, useMemo, useState } from 'react'
import { FavNftStore, favNftStore } from 'stores/manage-nft-store'
import { nftStore } from 'stores/nft-store'
import { transition } from 'utils/motion-variants'

import CollectionDetails from './CollectionDetails'
import CollectionList from './CollectionList'
import { ManageCollections } from './components/ManageCollections'
import { NftContextProvider, useNftContext } from './context'
import { NftDetails } from './NFTDetails'
import { NFTLoading } from './NFTLoading'
import TxPage, { TxType } from './send-nft/TxPage'

const NFTs = observer(
  ({ nftStore, favNftStore }: { nftStore: NftStore; favNftStore: FavNftStore }) => {
    const query = useQuery()
    const [searchQuery, setSearchQuery] = useState('')
    const collectionData = nftStore.nftDetails.collectionData
    const isLoading = nftStore.nftDetails.loading
    const disabledNftsCollections = useDisabledNFTsCollections()
    const { nftDetails, setNftDetails, showTxPage, setShowTxPage } = useNftContext()

    const noNFTFound = useMemo(
      () => isLoading === false && Object.values(collectionData?.nfts ?? {}).length === 0,
      [isLoading, collectionData?.nfts],
    )

    const filteredCollections = useMemo(() => {
      const searchedNFTs = Object.values(collectionData?.nfts ?? {})
        .flat()
        .filter(
          (nft) =>
            nft.name.trim().toLowerCase().includes(searchQuery.toLowerCase()) ||
            `#${nft.tokenId ?? nft.domain}`
              .trim()
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        )
      const searchedNFTCollectionAddresses = searchedNFTs.map((nft) => nft.collection.address)

      return collectionData?.collections
        .filter(
          (item) =>
            !disabledNftsCollections.includes(item.address) &&
            (item.name.trim().toLowerCase().includes(searchQuery.toLowerCase()) ||
              searchedNFTCollectionAddresses.includes(item.address)),
        )
        .sort((collectionA, collectionB) => {
          const nameA = collectionA.name.toLowerCase().trim()
          const nameB = collectionB.name.toLowerCase().trim()

          if (nameA > nameB) return 1
          if (nameA < nameB) return -1
          return 0
        })
        .sort((collectionA, collectionB) => {
          const isCollectionAFav = favNftStore.favNfts.some((item) =>
            item.includes(collectionA.address),
          )
          const isCollectionBFav = favNftStore.favNfts.some((item) =>
            item.includes(collectionB.address),
          )

          if (isCollectionAFav && !isCollectionBFav) return -1
          if (!isCollectionAFav && isCollectionBFav) return 1
          return 0
        })
    }, [
      collectionData?.collections,
      collectionData?.nfts,
      disabledNftsCollections,
      favNftStore.favNfts,
      searchQuery,
    ])

    const hasToShowNetworkErrorView = useMemo(() => {
      return (
        isLoading === false &&
        Object.values(collectionData?.nfts ?? {}).length === 0 &&
        nftStore.nftDetails.networkError
      )
    }, [isLoading, collectionData?.nfts, nftStore.nftDetails.networkError])

    useEffect(() => {
      setSearchQuery('')
      setNftDetails(null)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    if (showTxPage) {
      return (
        <TxPage
          isOpen={showTxPage}
          onClose={() => {
            setShowTxPage(false)
          }}
          txType={TxType.NFTSEND}
        />
      )
    }

    if (isLoading) {
      return <NFTLoading />
    }

    if (hasToShowNetworkErrorView) {
      return (
        <div className='flex flex-col px-10 items-center justify-center gap-7 flex-1 pb-[75px]'>
          <div className='flex flex-col gap-8 items-center'>
            <div className='h-16 w-16 p-5 rounded-full bg-red-600 dark:bg-red-400'>
              {/* TODO: change it to failed red */}
              <img src={Images.Misc.Warning} />
            </div>
            <div className='flex flex-col gap-3 items-center'>
              <Text size='lg' color='text-monochrome' className='font-bold'>
                Failed to load NFTs
              </Text>
              <Text size='sm' color='text-secondary-800' className='text-center'>
                We were unable to load your NFTs at the moment due to some technical failure. Please
                try again in some time.
              </Text>
            </div>
          </div>
          <Button
            className='w-full'
            onClick={() => {
              nftStore.loadNfts()
            }}
          >
            <div className='flex items-center gap-x-1.5'>
              <ArrowCounterClockwise size={16} className='text-monochrome' />
              <Text size='sm' className='font-bold !leading-[18.9px]' color='text-monochrome'>
                Reload NFTs
              </Text>
            </div>
          </Button>
        </div>
      )
    }

    if (noNFTFound) {
      return (
        <div className='h-[calc(100%-140px)] px-[68px] w-full flex-col flex  justify-center items-center gap-4'>
          <MagnifyingGlassMinus
            size={64}
            className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
          />
          <div className='flex flex-col justify-start items-center w-full gap-3'>
            <div className='text-lg text-center font-bold !leading-[21.5px] text-monochrome'>
              No NFTs found
            </div>
            <div className='text-sm font-normal !leading-[22.4px] text-secondary-800 text-center'>
              Looks like we couldn&apos;t find any NFTs in your wallet.
            </div>
          </div>
        </div>
      )
    }

    if (nftDetails) {
      return <NftDetails />
    }

    return (
      <>
        <div className='flex flex-1 flex-col px-6 py-7 gap-y-8 justify-between pb-[75px]'>
          <div className='flex flex-col justify-between gap-y-8'>
            <SearchInput
              value={searchQuery}
              autoFocus={false}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by collection or name'
              onClear={() => setSearchQuery('')}
            />
            {filteredCollections?.length > 0 ? (
              <CollectionList collections={filteredCollections} />
            ) : (
              <div className='pt-10 px-4 w-full flex-col flex  justify-center items-center gap-4'>
                <MagnifyingGlassMinus
                  size={64}
                  className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
                />
                <div className='flex flex-col justify-start items-center w-full gap-3'>
                  <div className='text-lg text-center font-bold !leading-[21.5px] text-monochrome'>
                    No NFTs found
                  </div>
                  <div className='text-sm font-normal !leading-[22.4px] text-secondary-800 text-center'>
                    We couldn’t find a match. Try searching again or use a different keyword.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <CollectionDetails />
      </>
    )
  },
)

const NFTPage = observer(() => {
  const [activePage, setActivePage] = useState<NftPage>('ShowNfts')
  const value = { activePage, setActivePage }
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showManageCollections, setShowManageCollections] = useState(false)
  const walletInfo = useWalletInfo()
  const collectionData = nftStore.nftDetails.collectionData

  return (
    <NftContextProvider value={value}>
      <div className='enclosing-panel relative m-auto flex flex-col overflow-hidden panel-width bg-secondary panel-height max-panel-height'>
        <motion.div id='popup-layout' className={'flex-1 panel-height overflow-auto flex flex-col'}>
          {/* main body */}
          <PageHeader>
            <div className='flex items-center bg-secondary-200 rounded-full overflow-hidden'>
              <SideNavMenuOpen className='py-2 pr-1.5 pl-2.5 text-foreground/75 hover:text-foreground transition-colors' />
              <div className='h-5 w-px bg-secondary-300' />
              <SidePanelTrigger className='py-2 pl-1.5 pr-2.5 text-foreground/75 hover:text-foreground transition-colors' />
            </div>

            <WalletButtonV2
              showDropdown
              showWalletAvatar
              className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
              walletName={walletInfo.walletName}
              walletAvatar={walletInfo.walletAvatar}
              handleDropdownClick={() => setShowSelectWallet(true)}
            />
            {collectionData?.collections?.length > 0 && (
              <button
                onClick={() => setShowManageCollections(true)}
                className='bg-secondary-200 hover:bg-secondary-300 rounded-full gap-x-0.5 p-2'
              >
                <Faders size={20} className='rotate-90 text-foreground' />
              </button>
            )}
          </PageHeader>
          <NFTs nftStore={nftStore} favNftStore={favNftStore} />
          <SelectWallet
            isVisible={showSelectWallet}
            onClose={() => setShowSelectWallet(false)}
            title='Your Wallets'
          />
          <ManageCollections
            isVisible={showManageCollections}
            onClose={() => setShowManageCollections(false)}
          />
        </motion.div>
      </div>
    </NftContextProvider>
  )
})

export default NFTPage
