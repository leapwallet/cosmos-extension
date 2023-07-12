import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import { ChainLogos } from 'images/logos'
import React, { ReactElement, useState } from 'react'
import { useNavigate } from 'react-router'

import BottomNav, { BottomNavLabel } from '~/components/bottom-nav'
import PopupLayout from '~/components/popup-layout'
import SelectChain from '~/components/select-chain'
import { useActiveChain } from '~/hooks/settings/use-active-chain'

import { SelectedAddress } from './types'
import SendSelectAddress from './widgets/send-select-address'
import SendToAddress from './widgets/send-to-address'

export type SendProps = {
  onCloseHandler?: () => void
}

export default function Send(): ReactElement {
  const navigate = useNavigate()
  const [showSendToAddress, setShowSendToAddress] = useState<boolean>(false)
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress>()
  const [showChainSelector, setShowChainSelector] = useState(false)
  const activeChain = useActiveChain()

  const onSelectAddress = (selected: SelectedAddress) => {
    setSelectedAddress(selected)
    setShowSendToAddress(true)
  }

  return (
    <div className='relative'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => {
                if (showSendToAddress) {
                  setShowSendToAddress(false)
                  setSelectedAddress(undefined)
                } else navigate(-1)
              },
              type: HeaderActionType.BACK,
            }}
            imgSrc={ChainLogos[activeChain ?? 'cosmos']}
            onImgClick={function noRefCheck() {
              setShowChainSelector(true)
            }}
            title={'Send to'}
            topColor={ChainInfos[activeChain].theme.primaryColor}
          />
        }
      >
        <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
        {showSendToAddress && (
          <SendToAddress
            onBack={() => {
              setShowSendToAddress(false)
              setSelectedAddress(undefined)
            }}
            selectedAddress={selectedAddress}
          />
        )}
        {!showSendToAddress && <SendSelectAddress onAddressSelect={onSelectAddress} />}
      </PopupLayout>
      <BottomNav label={BottomNavLabel.Home} />
    </div>
  )
}
