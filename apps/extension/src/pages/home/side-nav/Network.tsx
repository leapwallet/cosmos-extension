import { useChainId } from '@leapwallet/cosmos-wallet-hooks'
import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork, useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { sendMessageToTab } from 'utils'
import { cn } from 'utils/cn'

export default function NetworkDropUp({
  goBack,
  isVisible,
}: {
  isVisible: boolean
  goBack: () => void
}) {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const setNetwork = useSetNetwork()

  const navigate = useNavigate()
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
          if (chainInfos[activeChain]?.apis?.rpc) {
            setNetwork('mainnet')
            goBack()
            globalSheetsStore.setSideNavOpen(false)
            try {
              await sendMessageToTab({ event: 'chainChanged', data: mainnetEvmChainId })
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
            setNetwork('testnet')
            goBack()
            globalSheetsStore.setSideNavOpen(false)
            try {
              await sendMessageToTab({ event: 'chainChanged', data: testnetEvmChainId })
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
    <BottomModal
      isOpen={isVisible}
      onClose={goBack}
      title={'Network'}
      className='flex flex-col gap-3 !py-7 !px-5'
    >
      <div className='flex flex-col gap-2'>
        {chains.map((chain) => {
          const unavailable = !chain.enabled ? '(Unavailable)' : ''
          return (
            <button
              key={chain.title}
              onClick={chain.onClick}
              data-testing-id={chain.title === 'Testnet' ? 'network-testnet-option' : ''}
              className={cn(
                'flex items-center justify-between text-start w-full p-4 bg-secondary-100 transition-colors rounded-xl',
                chain.enabled
                  ? 'hover:bg-secondary-200'
                  : 'cursor-not-allowed text-muted-foreground',
              )}
            >
              <div className='flex flex-col gap-1 flex-1'>
                <span className='font-bold'>{`${chain.title} ${unavailable}`}</span>

                <span className='text-xs font-medium'>{chain.subTitle}</span>
              </div>

              {chain.isSelected && activeChain ? (
                <CheckCircle weight='fill' size={24} className='text-accent-foreground shrink-0' />
              ) : null}
            </button>
          )
        })}
      </div>
    </BottomModal>
  )
}
