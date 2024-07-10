import {
  Token,
  useActiveChain,
  useGetTokenSpendableBalances,
} from '@leapwallet/cosmos-wallet-hooks'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { motion } from 'framer-motion'
import { useChainPageInfo } from 'hooks'
import { usePageView } from 'hooks/analytics/usePageView'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import useQuery from 'hooks/useQuery'
import SelectChain from 'pages/home/SelectChain'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AggregatedSupportedChain } from 'types/utility'

import {
  AggregatedSpendableNullComponents,
  LoadAggregateAssets,
  LoadChainAssets,
} from './components'
import { AmountCard } from './components/amount-card'
import ErrorWarning from './components/error-warning'
import { Memo } from './components/memo'
import { RecipientCard } from './components/recipient-card'
import { ReviewTransfer } from './components/reivew-transfer'
import { SendContextProvider } from './context'

const Send = React.memo(() => {
  usePageView(PageName.Send)

  const navigate = useNavigate()
  const location = useLocation()
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const setActiveChain = useSetActiveChain()
  const { refetchBalances } = useGetTokenSpendableBalances()

  const [showChainSelector, setShowChainSelector] = useState<boolean>(false)
  const { headerChainImgSrc, topChainColor } = useChainPageInfo()

  const [allAssets, setAllAssets] = useState<Token[]>([])
  const [isAllAssetsLoading, setIsAllAssetsLoading] = useState<boolean>(true)
  const chainId = useQuery().get('chainId') ?? undefined
  const dontShowSelectChain = useDontShowSelectChain()

  // refetch balances
  useEffect(() => {
    refetchBalances()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (chainId) {
      const chainKey = Object.values(chainInfos).find((chain) => chain.chainId === chainId)?.key
      chainKey && setActiveChain(chainKey)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, chainInfos])

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
              imgSrc={headerChainImgSrc}
              onImgClick={dontShowSelectChain ? undefined : () => setShowChainSelector(true)}
              title={location.pathname === '/ibc' ? 'IBC' : 'Send'}
            />
          }
        >
          {(activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY ? (
            <>
              <LoadAggregateAssets
                setAllAssets={setAllAssets}
                setIsAllAssetsLoading={setIsAllAssetsLoading}
              />
              <AggregatedSpendableNullComponents />
            </>
          ) : (
            <LoadChainAssets
              setAllAssets={setAllAssets}
              setIsAllAssetsLoading={setIsAllAssetsLoading}
            />
          )}
          <SendContextProvider activeChain={activeChain}>
            <div className='p-4 space-y-4 overflow-y-auto' style={{ height: 'calc(100% - 72px)' }}>
              <AmountCard allAssets={allAssets} isAllAssetsLoading={isAllAssetsLoading} />
              <RecipientCard themeColor={topChainColor} />
              <Memo />
              <ErrorWarning />
              <div className='h-[100px]' />
              <ReviewTransfer />
            </div>
          </SendContextProvider>
          <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
        </PopupLayout>
      </motion.div>
    </div>
  )
})

Send.displayName = 'Send'

export default Send
