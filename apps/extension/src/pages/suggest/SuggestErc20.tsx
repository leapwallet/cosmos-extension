import { useActiveChain, useSetBetaERC20Tokens } from '@leapwallet/cosmos-wallet-hooks'
import { LoaderAnimation } from 'components/loader/Loader'
import { BG_RESPONSE, SUGGEST_TOKEN } from 'config/storage-keys'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
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

function SuggestErc20({ handleRejectBtnClick }: ChildrenParams) {
  const defaultTokenLogo = useDefaultTokenLogo()
  const [isLoading, setIsLoading] = useState(false)
  const setBetaERC20Tokens = useSetBetaERC20Tokens()
  const activeChain = useActiveChain()
  const [contractInfo, setContractInfo] = useState({
    address: '',
    symbol: '',
    image: '',
    decimals: 0,
    coinGeckoId: '',
  })

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

    await setBetaERC20Tokens(contractInfo.address, erc20Token, activeChain)
    window.removeEventListener('beforeunload', handleRejectBtnClick)
    await Browser.storage.local.set({
      [BG_RESPONSE]: { data: 'Approved' },
    })

    setTimeout(async () => {
      await Browser.storage.local.remove([SUGGEST_TOKEN])
      await Browser.storage.local.remove(BG_RESPONSE)

      setIsLoading(false)
      window.close()
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
}

export default function SuggestErc20Wrapper() {
  return (
    <SuggestContainer suggestKey={SUGGEST_TOKEN}>
      {({ handleRejectBtnClick }) => <SuggestErc20 handleRejectBtnClick={handleRejectBtnClick} />}
    </SuggestContainer>
  )
}
