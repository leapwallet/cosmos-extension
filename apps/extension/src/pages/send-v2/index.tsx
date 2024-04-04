import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import SelectChain from 'pages/home/SelectChain'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { isCompassWallet } from 'utils/isCompassWallet'

import { AmountCard } from './components/amount-card'
import { Memo } from './components/memo'
import { RecipientCard } from './components/recipient-card'
import { ReviewTransfer } from './components/reivew-transfer'
import { SendContextProvider } from './context'

const Send = () => {
  usePageView(PageName.Send)

  const navigate = useNavigate()
  const location = useLocation()
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const setActiveChain = useSetActiveChain()

  const defaultTokenLogo = useDefaultTokenLogo()
  const [showChainSelector, setShowChainSelector] = useState<boolean>(false)

  const themeColor = useThemeColor()
  const chainImage = useMemo(
    () => chainInfos[activeChain]?.chainSymbolImageUrl ?? defaultTokenLogo,
    [activeChain, chainInfos, defaultTokenLogo],
  )

  const chainId = useQuery().get('chainId') ?? undefined

  useEffect(() => {
    if (chainId) {
      const chainKey = Object.values(chainInfos).find((chain) => chain.chainId === chainId)?.key
      chainKey && setActiveChain(chainKey)
    }
  }, [chainId])

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
              onImgClick={isCompassWallet() ? undefined : () => setShowChainSelector(true)}
              title={location.pathname === '/ibc' ? 'IBC' : 'Send'}
              topColor={themeColor}
            />
          }
        >
          <SendContextProvider activeChain={activeChain}>
            <div className='p-4 space-y-4 overflow-y-auto' style={{ height: 'calc(100% - 72px)' }}>
              <RecipientCard themeColor={themeColor} />
              <AmountCard themeColor={themeColor} />
              <Memo />
              <div className='h-[115px]' />
              <ReviewTransfer themeColor={themeColor} />
            </div>
          </SendContextProvider>
          <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
        </PopupLayout>
      </motion.div>
    </div>
  )
}

export default Send
