/* eslint-disable @typescript-eslint/no-explicit-any */
import { Key as WalletKey, useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { sleep, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { GenericCard } from '@leapwallet/leap-ui'
import { Divider, Key, Value } from 'components/dapp'
import { LoaderAnimation } from 'components/loader/Loader'
import { BETA_CHAINS, BG_RESPONSE, NEW_CHAIN_REQUEST } from 'config/storage-keys'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useChainInfos, useSetChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { chainTagsStore } from 'stores/chain-infos-store'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

import { addToConnections } from '../ApproveConnection/utils'
import {
  ChildrenParams,
  Footer,
  FooterAction,
  Heading,
  SubHeading,
  SuggestContainer,
} from './components'

const SuggestChain = observer(
  ({ handleError, handleRejectBtnClick, chainTagsStore }: ChildrenParams) => {
    const navigate = useNavigate()
    const chainInfos = useChainInfos()
    const customChains = useCustomChains()
    const setChainInfos = useSetChainInfos()
    const [isLoading, setIsLoading] = useState(false)

    const [newChain, setNewChain] = useState<any | null>(null)
    const siteName = newChain?.origin.replace('https://', '')

    const updateKeyStore = useUpdateKeyStore()
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const [showMore, setShowMore] = useState(false)

    const origin = useRef()
    const setActiveChain = useSetActiveChain()
    const defaultTokenLogo = useDefaultTokenLogo()

    const chainRegistryPath = useMemo(() => {
      if (!newChain) return null
      return (
        customChains.filter((chain) => chain.chainId === newChain.chainInfo?.chainId)?.[0]
          ?.chainRegistryPath || newChain.chainInfo?.chainRegistryPath
      )
    }, [customChains, newChain])

    useEffect(() => {
      browser.storage.local.get([NEW_CHAIN_REQUEST]).then((res: any) => {
        const newChain = res[NEW_CHAIN_REQUEST]
        setChainInfos({ ...chainInfos, [chainRegistryPath]: newChain.chainInfo })
        setNewChain(newChain)
        origin.current = newChain.origin
      })

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const addBetaChainTags = useCallback(async () => {
      if (newChain?.chainInfo?.chainId) {
        await chainTagsStore.setBetaChainTags(newChain.chainInfo.chainId, ['Cosmos'])
      }
      if (newChain?.chainInfo?.testnetChainId) {
        await chainTagsStore.setBetaChainTags(newChain.chainInfo.testnetChainId, ['Cosmos'])
      }
      if (newChain?.chainInfo?.evmChainId) {
        await chainTagsStore.setBetaChainTags(newChain.chainInfo.evmChainId, ['Cosmos'])
      }
      if (newChain?.chainInfo?.evmChainIdTestnet) {
        await chainTagsStore.setBetaChainTags(newChain.chainInfo.evmChainIdTestnet, ['Cosmos'])
      }
    }, [newChain, chainTagsStore])

    const approveNewChain = async () => {
      await sleep(200)
      setIsLoading(true)
      try {
        const updatedKeystore = await updateKeyStore(
          activeWallet as WalletKey,
          chainRegistryPath as unknown as SupportedChain,
          'UPDATE',
          newChain.chainInfo,
        )

        const storedBetaChains = await browser.storage.local.get([BETA_CHAINS])
        const betaChains = JSON.parse(storedBetaChains[BETA_CHAINS] ?? '{}')
        const newBetaChains = { ...betaChains, [chainRegistryPath]: newChain.chainInfo }

        await browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(newBetaChains) })
        await addBetaChainTags()

        if (activeWallet) {
          await addToConnections(
            [newChain.chainInfo.chainId],
            [activeWallet.id],
            origin.current ?? '',
          )
          await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey)
        }

        await setActiveChain(chainRegistryPath)

        window.removeEventListener('beforeunload', handleRejectBtnClick)
        await browser.storage.local.set({
          [BG_RESPONSE]: { data: 'Approved', success: 'Chain enabled' },
        })
        setTimeout(async () => {
          await browser.storage.local.remove(BG_RESPONSE)
          setIsLoading(false)
          if (isSidePanel()) {
            navigate('/home')
          } else {
            setTimeout(async () => {
              //await browser.storage.local.remove(SIGN_REQUEST)
              window.close()
            }, 10)
          }
        }, 100)
      } catch (e) {
        handleError('Something went wrong. Please try again.')
        setIsLoading(false)
      }
    }

    usePerformanceMonitor({
      page: 'suggest-chain',
      queryStatus: newChain ? 'loading' : 'success',
      op: 'suggestedChainLoad',
      description: 'loading state on suggested chain approval',
    })

    return (
      <>
        <div className='flex flex-col items-center'>
          <Heading text='Add Network' />
          <SubHeading
            text={`This will allow this network to be used within ${
              isCompassWallet() ? 'Compass' : 'Leap'
            } Wallet.`}
          />

          <GenericCard
            title={
              <span className='text-[15px] truncate'>{newChain?.chainInfo?.chainName ?? ''}</span>
            }
            subtitle={siteName}
            className='py-8 my-5'
            img={
              <img
                src={newChain?.chainInfo?.chainSymbolImageUrl ?? defaultTokenLogo}
                className='h-10 w-10 mr-3'
                onError={imgOnError(defaultTokenLogo)}
              />
            }
            size='sm'
            isRounded
          />

          <div className='flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl p-4 w-full'>
            <Key>Network Name</Key>
            <Value>{newChain?.chainInfo?.chainName ?? ''}</Value>
            {Divider}
            <Key>Network URL</Key>
            <Value>
              {newChain?.chainInfo?.apis?.rest || newChain?.chainInfo?.apis?.restTest || ''}
            </Value>
            {Divider}
            <Key>Chain ID</Key>
            <Value>{newChain?.chainInfo?.chainId ?? ''}</Value>
            {Divider}
            <Key>Currency Symbol</Key>
            <Value>{newChain?.chainInfo?.denom ?? ''}</Value>
            {showMore && (
              <>
                {Divider}
                <Key>Coin Type</Key>
                <Value>{newChain?.chainInfo?.bip44.coinType ?? ''}</Value>
                {Divider}
                <Key>Address Prefix</Key>
                <Value>{newChain?.chainInfo?.addressPrefix ?? ''}</Value>
                {Divider}
                <Key>Chain Registry Path</Key>
                <Value>{newChain?.chainInfo?.chainRegistryPath ?? ''}</Value>
              </>
            )}
            <button
              className='text-sm font-bold text-gray-400 h-5 w-full text-left'
              style={{ color: '#726FDC' }}
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'Show less' : 'Show more'}
            </button>
          </div>
        </div>

        <Footer>
          <FooterAction
            rejectBtnClick={handleRejectBtnClick}
            rejectBtnText='Reject'
            confirmBtnText={isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
            confirmBtnClick={approveNewChain}
          />
        </Footer>
      </>
    )
  },
)

export default function SuggestChainWrapper() {
  return (
    <SuggestContainer suggestKey={NEW_CHAIN_REQUEST} chainTagsStore={chainTagsStore}>
      {({ handleError, handleRejectBtnClick, chainTagsStore }) => (
        <SuggestChain
          handleError={handleError}
          handleRejectBtnClick={handleRejectBtnClick}
          chainTagsStore={chainTagsStore}
        />
      )}
    </SuggestContainer>
  )
}
