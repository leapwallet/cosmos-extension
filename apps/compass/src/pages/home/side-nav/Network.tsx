import { useChainId } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork, useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useMemo } from 'react'
import { sendMessageToTab } from 'utils'

import Text from '../../../components/text'

export default function NetworkDropUpView({
  onCloseHandler,
  isVisible,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const setNetwork = useSetNetwork()

  const currentChainName = useSelectedNetwork()
  const mainnetEvmChainId = useChainId(activeChain, 'mainnet', true)
  const testnetEvmChainId = useChainId(activeChain, 'testnet', true)

  const chains = useMemo(
    () => [
      {
        title: 'Mainnet',
        subTitle: 'Actual blockchain transactions happen here',
        isSelected: currentChainName === 'mainnet',
        enabled: !!chainInfos[activeChain]?.apis?.rpc,
        onClick: async () => {
          if (!chainInfos[activeChain]?.apis?.rpc) {
            return
          }

          setNetwork('mainnet')
          onCloseHandler()
          await sendMessageToTab({ event: 'chainChanged', data: mainnetEvmChainId }).catch(
            () => void 0,
          )
        },
      },
      {
        title: 'Testnet',
        subTitle: 'Used as a testing service and has no actual value',
        isSelected: currentChainName === 'testnet',
        enabled: !!chainInfos[activeChain]?.apis?.rpcTest,
        onClick: async () => {
          if (!chainInfos[activeChain]?.apis?.rpcTest) {
            return
          }

          setNetwork('testnet')
          onCloseHandler()
          await sendMessageToTab({ event: 'chainChanged', data: testnetEvmChainId }).catch(
            () => void 0,
          )
        },
      },
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain, currentChainName],
  )

  return (
    <BottomModal isOpen={isVisible} onClose={onCloseHandler} title={'Network'}>
      {chains.map((chain, index) => {
        const unavailable = !chain.enabled ? '(Unavailable)' : ''
        return (
          <React.Fragment key={chain.title}>
            {index !== 0 && <CardDivider />}
            <GenericCard
              className='w-full'
              data-testing-id={chain.title === 'Testnet' ? 'network-testnet-option' : ''}
              title={
                <Text
                  size='md'
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
                  <CheckCircle weight='fill' size={24} className='text-primary' />
                ) : null
              }
            />
          </React.Fragment>
        )
      })}
    </BottomModal>
  )
}
