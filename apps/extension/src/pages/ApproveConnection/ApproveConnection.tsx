import { Key } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { Header } from 'components/Header'
import Loader from 'components/loader/Loader'
import { SelectWallets } from 'components/SelectWallets'
import Text from 'components/text'
import { ACTIVE_WALLET, BG_RESPONSE, CONNECTIONS } from 'config/storage-keys'
import { checkChainConnections, decodeChainIdToChain } from 'extension-scripts/utils'
import { useWindowSize } from 'hooks/utility/useWindowSize'
import { Images } from 'images'
import React, { useCallback, useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import browser from 'webextension-polyfill'

import { addToConnections } from './utils'

type WebsiteProps = {
  name: string
}

type HeadingProps = {
  name: string
}

const Heading = ({ name }: HeadingProps) => {
  return (
    <div className='flex flex-col align-middle justify-center m-auto'>
      <Text size='lg' className='font-bold mt-3 mx-2 justify-center align-middle truncate'>
        {name}
      </Text>
      <Text size='md' className='justify-center align-middle mb-2' color='text-gray-200'>
        wants to connect to your wallet
      </Text>
    </div>
  )
}

const Website = ({ name }: WebsiteProps) => {
  return (
    <div className='flex flex-row align-middle justify-center m-auto'>
      <img src={Images.Misc.LockGreen} className='h-[14px] mr-2 m-auto' />
      <Text size='md' className='justify-center align-middle' color='text-green-500'>
        {name}
      </Text>
    </div>
  )
}

/**
 * @desc Call this function to notify the background script that the popup has been closed. So it can clean up the state.
 */
function closeWindow() {
  browser.runtime.sendMessage({ type: 'popup-closed' })
  setTimeout(() => {
    window.close()
  }, 50)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendMessage(message: { type: string; payload: any }) {
  try {
    await browser.runtime.sendMessage(message)
  } catch (e) {
    //
  }
}

const ApproveConnection = () => {
  const [selectedWallets, setSelectedWallets] = useState<[Key] | [] | Key[]>([])

  const { width } = useWindowSize()

  const [requestedChains, setRequestedChains] = useState<SupportedChain[]>([])

  const [showApprovalUi, setShowApprovalUi] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [approvalRequests, setApprovalRequests] = useState<Array<any>>([])

  const handleCancel = useCallback(async () => {
    const currentApprovalRequest = approvalRequests[0]
    if (!currentApprovalRequest) {
      closeWindow()
      return
    }

    const chainsIds = currentApprovalRequest?.validChainIds ?? [
      currentApprovalRequest?.[0]?.chainId,
    ]
    browser.runtime.sendMessage({
      type: 'chain-approval-rejected',
      chainsIds,
      payloadId: currentApprovalRequest.payloadId,
    })
    setApprovalRequests((prev) => prev.slice(1))
    if (approvalRequests.length === 1) {
      window.removeEventListener('beforeunload', handleCancel)
      closeWindow()
    }
  }, [approvalRequests])

  useEffect(() => {
    window.addEventListener('beforeunload', handleCancel)
    browser.storage.local.remove(BG_RESPONSE)
    return () => {
      window.removeEventListener('beforeunload', handleCancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function enableAccessEventHandler(
    message: {
      type: string
      payload: { origin: string; chainId?: string; validChainIds?: string[]; payloadId: string }
    },
    sender: any,
  ) {
    if (sender.id !== browser.runtime.id) return
    if (message.type === 'enable-access') {
      const storage = await browser.storage.local.get([CONNECTIONS, ACTIVE_WALLET])
      const connections = storage[CONNECTIONS] || []
      const storedActiveWallet = storage[ACTIVE_WALLET]
      const chainIds = message.payload.validChainIds ?? [message.payload.chainId ?? '']
      const { isNewChainPresent } = await checkChainConnections(
        chainIds,
        connections,
        { origin: message.payload.origin },
        storedActiveWallet,
      )

      if (isNewChainPresent) {
        setApprovalRequests((prev) => [...prev, message.payload])
        const _chainIdToChain = await decodeChainIdToChain()
        const chain = _chainIdToChain[chainIds[0]]
        setRequestedChains((prev) => [...prev, chain as unknown as SupportedChain])
        setShowApprovalUi(true)
      } else {
        await browser.runtime.sendMessage({
          type: 'chain-enabled',
          payload: { origin, chainsIds: chainIds, payloadId: message.payload.payloadId },
        })
        // closeWindow()
      }
    }
  }

  useEffect(() => {
    browser.runtime.sendMessage({ type: 'approval-popup-open' })
    browser.runtime.onMessage.addListener(enableAccessEventHandler)
    return () => {
      browser.runtime.onMessage.removeListener(enableAccessEventHandler)
    }
  }, [])

  const handleApproveConnection = async () => {
    const currentApprovalRequest = approvalRequests?.[0]
    const chainsIds: string[] | undefined = currentApprovalRequest
      ? currentApprovalRequest?.validChainIds ?? [currentApprovalRequest[0]?.chainId]
      : undefined
    if (!chainsIds) return

    await addToConnections(chainsIds, selectedWallets, currentApprovalRequest.origin)
    await sendMessage({
      type: 'chain-enabled',
      payload: { origin, chainsIds, payloadId: currentApprovalRequest.payloadId },
    })
    setApprovalRequests((prev) => prev.slice(1))
    setRequestedChains((prev) => prev.slice(1))
    if (approvalRequests.length === 1) {
      window.removeEventListener('beforeunload', handleCancel)
      closeWindow()
    }
  }

  const isFullScreen = width && width > 800

  if (!showApprovalUi) {
    return (
      <div className='relative w-screen max-w-3xl h-full self-center p-5 pt-0'>
        <div className='flex justify-center items-center h-[600px]'>
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className='relative w-screen max-w-3xl h-full self-center px-5 pt-5'>
      <div className='flex flex-col justify-center items-center mx-auto max-w-2xl box-border h-full'>
        <Header
          HeadingComponent={() => (
            <Heading name={approvalRequests?.[0]?.origin || 'Connect Leap'} />
          )}
          SubTitleComponent={() => <Website name={approvalRequests?.[0]?.origin} />}
        />
        <SelectWallets
          forceChain={requestedChains[0]}
          selectedWallets={selectedWallets}
          setSelectedWallets={setSelectedWallets}
        />

        <div
          className={`flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl px-4 py-5 mt-4 ${
            isFullScreen ? 'w-[716px]' : 'w-full'
          }`}
        >
          <Text size='xs' color='text-gray-300 mb-1'>
            This app will be able to
          </Text>
          <Text size='sm'>
            <img src={Images.Misc.GreenTick} className='h-[12px] mr-3 my-auto' />
            View your wallet balance and activity
          </Text>
          <Text size='sm'>
            <img src={Images.Misc.GreenTick} className='h-[12px] mr-3 my-auto' />
            Request approval for transactions.
          </Text>

          <div className='my-1 border-[0.05px] border-solid border-white-100 dark:border-gray-800 opacity-50' />

          <Text size='xs' color='text-gray-300 mb-1'>
            This app won&apos;t be able to
          </Text>
          <Text size='sm'>
            <img src={Images.Misc.GreyCross} className='h-[12px] mr-3 my-auto' />
            Move funds without your permission
          </Text>
        </div>

        <div
          className={`flex flex-row justify-between gap-2 ${
            isFullScreen ? 'w-[716px] mt-6' : 'w-full mt-auto -mb-3'
          }`}
        >
          <Buttons.Generic
            style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
            onClick={handleCancel}
          >
            Cancel
          </Buttons.Generic>
          <Buttons.Generic
            style={{ height: '48px', background: Colors.cosmosPrimary, color: Colors.white100 }}
            className='bg-gray-800'
            onClick={handleApproveConnection}
            disabled={selectedWallets.length <= 0}
          >
            Connect
          </Buttons.Generic>
        </div>
      </div>
    </div>
  )
}

export default ApproveConnection
