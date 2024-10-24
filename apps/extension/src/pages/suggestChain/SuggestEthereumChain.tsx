import { Key as WalletKey, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootStore } from '@leapwallet/cosmos-wallet-store'
import { GenericCard } from '@leapwallet/leap-ui'
import { chainInfosState } from 'atoms/chains'
import { Divider, Key, Value } from 'components/dapp'
import { LoaderAnimation } from 'components/loader/Loader'
import { BETA_CHAINS, BG_RESPONSE, NEW_CHAIN_REQUEST } from 'config/storage-keys'
import { useDefaultTokenLogo } from 'hooks'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { observer } from 'mobx-react-lite'
import { addToConnections } from 'pages/ApproveConnection/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { chainTagsStore } from 'stores/chain-infos-store'
import { rootStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

import {
  ChildrenParams,
  Footer,
  FooterAction,
  Heading,
  SubHeading,
  SuggestContainer,
} from './components'

type SuggestEthereumChainProps = ChildrenParams & {
  rootStore: RootStore
}

const SuggestEthereumChain = observer(
  ({ handleRejectBtnClick, handleError, rootStore, chainTagsStore }: SuggestEthereumChainProps) => {
    const navigate = useNavigate()

    const [chainInfo, setChainInfo] = useState<ChainInfo | undefined>(undefined)
    const [origin, setOrigin] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    const defaultTokenLogo = useDefaultTokenLogo()
    const updateKeyStore = useUpdateKeyStore()
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const setActiveChain = useSetActiveChain()

    const setChainInfos = useSetRecoilState(chainInfosState)
    const { setChains, chains } = useChainsStore()

    const siteName = useMemo(() => origin.replace('https://', ''), [origin])
    const chainKey = useMemo(() => chainInfo?.key || chainInfo?.chainName || '', [chainInfo])

    useEffect(() => {
      Browser.storage.local
        .get([NEW_CHAIN_REQUEST])
        .then(async function initializeChainInfo(response) {
          const { chainInfo, origin } = response[NEW_CHAIN_REQUEST].msg
          setChainInfo(chainInfo)
          setOrigin(origin)
        })
    }, [])

    const addBetaChainTags = useCallback(async () => {
      if (chainInfo?.chainId) {
        await chainTagsStore.setBetaChainTags(chainInfo.chainId, ['EVM'])
      }
      if (chainInfo?.testnetChainId) {
        await chainTagsStore.setBetaChainTags(chainInfo.testnetChainId, ['EVM'])
      }
      if (chainInfo?.evmChainId) {
        await chainTagsStore.setBetaChainTags(chainInfo.evmChainId, ['EVM'])
      }
      if (chainInfo?.evmChainIdTestnet) {
        await chainTagsStore.setBetaChainTags(chainInfo.evmChainIdTestnet, ['EVM'])
      }
    }, [chainInfo, chainTagsStore])

    const handleConfirmClick = async () => {
      setIsLoading(true)

      try {
        const updatedKeystore = await updateKeyStore(
          activeWallet as WalletKey,
          chainKey as SupportedChain,
          'UPDATE',
          chainInfo,
        )

        const storedBetaChains = await Browser.storage.local.get([BETA_CHAINS])
        const betaChains = JSON.parse(storedBetaChains[BETA_CHAINS] ?? '{}')
        const newBetaChains = { ...betaChains, [chainKey]: chainInfo }

        await Browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(newBetaChains) })
        await addBetaChainTags()
        await setActiveChain(chainKey as SupportedChain, chainInfo)

        if (activeWallet) {
          await addToConnections([chainInfo?.evmChainId || ''], [activeWallet.id], origin ?? '')
          await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey)
        }

        setChainInfos({ ...chains, [chainKey]: chainInfo })
        setChains({ ...chains, [chainKey]: chainInfo })
        rootStore.setChains({ ...chains, [chainKey]: chainInfo })
        rootStore.reloadAddresses()

        window.removeEventListener('beforeunload', handleRejectBtnClick)
        await Browser.storage.local.set({ [BG_RESPONSE]: { data: 'Approved' } })

        await Browser.storage.local.remove([NEW_CHAIN_REQUEST])
        await Browser.storage.local.remove(BG_RESPONSE)

        if (isSidePanel()) {
          navigate('/home')
        } else {
          window.close()
        }

        setIsLoading(false)
      } catch (_) {
        handleError('Failed to add network')
        setIsLoading(false)
      }
    }

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
            title={<span className='text-[15px] truncate'>{chainInfo?.chainName ?? ''}</span>}
            subtitle={siteName}
            className='py-8 my-5'
            img={
              <img
                src={chainInfo?.chainSymbolImageUrl ?? defaultTokenLogo}
                className='h-10 w-10 mr-3'
                onError={imgOnError(defaultTokenLogo)}
              />
            }
            size='sm'
            isRounded
          />

          <div className='flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl p-4 w-full'>
            <Key>Network Name</Key>
            <Value>{chainInfo?.chainName ?? ''}</Value>
            {Divider}

            <Key>Network URL</Key>
            <Value>{chainInfo?.apis?.evmJsonRpc || chainInfo?.apis?.evmJsonRpcTest || ''}</Value>
            {Divider}

            <Key>Chain ID</Key>
            <Value>{chainInfo?.evmChainId ?? ''}</Value>
            {Divider}

            <Key>Currency Symbol</Key>
            <Value>{chainInfo?.denom ?? ''}</Value>
          </div>
        </div>

        <Footer>
          <FooterAction
            rejectBtnClick={handleRejectBtnClick}
            rejectBtnText='Reject'
            confirmBtnText={isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
            confirmBtnClick={handleConfirmClick}
          />
        </Footer>
      </>
    )
  },
)

export default function SuggestEthereumChainWrapper() {
  return (
    <SuggestContainer chainTagsStore={chainTagsStore} suggestKey={NEW_CHAIN_REQUEST}>
      {({ handleRejectBtnClick, handleError, chainTagsStore }) => (
        <SuggestEthereumChain
          chainTagsStore={chainTagsStore}
          handleRejectBtnClick={handleRejectBtnClick}
          handleError={handleError}
          rootStore={rootStore}
        />
      )}
    </SuggestContainer>
  )
}
