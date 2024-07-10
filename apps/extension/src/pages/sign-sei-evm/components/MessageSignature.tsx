import {
  useActiveChain,
  useActiveWallet,
  useChainInfo,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { personalSign, signTypedData } from '@leapwallet/cosmos-wallet-sdk'
import { EthWallet } from '@leapwallet/leap-keychain'
import { Avatar, Buttons, Header } from '@leapwallet/leap-ui'
import assert from 'assert'
import { ErrorCard } from 'components/ErrorCard'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { Tabs } from 'components/tabs'
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from 'config/constants'
import { MessageTypes } from 'config/message-types'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { TransactionStatus } from 'types/utility'
import { formatWalletName } from 'utils/formatWalletName'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { trim } from 'utils/strings'
import Browser from 'webextension-polyfill'

import { handleRejectClick } from '../utils'
import { SignTransactionProps } from './index'

const useGetWallet = Wallet.useGetWallet

export type MessageSignatureProps = {
  txnData: SignTransactionProps['txnData']
}

export function MessageSignature({ txnData }: MessageSignatureProps) {
  const chainInfo = useChainInfo()
  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain()

  assert(activeWallet !== null, 'activeWallet is null')
  const walletName = useMemo(() => {
    return formatWalletName(activeWallet.name)
  }, [activeWallet.name])

  const siteOrigin = txnData?.origin as string | undefined
  const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2)
  const siteLogo = useSiteLogo(siteOrigin)

  const getWallet = useGetWallet()
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle')
  const [signingError, setSigningError] = useState<string | null>(null)

  const handleSignClick = async () => {
    try {
      if (activeWallet.walletType === WALLETTYPE.LEDGER) {
        throw new Error(SEI_EVM_LEDGER_ERROR_MESSAGE)
      }

      setSigningError(null)
      setTxStatus('loading')

      const wallet = (await getWallet(activeChain, true)) as unknown as EthWallet
      let signature: string

      if (txnData.signTxnData.methodType === ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4) {
        signature = signTypedData(
          txnData.signTxnData.data,
          activeWallet.addresses[activeChain],
          wallet,
        )
      } else {
        signature = personalSign(
          txnData.signTxnData.data,
          activeWallet.addresses[activeChain],
          wallet,
        )
      }

      try {
        Browser.runtime.sendMessage({
          type: MessageTypes.signSeiEvmResponse,
          payload: { status: 'success', data: signature },
        })
      } catch {
        throw new Error('Could not send transaction to the dApp')
      }

      setTimeout(async () => {
        window.close()
      }, 1000)
    } catch (error) {
      setTxStatus('error')
      setSigningError((error as Error).message)
    }
  }

  const isApproveBtnDisabled = !!signingError || txStatus === 'loading'

  return (
    <div className='w-[400px] h-full relative self-center justify-self-center flex justify-center items-center mt-2'>
      <div className='relative w-[400px] overflow-clip rounded-md border border-gray-300 dark:border-gray-900'>
        <PopupLayout
          header={
            <div className='w-[396px]'>
              <Header
                imgSrc={chainInfo.chainSymbolImageUrl ?? GenericLight}
                title={
                  <Buttons.Wallet
                    brandLogo={
                      isCompassWallet() ? (
                        <img className='w-[24px] h-[24px] mr-1' src={Images.Logos.CompassCircle} />
                      ) : undefined
                    }
                    title={trim(walletName, 10)}
                    className='pr-4 cursor-default'
                  />
                }
              />
            </div>
          }
        >
          <div className='px-7 py-3 overflow-y-auto relative h-[450px]'>
            <h2 className='text-center text-lg font-bold dark:text-white-100 text-gray-900 w-full'>
              Signature request
            </h2>

            <p className='text-center text-sm dark:text-gray-300 text-gray-500 w-full'>
              Only sign this message if you fully understand the content and trust the requesting
              site
            </p>

            <div className='flex items-center mt-3 rounded-2xl dark:bg-gray-900 bg-white-100 p-4'>
              <Avatar
                avatarImage={siteLogo}
                avatarOnError={imgOnError(Images.Misc.Globe)}
                size='sm'
                className='rounded-full overflow-hidden'
              />
              <div className='ml-3'>
                <p className='capitalize text-gray-900 dark:text-white-100 text-base font-bold'>
                  {siteName}
                </p>
                <p className='lowercase text-gray-500 dark:text-gray-400 text-xs font-medium'>
                  {siteOrigin}
                </p>
              </div>
            </div>

            <Tabs
              className='mt-3'
              tabsList={[{ id: 'details', label: 'Details' }]}
              tabsContent={{
                details: (
                  <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl'>
                    {JSON.stringify(
                      txnData.signTxnData.details,
                      (_, value) => (typeof value === 'bigint' ? value.toString() : value),
                      2,
                    )}
                  </pre>
                ),
              }}
            />

            {signingError && txStatus === 'error' ? (
              <ErrorCard text={signingError} className='mt-3' />
            ) : null}
          </div>

          <div className='absolute bottom-0 left-0 py-3 px-7 dark:bg-black-100 bg-gray-50 w-full'>
            <div className='flex items-center justify-center w-full space-x-3'>
              <Buttons.Generic
                title='Reject Button'
                color={Colors.gray900}
                onClick={handleRejectClick}
                disabled={txStatus === 'loading'}
              >
                Reject
              </Buttons.Generic>

              <Buttons.Generic
                title='Approve Button'
                color={Colors.getChainColor(activeChain)}
                onClick={handleSignClick}
                disabled={isApproveBtnDisabled}
                className={`${isApproveBtnDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {txStatus === 'loading' ? <LoaderAnimation color='white' /> : 'Sign'}
              </Buttons.Generic>
            </div>
          </div>
        </PopupLayout>
      </div>
    </div>
  )
}
