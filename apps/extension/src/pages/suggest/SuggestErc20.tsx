import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { LoaderAnimation } from 'components/loader/Loader'
import { BG_RESPONSE, SUGGEST_TOKEN } from 'config/storage-keys'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { betaERC20DenomsStore, enabledCW20DenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
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
  const defaultTokenLogo = useDefaultTokenLogo()
  const [isLoading, setIsLoading] = useState(false)
  const activeChain = useActiveChain()
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
    rootBalanceStore.loadBalances()

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
        <SubHeading text='This will allow this token to be viewed within Compass Wallet' />
        <TokenContractAddress
          address={contractInfo.address}
          img={
            <img
              src={contractInfo.image}
              onError={imgOnError(defaultTokenLogo)}
              className='rounded-full overflow-hidden mr-2 w-[36px] h-[36px] object-cover'
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
