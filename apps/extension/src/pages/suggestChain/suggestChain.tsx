/* eslint-disable @typescript-eslint/no-explicit-any */
import { Key as WalletKey } from '@leapwallet/cosmos-wallet-hooks'
import { sleep, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, GenericCard } from '@leapwallet/leap-ui'
import { chainInfosState } from 'atoms/chains'
import { Divider, Key, Value } from 'components/dapp'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { BG_RESPONSE, NEW_CHAIN_REQUEST } from 'config/storage-keys'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useEffect, useRef, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

import { addToConnections } from '../ApproveConnection/utils'

export default function SuggestChain() {
  const chainInfos = useChainInfos()
  const setChainInfos = useSetRecoilState(chainInfosState)
  const [isLoading, setIsLoading] = useState(false)

  const [newChain, setNewChain] = useState<any | null>(null)
  const siteName = newChain?.origin.replace('https://', '')

  const updateKeyStore = useUpdateKeyStore()
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const [showMore, setShowMore] = useState(false)

  const origin = useRef()
  const setActiveChain = useSetActiveChain()
  const defaultTokenLogo = useDefaultTokenLogo()

  const handleError = async (error: string) => {
    await browser.storage.local.set({ [BG_RESPONSE]: { error } })
    setTimeout(async () => {
      await browser.storage.local.remove([NEW_CHAIN_REQUEST])
      await browser.storage.local.remove(BG_RESPONSE)
      window.close()
    }, 10)
  }

  const handleCancel = async () => {
    await handleError('Rejected by the user.')
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleCancel)
    browser.storage.local.remove(BG_RESPONSE)
    return () => {
      window.removeEventListener('beforeunload', handleCancel)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    browser.storage.local.get([NEW_CHAIN_REQUEST]).then((res: any) => {
      const newChain = res[NEW_CHAIN_REQUEST]
      const chainName = newChain.chainInfo.chainName
      setChainInfos({ ...chainInfos, [chainName]: newChain.chainInfo })
      setNewChain(newChain)
      origin.current = newChain.origin
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const approveNewChain = async () => {
    await sleep(200)
    setIsLoading(true)
    const chainName = newChain.chainInfo.chainName
    try {
      const updatedKeystore = await updateKeyStore(
        activeWallet as WalletKey,
        chainName as unknown as SupportedChain,
      )
      if (activeWallet) {
        await addToConnections([newChain.chainInfo.chainId], [activeWallet], origin.current ?? '')
        await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey)
      }

      await setActiveChain(chainName)

      window.removeEventListener('beforeunload', handleCancel)
      await browser.storage.local.set({
        [BG_RESPONSE]: { data: 'Approved', success: 'Chain enabled' },
      })
      setTimeout(async () => {
        await browser.storage.local.remove(BG_RESPONSE)
        setIsLoading(false)
        window.close()
      }, 100)
    } catch (e) {
      handleError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='w-[400px] h-[600px] max-h-[600px]'>
        <div
          className='w-full h-1 rounded-t-2xl'
          style={{ backgroundColor: Colors.cosmosPrimary }}
        />
        <div className='relative h-full flex flex-col justify-between items-center pt-4 pb-10 px-7'>
          <div className='flex flex-col items-center'>
            <Text size='lg' className='font-bold mt-5'>
              Adding network
            </Text>

            <Text
              size='xs'
              className='font-bold text-center mt-[2px] max-w-[250px]'
              color='text-gray-800 dark:text-gray-600 mb-2'
            >
              This will allow this network to be used within{' '}
              {isCompassWallet() ? 'Compass' : 'Leap'} Wallet.
            </Text>

            <GenericCard
              title={
                <span className='text-[15px] truncate'>{newChain?.chainInfo?.chainName ?? ''}</span>
              }
              subtitle={siteName}
              className='py-8 my-5'
              img={
                <img
                  src={newChain?.chainInfo?.chainSymbolImageUrl ?? defaultTokenLogo}
                  className='h-10 w-10 mr-3'
                  onError={imgOnError(defaultTokenLogo)}
                />
              }
              size='sm'
              isRounded
            />

            <div className='flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl p-4 w-full'>
              <Key>Network Name</Key>
              <Value>{newChain?.chainInfo?.chainName ?? ''}</Value>
              {Divider}
              <Key>Network URL</Key>
              <Value>
                {newChain?.chainInfo?.apis?.rest || newChain?.chainInfo?.apis?.restTest || ''}
              </Value>
              {Divider}
              <Key>Chain ID</Key>
              <Value>{newChain?.chainInfo?.chainId ?? ''}</Value>
              {Divider}
              <Key>Currency Symbol</Key>
              <Value>{newChain?.chainInfo?.denom ?? ''}</Value>
              {showMore && (
                <>
                  {Divider}
                  <Key>Coin Type</Key>
                  <Value>{newChain?.chainInfo?.bip44.coinType ?? ''}</Value>
                  {Divider}
                  <Key>Address Prefix</Key>
                  <Value>{newChain?.chainInfo?.addressPrefix ?? ''}</Value>
                  {Divider}
                  <Key>Chain Registry Path</Key>
                  <Value>{newChain?.chainInfo?.chainRegistryPath ?? ''}</Value>
                </>
              )}
              <button
                className='text-sm font-bold text-gray-400 h-5 w-full text-left'
                style={{ color: '#726FDC' }}
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>

          <div className='w-full flex flex-col justify-center items-center box-border mt-4'>
            <div className='flex flex-row justify-between w-full'>
              <Buttons.Generic
                style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
                onClick={handleCancel}
              >
                Reject
              </Buttons.Generic>
              <Buttons.Generic
                style={{
                  height: '48px',
                  background: Colors.cosmosPrimary,
                  color: Colors.white100,
                }}
                className='ml-3 bg-gray-800'
                onClick={approveNewChain}
              >
                {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
              </Buttons.Generic>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
