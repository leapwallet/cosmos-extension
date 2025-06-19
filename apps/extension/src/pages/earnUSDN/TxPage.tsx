import { EARN_MODE, Token, useTxHandler } from '@leapwallet/cosmos-wallet-hooks'
import { CaretRight, X } from '@phosphor-icons/react'
import classNames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { rootBalanceStore } from 'stores/root-store'

const TxPage = observer(
  ({
    txHash,
    onClose,
    txType,
    sourceToken,
    destinationToken,
  }: {
    txHash: string
    onClose: () => void
    txType: EARN_MODE
    sourceToken?: Token
    destinationToken?: Token
  }) => {
    const navigate = useNavigate()
    const [txStatus, setTxStatus] = useState<'loading' | 'success' | 'failed'>('loading')
    const getWallet = Wallet.useGetWallet()
    const getTxHandler = useTxHandler({
      forceChain: 'noble',
    })

    const { title, subtitle, btnText } = useMemo(() => {
      if (txType === 'deposit') {
        if (txStatus === 'loading') {
          return {
            title: 'Deposit in-progress...',
            subtitle: '',
            btnText: 'View details',
          }
        } else if (txStatus === 'success') {
          return {
            title: 'Deposit successful!',
            subtitle: 'You will now earn rewards on your deposited USDC.',
            btnText: 'View details',
          }
        } else {
          return {
            title: 'Deposit failed',
            subtitle: '',
            btnText: 'Try Again',
          }
        }
      } else if (txType === 'withdraw') {
        if (txStatus === 'loading') {
          return {
            title: 'Withdrawal in-progress...',
            subtitle: 'Your tokens are being swapped back to USDC from USDN.',
            btnText: 'Done',
          }
        } else if (txStatus === 'success') {
          return {
            title: 'Withdrawal successful!',
            subtitle: '',
            btnText: 'Done',
          }
        } else {
          return { title: 'Withdraw failed', subtitle: '', btnText: 'Try Again' }
        }
      } else {
        if (txStatus === 'loading') {
          return {
            title: 'Claim in-progress...',
            subtitle: 'Your rewards are being claimed.',
            btnText: 'Done',
          }
        } else if (txStatus === 'success') {
          return {
            title: 'Tokens claimed!',
            subtitle: '',
            btnText: 'Done',
          }
        } else {
          return { title: 'Claim failed', subtitle: '', btnText: 'Try Again' }
        }
      }
    }, [txStatus, txType])

    const invalidateBalances = () => {
      rootBalanceStore.refetchBalances('noble')
    }

    useEffect(() => {
      async function pollForTx() {
        try {
          const wallets = await getWallet('noble')
          const txHandler = await getTxHandler(wallets)
          const res = await txHandler.pollForTx(txHash)
          if (res.code === 0) {
            setTxStatus('success')
            invalidateBalances()
          } else {
            setTxStatus('failed')
          }
        } catch (error) {
          //
        }
      }
      if (txHash) {
        pollForTx()
      }
    }, [txHash])

    return (
      <div className='relative h-full w-full'>
        <PopupLayout>
          <div className='flex justify-end p-6'>
            <X size={28} className='text-gray-600 p-1 cursor-pointer' onClick={onClose} />
          </div>
          <div className='flex flex-col gap-y-8 justify-center items-center px-8 mt-[75px]'>
            <div className='h-[100px] w-[100px]'>
              {txStatus === 'loading' && (
                <div className='h-[100px] w-[100px] p-8 rounded-full bg-gray-100 dark:bg-gray-850  animate-spin'>
                  <img src={Images.Swap.Rotate} />
                </div>
              )}
              {txStatus === 'success' && (
                <div className='h-[100px] w-[100px] p-8 rounded-full bg-green-400'>
                  <img src={Images.Swap.CheckGreen} />
                </div>
              )}
              {txStatus === 'failed' && (
                <div className='h-[100px] w-[100px] p-8 rounded-full bg-red-600 dark:bg-red-400'>
                  <img src={Images.Swap.FailedRed} />
                </div>
              )}
            </div>
            <div className='flex flex-col items-center gap-y-6'>
              <div className='flex flex-col items-center gap-y-3'>
                <Text size='xl' color='text-black-100 dark:text-white-100' className='font-bold'>
                  {title}
                </Text>
                <Text
                  size='sm'
                  color='text-gray-800 dark:text-gray-200'
                  className='font-normal text-center'
                >
                  {subtitle}
                </Text>
              </div>

              {txStatus !== 'loading' && (
                <div
                  className='flex gap-x-1 items-center cursor-pointer'
                  onClick={() => {
                    window.open('https://www.mintscan.io/noble/tx/' + txHash, '_blank')
                  }}
                >
                  <Text size='sm' color='text-green-600' className='font-medium'>
                    View transaction
                  </Text>
                  <CaretRight size={12} className='text-green-600' />
                </div>
              )}
            </div>
          </div>
          <div className=' flex flex-row items-center justify-between gap-4 absolute bottom-0 left-0 right-0 p-6 max-[350px]:!px-4 !z-[1000]'>
            <button
              className={classNames(
                'w-1/2 text-md font-bold text-black-100 h-12 rounded-full cursor-pointer bg-white-100 hover:bg-[#ccc]',
              )}
              onClick={() => navigate('/home')}
            >
              Home
            </button>
            <button
              className={classNames(
                'w-1/2 text-md font-bold text-white-100 h-12 rounded-full cursor-pointer bg-green-600 hover:bg-green-500',
              )}
              onClick={() => {
                if (txType === 'deposit') {
                  navigate('/assetDetails?assetName=uusdn&tokenChain=noble', {
                    replace: true,
                    state: JSON.parse(JSON.stringify(destinationToken)),
                  })
                } else if (txType === 'withdraw') {
                  navigate('/home', { replace: true })
                }
                onClose()
              }}
            >
              {btnText}
            </button>
          </div>
        </PopupLayout>
      </div>
    )
  },
)

export default TxPage
