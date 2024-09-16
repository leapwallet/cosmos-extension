import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
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
import { evmBalanceStore } from 'stores/balance-store'
import { chainTagsStore } from 'stores/chain-infos-store'
import {
  rootCW20DenomsStore,
  rootDenomsStore,
  rootERC20DenomsStore,
} from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'

import { AmountCard } from './components/amount-card'
import ErrorWarning from './components/error-warning'
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
  //const { refetchBalances } = useGetTokenSpendableBalances()

  const [showChainSelector, setShowChainSelector] = useState<boolean>(false)
  const { headerChainImgSrc, topChainColor } = useChainPageInfo()

  //const [allAssets, setAllAssets] = useState<Token[]>([])

  const chainId = useQuery().get('chainId') ?? undefined
  const dontShowSelectChain = useDontShowSelectChain()

  // refetch balances
  // useEffect(() => {
  //   refetchBalances()
  //
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  useEffect(() => {
    if (chainId) {
      const chainKey = Object.values(chainInfos).find((chain) => chain.chainId === chainId)?.key
      chainKey && setActiveChain(chainKey)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, chainInfos])
  const isAllAssetsLoading = rootBalanceStore.loading

  return (
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
        {/*(activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY ? (
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
          )*/}
        <SendContextProvider
          activeChain={activeChain}
          rootDenomsStore={rootDenomsStore}
          rootCW20DenomsStore={rootCW20DenomsStore}
          rootERC20DenomsStore={rootERC20DenomsStore}
        >
          <div className='p-4 space-y-4 overflow-y-auto' style={{ height: 'calc(100% - 72px)' }}>
            <AmountCard
              rootBalanceStore={rootBalanceStore}
              isAllAssetsLoading={isAllAssetsLoading}
              rootDenomsStore={rootDenomsStore}
              rootCW20DenomsStore={rootCW20DenomsStore}
              rootERC20DenomsStore={rootERC20DenomsStore}
              evmBalanceStore={evmBalanceStore}
            />
            <RecipientCard themeColor={topChainColor} rootERC20DenomsStore={rootERC20DenomsStore} />
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

export default Send
