import { isDeliverTxSuccess } from '@cosmjs/stargate'
import {
  sliceAddress,
  useInvalidateDelegations,
  useInvalidateTokenBalances,
  usePendingTxState,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { STAKE_MODE } from '@leapwallet/cosmos-wallet-hooks'
import { sliceWord } from '@leapwallet/cosmos-wallet-hooks/dist/utils/strings'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import { Buttons, GenericCard, Header, ThemeName, useTheme } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'

export type StakeTxnPageState = {
  validator: Validator
  mode: STAKE_MODE | 'CLAIM_AND_DELEGATE'
}

type TransactionStatusTexts = {
  loading: string
  success: string
  failed: string
}

type TransactionTypes = {
  [key in STAKE_MODE | 'CLAIM_AND_DELEGATE']: TransactionStatusTexts
}

const txStatusStyles = {
  loading: {
    title: 'In Progress...',
  },
  success: {
    title: 'Complete',
  },
  failed: {
    title: 'Failed',
  },
}

const txStatusText: TransactionTypes = {
  CLAIM_REWARDS: {
    loading: 'claiming rewards',
    success: 'claimed successfully',
    failed: 'failed claiming',
  },
  DELEGATE: {
    loading: 'staking',
    success: 'staked successfully',
    failed: 'failed staking',
  },
  UNDELEGATE: {
    loading: 'unstaking',
    success: 'unstaked successfully',
    failed: 'failed unstaking',
  },
  CANCEL_UNDELEGATION: {
    loading: 'cancelling unstake',
    success: 'unstake cancelled successfully',
    failed: 'failed cancelling unstake',
  },
  REDELEGATE: {
    loading: 'switching validator',
    success: 'validator switched successfully',
    failed: 'failed switching validator',
  },
  CLAIM_AND_DELEGATE: {
    loading: 'claiming and staking rewards',
    success: 'claimed and staked successfully',
    failed: 'failed claiming and staking',
  },
}

export default function StakeTxnPage() {
  const { validator, mode } = useLocation().state as StakeTxnPageState
  const { pendingTx, setPendingTx } = usePendingTxState()
  const navigate = useNavigate()
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const [txHash, setTxHash] = useState<string | undefined>('')
  const [amount, setAmount] = useState<string | number | undefined>('')
  const [copied, setCopied] = useState(false)
  const selectedNetwork = useSelectedNetwork()
  const { data: imageUrl } = useValidatorImage(validator)
  const invalidateBalances = useInvalidateTokenBalances()
  const invalidateDelegations = useInvalidateDelegations()
  const { refetchDelegatorRewards } = useStaking()
  const { theme } = useTheme()
  useEffect(() => {
    setTxHash(pendingTx?.txHash)
  }, [pendingTx?.txHash])

  useEffect(() => {
    if (pendingTx && pendingTx.promise) {
      pendingTx.promise
        .then(
          (result) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (result && isDeliverTxSuccess(result)) {
              setPendingTx({ ...pendingTx, txStatus: 'success' })
            } else {
              setPendingTx({ ...pendingTx, txStatus: 'failed' })
            }
          },
          () => setPendingTx({ ...pendingTx, txStatus: 'failed' }),
        )
        .catch(() => {
          setPendingTx({ ...pendingTx, txStatus: 'failed' })
        })
        .finally(() => {
          invalidateBalances(activeChain)
          invalidateDelegations()
          refetchDelegatorRewards()
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const txnUrl = useMemo(() => {
    const txExplorer = chainInfos[activeChain].txExplorer

    if (!txExplorer?.[selectedNetwork]?.txUrl || !txHash) {
      return ''
    }

    return `${txExplorer?.[selectedNetwork]?.txUrl}/${txHash}`
  }, [chainInfos, activeChain, selectedNetwork, txHash])

  useEffect(() => {
    const _amount =
      mode === 'CLAIM_REWARDS' || mode === 'UNDELEGATE'
        ? pendingTx?.receivedUsdValue
        : pendingTx?.sentUsdValue
    setAmount(_amount)
  }, [mode, pendingTx?.receivedUsdValue, pendingTx?.sentUsdValue])

  const handleCopyClick = () => {
    UserClipboard.copyText(txHash ?? '')
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <PopupLayout>
      <Header title={`Transaction ${txStatusStyles[pendingTx?.txStatus ?? 'loading'].title}`} />
      <div className='flex flex-col justify-between p-6' style={{ height: 'calc(100% - 72px)' }}>
        <div className='flex flex-col gap-y-4'>
          <div className='bg-white-100 dark:bg-gray-950 rounded-2xl w-full flex flex-col gap-y-2 items-center p-4'>
            <div className='flex items-center justify-center h-[100px] w-[100px]'>
              {pendingTx?.txStatus === 'loading' && (
                <LoaderAnimation color='#29a874' className='w-full h-full' />
              )}
              {pendingTx?.txStatus === 'success' && (
                <img src={Images.Activity.TxSwapSuccess} width={75} height={75} />
              )}
              {pendingTx?.txStatus === 'failed' && (
                <img src={Images.Activity.TxSwapFailure} width={75} height={75} />
              )}
            </div>

            <div className='flex flex-col gap-y-1 items-center'>
              <Text size='lg' className='font-bold' color='text-black-100 dark:text-white-100'>
                {amount}
              </Text>
              <Text
                size='sm'
                color='text-black-100 dark:text-white-100'
                className='font-medium text-center'
              >
                {txStatusText[mode][pendingTx?.txStatus ?? 'loading']}
              </Text>
            </div>
            <div className='flex items-center pr-3 pl-2 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900 gap-x-1.5'>
              <img
                className='rounded-full'
                width={20}
                height={20}
                src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
                onError={imgOnError(GenericLight)}
              />
              <span className='text-sm font-bold text-black-100 dark:text-white-100 text-center'>
                {sliceWord(validator.moniker, 30, 0)}
              </span>
            </div>
          </div>
          {txHash && (
            <GenericCard
              isRounded
              title={
                <Text
                  size='sm'
                  color='text-black-100 dark:text-white-100'
                  className='font-bold mb-1'
                >
                  Transaction ID
                </Text>
              }
              subtitle={
                <Text size='md' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                  {sliceAddress(txHash)}
                </Text>
              }
              className='py-4 px-6 bg-white-100 dark:bg-gray-950'
              size='md'
              icon={
                <div className='flex gap-x-3 items-center'>
                  {copied ? (
                    <img src={Images.Misc.CheckGreen} width={36} height={36} />
                  ) : (
                    <span
                      className='material-icons-round text-black-100 dark:text-white-100 p-2 rounded-full bg-gray-50 dark:bg-gray-900 !text-lg'
                      onClick={handleCopyClick}
                    >
                      content_copy
                    </span>
                  )}

                  {txnUrl && (
                    <span
                      className='material-icons-round text-black-100 dark:text-white-100 p-2 rounded-full bg-gray-50 dark:bg-gray-900 !text-lg'
                      onClick={(event) => {
                        event.stopPropagation()
                        window.open(txnUrl, '_blank')
                      }}
                    >
                      open_in_new
                    </span>
                  )}
                </div>
              }
            />
          )}
        </div>

        <div className='flex gap-x-4'>
          <Buttons.Generic
            onClick={() => navigate('/home')}
            size='normal'
            color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray200}
            className='mt-auto w-full'
          >
            <Text color='dark:text-white-100 text-black-100'>Home</Text>
          </Buttons.Generic>
          <Buttons.Generic
            onClick={() => {
              if (mode === 'DELEGATE') {
                navigate(-1)
              } else {
                navigate(`/stake?pageSource=${PageName.StakeTxnPage}`)
              }
            }}
            color={
              pendingTx?.txStatus === 'failed' || mode === 'DELEGATE'
                ? Colors.green600
                : theme === ThemeName.DARK
                ? Colors.white100
                : Colors.black100
            }
            size='normal'
            className='mt-auto w-full'
            disabled={pendingTx?.txStatus === 'loading'}
          >
            <Text
              color={`${
                pendingTx?.txStatus === 'failed' || mode === 'DELEGATE'
                  ? 'text-white-100 dark:text-white-100'
                  : 'text-white-100 dark:text-black-100'
              }`}
            >
              {pendingTx?.txStatus === 'failed'
                ? 'Retry'
                : mode === 'DELEGATE'
                ? 'Stake Again'
                : 'Done'}
            </Text>
          </Buttons.Generic>
        </div>
      </div>
    </PopupLayout>
  )
}
