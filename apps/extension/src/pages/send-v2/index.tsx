import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import PopupLayout from 'components/layout/popup-layout'
import { motion } from 'framer-motion'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import SelectChain from 'pages/home/SelectChain'
import React, { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { isCompassWallet } from 'utils/isCompassWallet'

import { AmountCard } from './components/amount-card'
import { FeesView } from './components/fees-view'
import { RecipientCard } from './components/recipient-card'
import { ReviewTransfer } from './components/reivew-transfer'
import { SendContextProvider } from './context'

const Send = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()

  const defaultTokenLogo = useDefaultTokenLogo()
  const [showChainSelector, setShowChainSelector] = useState<boolean>(false)

  const themeColor = useThemeColor()
  const chainImage = useMemo(
    () => chainInfos[activeChain]?.chainSymbolImageUrl ?? defaultTokenLogo,
    [activeChain, chainInfos, defaultTokenLogo],
  )

  return (
    <div>
      <motion.div className='relative h-full w-full'>
        <PopupLayout
          header={
            <Header
              action={{
                onClick: () => navigate(-1),
                type: HeaderActionType.BACK,
              }}
              imgSrc={chainImage}
              onImgClick={
                isCompassWallet()
                  ? undefined
                  : function noRefCheck() {
                      setShowChainSelector(true)
                    }
              }
              title={location.pathname === '/ibc' ? 'IBC' : 'Send'}
              topColor={themeColor}
            />
          }
        >
          <SendContextProvider activeChain={activeChain}>
            <div
              className='p-4 space-y-4 overflow-y-auto'
              style={{ height: 'calc(100% - 72px - 60px)' }}
            >
              <RecipientCard themeColor={themeColor} />
              <AmountCard themeColor={themeColor} />
              <FeesView />
              <ReviewTransfer themeColor={themeColor} />
            </div>
          </SendContextProvider>
          <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
        </PopupLayout>
        <BottomNav label={BottomNavLabel.Home} />
      </motion.div>
    </div>
  )
}

export default Send
