import { Key, sliceAddress, useActiveWallet, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { LineType } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { ChainInfo, pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Check, X } from '@phosphor-icons/react/dist/ssr'
import Loader from 'components/loader/Loader'
import { Button } from 'components/ui/button'
import { ACTIVE_WALLET, BG_RESPONSE, CONNECTIONS } from 'config/storage-keys'
import { checkChainConnections, decodeChainIdToChain } from 'extension-scripts/utils'
import { useWalletInfo } from 'hooks'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { getWalletIconAtIndex } from 'images/misc'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

import { addToConnections } from './utils'
import WatchWalletPopup from './WatchWalletPopup'
import { ApproveConnectionWrapper } from './wrapper'

/**
 * @desc Call this function to notify the background script that the popup has been closed. So it can clean up the state.
 */
function closeWindow() {
  browser.runtime.sendMessage({ type: 'popup-closed' })
  setTimeout(() => {
    window.close()
  }, 50)
}

async function sendMessage(message: {
  type: string
  payload: unknown
  status: 'success' | 'failed'
}) {
  try {
    await browser.runtime.sendMessage(message)
  } catch (e) {
    //
  }
}

const chainAndPayload = { chain: 'seiTestnet2', payloadId: '123' } as const

const ApproveConnection = () => {
  const [selectedWallets, setSelectedWallets] = useState<[Key] | [] | Key[]>([])
  const navigate = useNavigate()

  const [requestedChains, setRequestedChains] = useState<
    { chain: SupportedChain; payloadId: string }[]
  >([])

  const [showApprovalUi, setShowApprovalUi] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [approvalRequests, setApprovalRequests] = useState<Array<any>>([])
  const activeWallet = useActiveWallet()
  const { walletName } = useWalletInfo()
  const { chains } = useChainsStore()
  const updateKeyStore = useUpdateKeyStore()
  const addressGenerationDone = useRef<boolean>(false)

  useEffect(() => {
    async function generateAddresses() {
      const wallet = selectedWallets[0]

      if (!wallet || addressGenerationDone.current) return

      const chainsToGenerateAddresses =
        [chainAndPayload]
          .filter((chain) => {
            const hasAddress = selectedWallets?.[0]?.addresses?.[chain.chain]
            const hasPubKey = selectedWallets?.[0]?.pubKeys?.[chain.chain]
            return (chains[chain.chain] && !hasAddress) || !hasPubKey
          })
          ?.map((chain) => chain.chain) ?? []

      if (!chainsToGenerateAddresses?.length) {
        return
      }

      const _chainInfos: Partial<Record<SupportedChain, ChainInfo>> = {}

      for await (const chain of chainsToGenerateAddresses) {
        _chainInfos[chain] = chains[chain]
      }
      const keyStore = await updateKeyStore(
        wallet,
        chainsToGenerateAddresses,
        'UPDATE',
        undefined,
        _chainInfos,
      )
      addressGenerationDone.current = true
      const newSelectedWallets = selectedWallets.map((wallet) => {
        if (!keyStore) return wallet
        const newWallet = keyStore[wallet.id]
        if (!newWallet) {
          return wallet
        }
        return newWallet
      })
      setSelectedWallets(newSelectedWallets)
    }

    generateAddresses()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallets])

  const handleCancel = useCallback(async () => {
    if (!approvalRequests[0]) {
      if (isSidePanel()) {
        navigate('/home')
      } else {
        closeWindow()
      }
      return
    }

    for (const currentApprovalRequest of approvalRequests) {
      const chainsIds = currentApprovalRequest?.validChainIds ?? [
        currentApprovalRequest?.[0]?.chainId,
      ]
      await sendMessage({
        type: 'chain-approval-rejected',
        payload: {
          origin,
          chainsIds,
          payloadId: currentApprovalRequest.payloadId,
          ecosystem: currentApprovalRequest.ecosystem,
        },
        status: 'failed',
      })
    }
    window.removeEventListener('beforeunload', handleCancel)
    if (isSidePanel()) {
      navigate('/home')
    } else {
      closeWindow()
    }
  }, [navigate, approvalRequests])

  useEffect(() => {
    if (activeWallet) {
      setSelectedWallets([activeWallet])
    }
  }, [activeWallet])

  useEffect(() => {
    window.addEventListener('beforeunload', handleCancel)
    browser.storage.local.remove(BG_RESPONSE)
    return () => {
      window.removeEventListener('beforeunload', handleCancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalRequests])

  async function enableAccessEventHandler(
    message: {
      type: string
      payload: {
        origin: string
        chainId?: string
        validChainIds?: string[]
        payloadId: string
        ecosystem: LineType
        ethMethod: string
        isLeap?: boolean
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        storedActiveWallet.id,
      )

      if (isNewChainPresent) {
        setApprovalRequests((prev) => [...prev, message.payload])
        const _chainIdToChain = await decodeChainIdToChain()
        setRequestedChains((prev) => [
          ...prev,
          ...chainIds.map((chainId) => {
            const chain = _chainIdToChain[chainId]
            return {
              chain: chain as unknown as SupportedChain,
              payloadId: message.payload.payloadId,
            }
          }),
        ])
        setShowApprovalUi(true)
      } else {
        await browser.runtime.sendMessage({
          type: 'chain-enabled',
          payload: {
            origin,
            chainsIds: chainIds,
            payloadId: message.payload.payloadId,
            ecosystem: message.payload.ecosystem,
            ethMethod: message.payload.ethMethod,
            isLeap: message.payload.isLeap,
          },
          status: 'success',
        })
        if (isSidePanel()) {
          navigate('/home')
        } else {
          closeWindow()
        }
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
    for await (const currentApprovalRequest of approvalRequests) {
      const chainsIds: string[] | undefined = currentApprovalRequest
        ? currentApprovalRequest?.validChainIds ?? [currentApprovalRequest[0]?.chainId]
        : undefined
      if (!chainsIds) return
      const selectedWalletIds = selectedWallets.map((wallet) => wallet.id)

      await addToConnections(chainsIds, selectedWalletIds, currentApprovalRequest.origin)
      await sendMessage({
        type: 'chain-enabled',
        payload: {
          origin,
          chainsIds,
          payloadId: currentApprovalRequest.payloadId,
          ecosystem: currentApprovalRequest.ecosystem,
          ethMethod: currentApprovalRequest.ethMethod,
          isLeap: currentApprovalRequest.isLeap,
        },
        status: 'success',
      })
    }
    window.removeEventListener('beforeunload', handleCancel)
    if (isSidePanel()) {
      navigate('/home')
    } else {
      closeWindow()
    }
  }

  usePerformanceMonitor({
    page: 'approve-connection',
    queryStatus: showApprovalUi ? 'success' : 'loading',
    op: 'approveConnectionPageLoad',
    description: 'Load time for approve connection page',
  })

  const originValue = approvalRequests?.[0]?.origin || 'Connect Compass'

  const address = useMemo(() => {
    const hasAddress = selectedWallets?.[0]?.addresses?.[chainAndPayload.chain]
    if (hasAddress) {
      return chains[chainAndPayload.chain]?.evmOnlyChain
        ? pubKeyToEvmAddressToShow(selectedWallets?.[0]?.pubKeys?.[chainAndPayload.chain])
        : selectedWallets?.[0]?.addresses?.[chainAndPayload.chain]
    }

    // If the address does not exist in keystore we generate addresses for cointype 60. For other chains it would be an empty string
    const evmosPubkey = selectedWallets?.[0]?.pubKeys?.['evmos']
    return pubKeyToEvmAddressToShow(evmosPubkey, true) || ''
  }, [chains, selectedWallets])

  if (activeWallet?.watchWallet) {
    return (
      <ApproveConnectionWrapper origin={originValue}>
        <WatchWalletPopup handleCancel={handleCancel} />
      </ApproveConnectionWrapper>
    )
  }

  if (!showApprovalUi) {
    return (
      <div className='panel-height enclosing-panel relative w-screen max-w-3xl h-full self-center p-5 pt-0'>
        <Loader />
      </div>
    )
  }

  return (
    <ApproveConnectionWrapper origin={originValue}>
      <div
        className={'flex items-center justify-between gap-4 bg-secondary-100 rounded-2xl py-5 px-4'}
      >
        <div className='flex flex-col gap-3'>
          <span className={'text-sm text-muted-foreground font-medium'}>
            Connecting {walletName}
          </span>
          <span className={'text-md font-bold'}>{sliceAddress(address)}</span>
        </div>

        <img src={getWalletIconAtIndex(1)} className='size-12' />
      </div>

      <div className='flex flex-col gap-4 rounded-xl p-5 bg-secondary-100 text-xs text-muted-foreground font-medium'>
        <span>This app will be able to</span>

        <span className='flex flex-col gap-3'>
          <span className='flex items-center gap-2'>
            <Check size={16} weight='bold' className='my-0.5 text-accent-blue' />
            View your wallet balance and activity
          </span>
          <span className='flex items-center gap-2'>
            <Check size={16} weight='bold' className='my-0.5 text-accent-blue' />
            Request approval for transactions.
          </span>
        </span>

        <div className='my-1 border-[0.05px] border-solid border-secondary-250 opacity-50' />

        <span className='text-xs text-muted-foreground font-medium'>
          This app won&apos;t be able to
        </span>
        <span className='flex items-center gap-2'>
          <X size={16} weight='bold' className='my-0.5 text-destructive-100' />
          Move funds without your permission
        </span>
      </div>

      <div className={`mt-auto flex bg-white-0 flex-row w-full [&>*]:flex-1 gap-4`}>
        <Button variant={'mono'} onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleApproveConnection} disabled={selectedWallets.length <= 0}>
          Connect
        </Button>
      </div>
    </ApproveConnectionWrapper>
  )
}

export default ApproveConnection
