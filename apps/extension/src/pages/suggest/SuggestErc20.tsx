import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { LoaderAnimation } from 'components/loader/Loader'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { BG_RESPONSE, SUGGEST_TOKEN } from 'config/storage-keys'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { betaERC20DenomsStore, enabledCW20DenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
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
  TokenContractAddress,
  TokenContractInfo,
} from './components'

const SuggestErc20 = observer(({ handleRejectBtnClick }: ChildrenParams) => {
  const [isLoading, setIsLoading] = useState(false)
  const _activeChain = useActiveChain()
  const [activeChain, setActiveChain] = useState<SupportedChain>(_activeChain)
  const [contractInfo, setContractInfo] = useState({
    address: '',
    symbol: '',
    image: '',
    decimals: 0,
    coinGeckoId: '',
  })

  const enabledCW20Tokens = enabledCW20DenomsStore.getEnabledCW20DenomsForChain(activeChain)
  const navigate = useNavigate()

  useEffect(() => {
    Browser.storage.local
      .get([SUGGEST_TOKEN])
      .then(async function initializeContractInfo(response) {
        const payload = response[SUGGEST_TOKEN]
        setContractInfo({
          ...payload.params.options,
        })
        if (payload?.activeChain) {
          setActiveChain(payload.activeChain)
        }
      })
  }, [])

  const handleApproveBtn = async () => {
    setIsLoading(true)
    const erc20Token = {
      coinDenom: contractInfo.symbol,
      coinMinimalDenom: contractInfo.address,
      coinDecimals: contractInfo.decimals,
      coinGeckoId: contractInfo.coinGeckoId ?? '',
      icon: contractInfo.image ?? '',
      chain: activeChain,
    }

    await betaERC20DenomsStore.setBetaERC20Denoms(contractInfo.address, erc20Token, activeChain)
    const _enabledCW20Tokens = [...enabledCW20Tokens, contractInfo.address]
    await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Tokens, activeChain)
    rootBalanceStore.refetchBalances(activeChain)

    window.removeEventListener('beforeunload', handleRejectBtnClick)
    await Browser.storage.local.set({
      [BG_RESPONSE]: { data: 'Approved' },
    })

    setTimeout(async () => {
      await Browser.storage.local.remove([SUGGEST_TOKEN])
      await Browser.storage.local.remove(BG_RESPONSE)

      setIsLoading(false)
      if (isSidePanel()) {
        navigate('/home')
      } else {
        window.close()
      }
    }, 50)
  }

  return (
    <>
      <div className='flex flex-col items-center'>
        <Heading text='Add Token' />
        <SubHeading
          text={`This will allow this token to be viewed within ${
            isCompassWallet() ? 'Compass' : 'Leap'
          } Wallet`}
        />
        <TokenContractAddress
          address={contractInfo.address}
          img={
            <TokenImageWithFallback
              assetImg={contractInfo.image}
              text={contractInfo.symbol}
              altText={contractInfo.symbol + ' logo'}
              imageClassName='w-[36px] h-[36px] rounded-full'
              containerClassName='w-[36px] h-[36px] rounded-full mr-2'
              textClassName='text-[10px] !leading-[14px]'
            />
          }
        />
        <TokenContractInfo
          name={contractInfo.symbol}
          symbol={contractInfo.symbol}
          decimals={contractInfo.decimals}
        />
      </div>

      <Footer>
        <FooterAction
          rejectBtnClick={handleRejectBtnClick}
          rejectBtnText='Reject'
          confirmBtnText={isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
          confirmBtnClick={handleApproveBtn}
          isConfirmBtnDisabled={isLoading}
        />
      </Footer>
    </>
  )
})

export default function SuggestErc20Wrapper() {
  return (
    <SuggestContainer suggestKey={SUGGEST_TOKEN}>
      {({ handleRejectBtnClick }) => <SuggestErc20 handleRejectBtnClick={handleRejectBtnClick} />}
    </SuggestContainer>
  )
}
