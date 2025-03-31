import { BookmarkSimple } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { EventName, PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useState } from 'react'
import { HeaderActionType } from 'types/components'

import AlphaHome from './AlphaHome'
import AlphaDetailsDrawer from './components/AlphaDetailsDrawer'
import { BookmarkedAlpha } from './components/Bookmarks'
import { BookmarkProvider } from './context/bookmark-context'
import { useFilters } from './context/filter-context'

export default function Alpha() {
  usePageView(PageName.Alpha)
  const { showDetails, selectedOpportunity, closeDetails } = useFilters()

  const [showSideNav, setShowSideNav] = useState<boolean>(false)
  const [showAboutAlpha, setshowAboutAlpha] = useState<boolean>(false)
  const [showWarning, setShowWarning] = useState<boolean>(false)

  const handleShowAboutAlphaSheet = useCallback(() => {
    setshowAboutAlpha(true)
    try {
      mixpanel.track(EventName.PageView, {
        pageName: PageName.Bookmark,
      })
    } catch (err) {
      // ignore
    }
  }, [setshowAboutAlpha])
  const handleOpenSideNavSheet = useCallback(() => setShowSideNav(true), [])
  return (
    <BookmarkProvider>
      <motion.div className='relative h-full w-full enclosing-panel'>
        <PopupLayout
          header={
            <PageHeader
              title='Alpha'
              titleIcon={
                <button onClick={() => setShowWarning(true)}>
                  <img src={Images.Alpha.WarningShield} alt='warning' className='w-4 h-4' />
                </button>
              }
              imgSrc={
                <BookmarkSimple
                  // this id is used in the AlphaOpportunity component to animate the bookmark icon
                  // if you want to change this please update the AlphaOpportunity component as well
                  id='alpha-bookmark-icon'
                  size={20}
                  weight={'fill'}
                  className='text-black-100 dark:text-white-100'
                />
              }
              onImgClick={handleShowAboutAlphaSheet}
              action={{
                onClick: handleOpenSideNavSheet,
                type: HeaderActionType.NAVIGATION,
                className: 'min-w-[48px] h-[36px] px-2 bg-[#FFFFFF] dark:bg-gray-950 rounded-full ',
              }}
              dontShowFilledArrowIcon={true}
            />
          }
        >
          <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
          <BookmarkedAlpha
            isOpen={showAboutAlpha}
            toggler={() => setshowAboutAlpha(!showAboutAlpha)}
          />
          <AlphaDetailsDrawer
            isShown={showDetails}
            onClose={closeDetails}
            opportunity={selectedOpportunity}
          />
          <div className='overflow-y-auto' style={{ height: 'calc(100% - 72px - 30px)' }}>
            <AlphaHome />
          </div>
        </PopupLayout>
        <BottomNav label={BottomNavLabel.Alpha} />
      </motion.div>

      <BottomModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title='Explore Safely'
        closeOnBackdropClick={true}
      >
        <Text className='!text-gray-600 dark:!text-gray-200 text-sm'>
          We aggregate event data (airdrops, NFT mints, testnets, and more) for informational
          purposes only. We do not endorse or verify its accuracy, relevance, or timeliness. Some
          opportunities may carry inherent risks. Always do your own research before participating.
        </Text>
      </BottomModal>
    </BookmarkProvider>
  )
}
