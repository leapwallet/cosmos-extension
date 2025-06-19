import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Header, HeaderActionType, useTheme } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { useChainPageInfo } from 'hooks'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import useQuery from 'hooks/useQuery'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { aptosCoinDataStore, chainFeatureFlagsStore, evmBalanceStore } from 'stores/balance-store'
import { chainTagsStore } from 'stores/chain-infos-store'
import {
  rootCW20DenomsStore,
  rootDenomsStore,
  rootERC20DenomsStore,
} from 'stores/denoms-store-instance'
import { manageChainsStore } from 'stores/manage-chains-store'
import { rootBalanceStore } from 'stores/root-store'

import { AmountCard } from './components/amount-card'
import ErrorWarning from './components/error-warning'
import { Memo } from './components/memo'
import { RecipientCard } from './components/recipient-card'
import { ReviewTransfer } from './components/reivew-transfer'
import { SendContextProvider } from './context'

const Send = () => {
  // usePageView(PageName.Send)

  const navigate = useNavigate()
  const location = useLocation()
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const setActiveChain = useSetActiveChain()

  const [showChainSelector, setShowChainSelector] = useState<boolean>(false)
  const { headerChainImgSrc } = useChainPageInfo()
  const { theme } = useTheme()

  const chainId = useQuery().get('chainId') ?? undefined
  const dontShowSelectChain = useDontShowSelectChain(manageChainsStore)
  const isAllAssetsLoading = rootBalanceStore.loading

  useEffect(() => {
    if (chainId) {
      const chainKey = Object.values(chainInfos).find((chain) => chain.chainId === chainId)?.key
      chainKey && setActiveChain(chainKey)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, chainInfos])

  usePerformanceMonitor({
    page: 'send',
    queryStatus: isAllAssetsLoading ? 'loading' : 'success',
    op: 'sendPageLoad',
    description: 'loading state on send page',
  })

  return (
    <motion.div className='relative h-full w-full'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => navigate('/home'),
              type: HeaderActionType.BACK,
            }}
            imgSrc={headerChainImgSrc}
            onImgClick={dontShowSelectChain ? undefined : () => setShowChainSelector(true)}
            title={location.pathname === '/ibc' ? 'IBC' : 'Send'}
          />
        }
      >
        <SendContextProvider
          activeChain={activeChain}
          rootDenomsStore={rootDenomsStore}
          rootCW20DenomsStore={rootCW20DenomsStore}
          rootERC20DenomsStore={rootERC20DenomsStore}
        >
          <div
            className='p-4 space-y-4 overflow-y-auto scrollbar'
            style={{ height: 'calc(100% - 72px)' }}
          >
            <RecipientCard
              themeColor={theme === 'dark' ? '#9e9e9e' : '#696969'}
              rootERC20DenomsStore={rootERC20DenomsStore}
              rootCW20DenomsStore={rootCW20DenomsStore}
              chainTagsStore={chainTagsStore}
              chainFeatureFlagsStore={chainFeatureFlagsStore}
            />

            <AmountCard
              rootBalanceStore={rootBalanceStore}
              isAllAssetsLoading={isAllAssetsLoading}
              rootDenomsStore={rootDenomsStore}
              rootCW20DenomsStore={rootCW20DenomsStore}
              rootERC20DenomsStore={rootERC20DenomsStore}
              evmBalanceStore={evmBalanceStore}
              aptosCoinDataStore={aptosCoinDataStore}
            />

            <Memo />
            <ErrorWarning />
            <div className='h-[100px]' />

            <ReviewTransfer
              rootBalanceStore={rootBalanceStore}
              rootDenomsStore={rootDenomsStore}
              rootERC20DenomsStore={rootERC20DenomsStore}
            />
          </div>
        </SendContextProvider>

        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
        />
      </PopupLayout>
    </motion.div>
  )
}

Send.displayName = 'Send'

export default observer(Send)
