import { getSeiEvmInfo, SeiEvmInfoEnum } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork, useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { sendMessageToTab } from 'utils'
import { isCompassWallet } from 'utils/isCompassWallet'

import Text from '../../../components/text'

export default function NetworkDropUp({
  onCloseHandler,
  isVisible,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()

  const navigate = useNavigate()
  const adjustedSetCurrentChainName = useSetNetwork()
  const currentChainName = useSelectedNetwork()

  const chains = useMemo(
    () => [
      {
        title: 'Mainnet',
        subTitle: 'Actual blockchain transactions happen here',
        isSelected: currentChainName === 'mainnet',
        enabled: !!chainInfos[activeChain]?.apis?.rpc,
        onClick: async () => {
          if (chainInfos[activeChain]?.apis?.rpc) {
            adjustedSetCurrentChainName('mainnet')
            navigate('/', { replace: true })

            try {
              if (isCompassWallet()) {
                const chainId = await getSeiEvmInfo({
                  activeChain: 'seiTestnet2',
                  activeNetwork: 'mainnet',
                  infoType: SeiEvmInfoEnum.EVM_CHAIN_ID,
                })
                await sendMessageToTab({ event: 'chainChanged', data: chainId })
              }
            } catch (_) {
              //
            }
          }
        },
      },
      {
        title: 'Testnet',
        subTitle: 'Used as a testing service and has no actual value',
        isSelected: currentChainName === 'testnet',
        enabled: !!chainInfos[activeChain]?.apis?.rpcTest,
        onClick: async () => {
          if (chainInfos[activeChain]?.apis?.rpcTest) {
            adjustedSetCurrentChainName('testnet')
            navigate('/', { replace: true })

            try {
              if (isCompassWallet()) {
                const chainId = await getSeiEvmInfo({
                  activeChain: 'seiTestnet2',
                  activeNetwork: 'testnet',
                  infoType: SeiEvmInfoEnum.EVM_CHAIN_ID,
                })
                await sendMessageToTab({ event: 'chainChanged', data: chainId })
              }
            } catch (_) {
              //
            }
          }
        },
      },
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain, currentChainName],
  )

  return (
    <BottomModal isOpen={isVisible} onClose={onCloseHandler} title={'Network'}>
      <div className='overflow-hidden rounded-2xl'>
        {chains.map((chain, index) => {
          const unavailable = !chain.enabled ? '(Unavailable)' : ''
          return (
            <React.Fragment key={chain.title}>
              {index !== 0 && <CardDivider />}
              <GenericCard
                data-testing-id={chain.title === 'Testnet' ? 'network-testnet-option' : ''}
                title={
                  <Text
                    size='md'
                    className='w-[400px]'
                    color={chain.enabled ? undefined : 'dark:text-gray-400 text-gray-300'}
                  >{`${chain.title} ${unavailable}`}</Text>
                }
                subtitle={
                  <Text
                    size='xs'
                    color={chain.enabled ? undefined : 'dark:text-gray-400 text-gray-300'}
                  >
                    {chain.subTitle}
                  </Text>
                }
                onClick={chain.onClick}
                size='md'
                icon={
                  chain.isSelected && activeChain ? (
                    <span
                      className='material-icons-round'
                      style={{
                        color: Colors.getChainColor(activeChain),
                      }}
                    >
                      check_circle
                    </span>
                  ) : (
                    <></>
                  )
                }
              />
            </React.Fragment>
          )
        })}
      </div>
    </BottomModal>
  )
}
