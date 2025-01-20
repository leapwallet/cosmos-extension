import { Key, sliceAddress, useActiveWallet, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { LineType } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { ChainInfo, pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { CaretUp } from '@phosphor-icons/react'
import classNames from 'classnames'
import { Divider } from 'components/dapp'
import { Header } from 'components/header'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { ACTIVE_WALLET, BG_RESPONSE, CONNECTIONS } from 'config/storage-keys'
import { checkChainConnections, decodeChainIdToChain } from 'extension-scripts/utils'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useWindowSize } from 'hooks/utility/useWindowSize'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
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
      <Text
        size='md'
        className='justify-center align-middle mb-2'
        color='text-gray-800 dark:text-gray-200'
      >
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
async function sendMessage(message: { type: string; payload: any; status: 'success' | 'failed' }) {
  try {
    await browser.runtime.sendMessage(message)
  } catch (e) {
    //
  }
}

type DisplayRequestChains =
  | {
      type: 'address'
      address: string
      chains: { chain: SupportedChain; payloadId: string }[]
    }
  | {
      type: 'chains'
      address: undefined
      chains: { chain: SupportedChain; payloadId: string }[]
    }

const ApproveConnection = () => {
  const [selectedWallets, setSelectedWallets] = useState<[Key] | [] | Key[]>([])
  const navigate = useNavigate()
  const { width } = useWindowSize()

  const [requestedChains, setRequestedChains] = useState<
    Array<{ chain: SupportedChain; payloadId: string }>
  >([])

  const [readMoreEnabled, setReadMoreEnabled] = useState(false)

  const [showApprovalUi, setShowApprovalUi] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [approvalRequests, setApprovalRequests] = useState<Array<any>>([])
  const activeWallet = useActiveWallet()
  const { chains } = useChainsStore()
  const defaultTokenLogo = useDefaultTokenLogo()
  const updateKeyStore = useUpdateKeyStore()
  const addressGenerationDone = useRef<boolean>(false)

  const displayedRequestedChains: DisplayRequestChains = useMemo(() => {
    if (isCompassWallet()) {
      return {
        type: 'chains',
        chains: [{ chain: 'seiTestnet2' as SupportedChain, payloadId: '123' }],
      }
    }

    const isMoveConnection = requestedChains.every((chain) =>
      ['movement', 'movementBardock', 'aptos'].includes(chain.chain),
    )
    if (isMoveConnection) {
      return {
        type: 'address',
        chains: requestedChains,
        address: selectedWallets?.[0]?.addresses?.[requestedChains[0]?.chain] || '',
      }
    }

    const isEvmConnection = requestedChains.every((chain) => chains[chain.chain]?.evmOnlyChain)
    if (isEvmConnection && selectedWallets?.[0]?.pubKeys) {
      const address = pubKeyToEvmAddressToShow(
        selectedWallets[0].pubKeys[requestedChains[0]?.chain] || selectedWallets[0].pubKeys.evmos,
      )

      return {
        type: 'address',
        chains: requestedChains,
        address,
      }
    }

    const uniqueChainRequests = requestedChains.reduce(
      (acc: Array<{ chain: SupportedChain; payloadId: string }>, element) => {
        const existingRequest = acc.find((request) => request.chain === element.chain)
        if (!existingRequest) {
          acc.push(element)
          return acc
        }
        return acc
      },
      [],
    )
    return {
      type: 'chains',
      chains: uniqueChainRequests,
    }
  }, [chains, requestedChains, selectedWallets])

  useEffect(() => {
    async function generateAddresses() {
      const wallet = selectedWallets[0]
      if (!wallet || !displayedRequestedChains?.chains || addressGenerationDone.current) return

      const chainsToGenerateAddresses =
        displayedRequestedChains.chains
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
  }, [displayedRequestedChains, selectedWallets])

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

  const isFullScreen = width && width > 800

  if (!showApprovalUi) {
    return (
      <div className='panel-height enclosing-panel relative w-screen max-w-3xl h-full self-center p-5 pt-0'>
        <div className='flex justify-center items-center panel-height'>
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className='relative w-screen max-w-3xl h-full self-center px-5 enclosing-panel'>
      <div className='flex flex-col mx-auto max-w-2xl box-border h-full overflow-scroll pt-5 pb-[72px]'>
        <Header
          HeadingComponent={() => (
            <Heading name={approvalRequests?.[0]?.origin || 'Connect Leap'} />
          )}
          SubTitleComponent={() => <Website name={approvalRequests?.[0]?.origin} />}
        />
        <div
          className={classNames('bg-white-100 dark:bg-gray-900 rounded-2xl py-4', {
            'h-[405px]': readMoreEnabled,
            'h-[230px]':
              !readMoreEnabled &&
              displayedRequestedChains.type === 'chains' &&
              displayedRequestedChains.chains &&
              displayedRequestedChains.chains.length > 1,
            'h-[100px]':
              displayedRequestedChains.type === 'chains' &&
              displayedRequestedChains.chains &&
              displayedRequestedChains.chains.length <= 1,
          })}
        >
          <div
            className={classNames(
              'flex items-center px-5',
              displayedRequestedChains.type == 'chains' ? 'mb-4' : 'mb-0',
              { 'cursor-pointer': readMoreEnabled },
            )}
            onClick={() => setReadMoreEnabled(false)}
          >
            <div className='flex items-center'>
              <img src={Images.Misc.WalletIconTeal} className='h-[20px] w-[20px] mr-3' />
              <Text size='md' className='text-black-100 dark:text-white-100 font-bold'>
                {`${displayedRequestedChains.type === 'chains' ? 'Connecting' : ''}${
                  activeWallet?.name
                }`}
              </Text>
              {displayedRequestedChains.type === 'chains' &&
                displayedRequestedChains.chains &&
                displayedRequestedChains.chains.length > 1 &&
                readMoreEnabled && <CaretUp size={16} className='ml-auto text-gray-500' />}
            </div>

            {displayedRequestedChains.type === 'address' ? (
              <Text
                className='ml-auto font-bold'
                size='sm'
                color='text-black-100 dark:text-white-100'
              >
                {sliceAddress(displayedRequestedChains.address)}
              </Text>
            ) : null}
          </div>

          {displayedRequestedChains.type === 'chains' && (
            <>
              <div
                className={classNames('flex flex-col overflow-auto', {
                  'h-[340px] mb-2': readMoreEnabled,
                  'h-[120px] mb-2': !readMoreEnabled && requestedChains.length > 2,
                  'h-[70px] mb-2': !readMoreEnabled && requestedChains.length === 2,
                  'h-[16px] mb-4': requestedChains.length <= 1,
                })}
              >
                {displayedRequestedChains.chains.map((requestedChain, index: number) => {
                  const isLast = index === displayedRequestedChains.chains.length - 1
                  const hasAddress = selectedWallets?.[0]?.addresses?.[requestedChain.chain]
                  let address
                  if (hasAddress) {
                    address = chains[requestedChain.chain]?.evmOnlyChain
                      ? pubKeyToEvmAddressToShow(
                          selectedWallets?.[0]?.pubKeys?.[requestedChain.chain],
                        )
                      : selectedWallets?.[0]?.addresses?.[requestedChain.chain]
                  } else {
                    // If the address does not exist in keystore we generate addresses for cointype 60. For other chains it would be an empty string
                    const evmosPubkey = selectedWallets?.[0]?.pubKeys?.['evmos']
                    const canGenerateEvmAddress =
                      chains[requestedChain.chain]?.evmOnlyChain && evmosPubkey
                    address = canGenerateEvmAddress ? pubKeyToEvmAddressToShow(evmosPubkey) : ''
                  }

                  return (
                    <React.Fragment key={requestedChain.payloadId}>
                      <div
                        className={classNames('flex items-center px-5', {
                          'py-2.5': displayedRequestedChains.chains.length > 1,
                        })}
                        style={{
                          display: index <= 2 || readMoreEnabled ? 'flex' : 'none',
                        }}
                      >
                        <img
                          src={
                            chains[requestedChain.chain]?.chainSymbolImageUrl ?? defaultTokenLogo
                          }
                          className='h-[16px] w-[16px] mr-2'
                        />
                        <Text size='xs' color='text-gray-400'>
                          {chains[requestedChain.chain]?.chainName ?? ''}
                        </Text>
                        <Text className='ml-auto' size='xs' color='text-gray-400'>
                          {sliceAddress(address)}
                        </Text>
                      </div>
                      <div
                        className='px-5'
                        style={{
                          display: index <= 1 || readMoreEnabled ? 'block' : 'none',
                        }}
                      >
                        {!isLast ? Divider : null}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>

              {!readMoreEnabled && displayedRequestedChains.chains.length > 3 && (
                <button onClick={() => setReadMoreEnabled(true)} className='flex w-full px-5'>
                  <Text size='xs' color='text-osmosisPrimary' className='ml-auto'>{`view more (${
                    displayedRequestedChains.chains.length - 3
                  })`}</Text>
                </button>
              )}
            </>
          )}
        </div>

        {!readMoreEnabled ? (
          <div className='flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl px-4 py-5 mt-4'>
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
        ) : null}

        <div
          className={`fixed bottom-0 left-0 px-5 py-3 flex bg-white-0 dark:bg-black-100 flex-row w-full ${
            isFullScreen ? 'justify-center gap-4' : 'justify-between gap-2'
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
