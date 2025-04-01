import { Token } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { CaretDoubleRight } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { chainInfoStore } from 'stores/chain-infos-store'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

type SendToStakeModalProps = {
  isVisible: boolean
  onClose: () => void
  ibcDenom: Token
  nativeDenom: NativeDenom
}

const SendToStakeModal = observer(
  ({ isVisible, onClose, ibcDenom, nativeDenom }: SendToStakeModalProps) => {
    const defaultIconLogo = useDefaultTokenLogo()
    const chainInfos = chainInfoStore.chainInfos
    const nativeChainName = chainInfos[nativeDenom.chain as SupportedChain]
    const navigate = useNavigate()
    const { activeWallet } = useActiveWallet()

    const handleSendToStake = () => {
      const recipient = activeWallet?.addresses[nativeDenom.chain as SupportedChain]
      const url = `/send?assetCoinDenom=${ibcDenom.ibcDenom}&recipient=${recipient}`
      navigate(url)
    }

    if (!nativeChainName) return null

    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title={`Stake on ${nativeChainName.chainName}`}
        className='p-6'
      >
        <div className='flex flex-col gap-y-4 px-1'>
          <div className='flex rounded-xl dark:bg-gray-950 bg-gray-100 border dark:border-gray-850 border-gray-200 items-center justify-evenly px-5 py-6'>
            <div className='relative w-16 h-16 flex items-center justify-center'>
              <img
                src={ibcDenom.img}
                onError={imgOnError(defaultIconLogo)}
                className='w-12 h-12 rounded-full'
              />
              <img
                src={
                  ibcDenom.tokenBalanceOnChain
                    ? ChainInfos[ibcDenom.tokenBalanceOnChain as SupportedChain]
                        ?.chainSymbolImageUrl
                    : defaultIconLogo
                }
                className='w-6 h-6 absolute bottom-[3px] right-[3px] rounded-full bg-black-100 dark:bg-black-100'
              />
            </div>
            <CaretDoubleRight size={16} color={Colors.green600} />
            <div className='relative w-16 h-16 flex items-center justify-center'>
              <img
                src={ibcDenom.img}
                onError={imgOnError(defaultIconLogo)}
                className='w-12 h-12 rounded-full'
              />
              <img
                src={nativeChainName.chainSymbolImageUrl}
                onError={imgOnError(defaultIconLogo)}
                className='w-6 h-6 absolute bottom-[3px] right-[3px] rounded-full bg-black-100 dark:bg-black-100'
              />
            </div>
          </div>
          <div className='font-medium text-md text-gray-800 dark:text-gray-200'>
            Staking requires tokens to be on their native chains. Transfer your&nbsp;
            <span className='font-bold inline text-black-100 dark:text-white-100'>
              {ibcDenom.symbol}
            </span>
            &nbsp;to&nbsp;
            <span className='font-bold inline text-black-100 dark:text-white-100'>
              {nativeChainName.chainName}
            </span>{' '}
            to start staking.
          </div>
          <Buttons.Generic
            className='w-full'
            size='normal'
            color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
            onClick={handleSendToStake}
          >
            Send to&nbsp;{nativeChainName.chainName}
          </Buttons.Generic>
        </div>
      </BottomModal>
    )
  },
)

export default SendToStakeModal
