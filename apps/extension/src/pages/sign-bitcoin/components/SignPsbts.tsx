/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useActiveChain,
  useActiveWallet,
  useAddress,
  useChainInfo,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { BtcTx } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { BtcWallet } from '@leapwallet/leap-keychain/dist/browser/key/btc-wallet'
import { Avatar, Buttons, Header } from '@leapwallet/leap-ui'
import { hex } from '@scure/base'
import { NETWORK, TEST_NETWORK } from '@scure/btc-signer'
import assert from 'assert'
import classNames from 'classnames'
import { ErrorCard } from 'components/ErrorCard'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { MessageTypes } from 'config/message-types'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'
import { TransactionStatus } from 'types/utility'
import { formatWalletName } from 'utils/formatWalletName'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { sliceAddress, trim } from 'utils/strings'
import Browser from 'webextension-polyfill'

import { handleRejectClick } from '../utils'
import { SignPsbt } from './SignPsbt'

const useGetWallet = Wallet.useGetWallet

type SignPsbtsProps = {
  txnData: Record<string, any>
  rootDenomsStore: RootDenomsStore
}

export const SignPsbts = observer(({ txnData, rootDenomsStore }: SignPsbtsProps) => {
  const getWallet = useGetWallet()
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const chainInfo = useChainInfo(activeChain)
  const activeWallet = useActiveWallet()

  assert(activeWallet !== null, 'activeWallet is null')
  const walletName = useMemo(() => {
    return formatWalletName(activeWallet.name)
  }, [activeWallet.name])

  const siteOrigin = txnData?.origin as string | undefined
  const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2)
  const siteLogo = useSiteLogo(siteOrigin)

  const details = useMemo(() => {
    return txnData.signTxnData.psbtsHexes.map((psbtHex: string) =>
      BtcTx.GetPsbtHexDetails(psbtHex, activeChain === 'bitcoinSignet' ? TEST_NETWORK : NETWORK),
    )
  }, [activeChain, txnData.signTxnData.psbtsHexes])

  const address = useAddress()
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle')
  const [signingError, setSigningError] = useState<string | null>(null)
  const [showDetailsForIdx, setShowDetailsForIdx] = useState<number | null>(null)

  const handleSignClick = async () => {
    try {
      if (activeWallet.walletType === WALLETTYPE.LEDGER) {
        throw new Error('Ledger transactions are not supported yet')
      }

      setSigningError(null)
      setTxStatus('loading')

      const wallet = (await getWallet(activeChain)) as unknown as BtcWallet
      const signedTxHexes: string[] = []

      for (const txDetails of details) {
        txDetails.inputs.forEach((_: any, index: number) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          wallet.signIdx(address, txDetails.tx, index)
        })

        for (let i = 0; i < txDetails.inputs.length; i++) {
          details.tx.finalizeIdx(i)
        }

        signedTxHexes.push(hex.encode(txDetails.tx.extract()))
      }

      setTxStatus('success')
      try {
        Browser.runtime.sendMessage({
          type: MessageTypes.signBitcoinResponse,
          payloadId: txnData?.payloadId,
          payload: { status: 'success', data: signedTxHexes },
        })
      } catch {
        throw new Error('Could not send transaction to the dApp')
      }

      if (isSidePanel()) {
        navigate('/home')
      } else {
        window.close()
      }
    } catch (error) {
      setTxStatus('error')
      setSigningError((error as Error).message)
    }
  }

  const isApproveBtnDisabled = !!signingError || txStatus === 'loading'

  return showDetailsForIdx !== null ? (
    <SignPsbt
      txnData={{
        ...txnData,
        signTxnData: { psbtHex: txnData.signTxnData.psbtsHexes[showDetailsForIdx] },
      }}
      rootDenomsStore={rootDenomsStore}
      isRedirected={true}
      handleBack={() => setShowDetailsForIdx(null)}
    />
  ) : (
    <div
      className={classNames(
        'panel-width enclosing-panel h-full relative self-center justify-self-center flex justify-center items-center',
        { 'mt-2': !isSidePanel() },
      )}
    >
      <div
        className={classNames(
          'relative w-full overflow-clip rounded-md border border-gray-300 dark:border-gray-900',
          { 'panel-height': isSidePanel() },
        )}
      >
        <PopupLayout
          header={
            <div className='w-[396px]'>
              <Header
                imgSrc={chainInfo.chainSymbolImageUrl ?? Images.Logos.GenericLight}
                title={
                  <Buttons.Wallet title={trim(walletName, 10)} className='pr-4 cursor-default' />
                }
              />
            </div>
          }
        >
          <div className='px-7 py-3 overflow-y-auto relative h-[450px]'>
            <h2 className='text-center text-lg font-bold dark:text-white-100 text-gray-900 w-full'>
              Sign Multiple Transactions
            </h2>

            <p className='text-center text-sm dark:text-gray-300 text-gray-500 w-full'>
              Only sign these transactions if you fully understand the content and trust the
              requesting site
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

            {txnData.signTxnData.psbtsHexes.length
              ? txnData.signTxnData.psbtsHexes.map((psbtHex: string, index: number) => {
                  return (
                    <div
                      key={`${psbtHex}--${index}`}
                      className='flex items-center justify-between gap-4 dark:bg-gray-900 bg-white-100 p-4 rounded-2xl mt-3'
                    >
                      <p className='flex flex-col text-gray-900 dark:text-white-100'>
                        <span className='font-semibold'>Transaction {index + 1}</span>
                        <span>{sliceAddress(psbtHex, 7)}</span>
                      </p>

                      <button
                        className='rounded-lg text-white-100 py-[4px] px-[12px] font-semibold'
                        style={{
                          backgroundColor: Colors.getChainColor(activeChain),
                        }}
                        onClick={() => setShowDetailsForIdx(index)}
                      >
                        View
                      </button>
                    </div>
                  )
                })
              : null}

            {signingError && txStatus === 'error' ? (
              <ErrorCard text={signingError} className='mt-3' />
            ) : null}
          </div>

          <div className='absolute bottom-0 left-0 py-3 px-7 dark:bg-black-100 bg-gray-50 w-full'>
            <div className='flex items-center justify-center w-full space-x-3'>
              <Buttons.Generic
                title='Reject Button'
                color={Colors.gray900}
                onClick={() => handleRejectClick(navigate, txnData?.payloadId)}
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
})
