import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import React from 'react'
import { Colors } from 'theme/colors'

import StepCard from './StepCard'
import { LEDGER_CONNECTION_STEP } from './types'

type ImportLedgerViewProps = {
  error: string
  retry: VoidFunction
  onNext: () => void
  onSkip?: () => void
  status: LEDGER_CONNECTION_STEP
  isEvmLedger: boolean
}

const LEDGER_USAGE_LINK =
  'https://www.notion.so/leapwallet/Connect-to-Leap-using-Ledger-870cfca4895e468e89b225bcf7792d39'

export default function ImportLedgerView({
  onNext,
  onSkip,
  status,
  isEvmLedger,
}: ImportLedgerViewProps) {
  const { theme } = useTheme()

  const title = isEvmLedger ? 'Connect EVM Ledger' : 'Connect Ledger'
  const subTitle = isEvmLedger ? (
    <>
      Connect your Ethereum app to import wallets selected
      <br />
      in the previous screen from chains like Evmos, Injective & Dymension
    </>
  ) : (
    'Connect your Ledger to your computer.'
  )
  const walletType = isEvmLedger ? 'Ethereum' : 'Cosmos'

  const stepsData = [
    {
      stepNo: 1,
      description:
        'Unlock your Ledger and connect it directly to your computer by a USB connection',
      suggestion: 'Try approving HID connection, make sure device is unlocked',
      status: ((): 'pending' | 'processing' | 'done' => {
        if (status < LEDGER_CONNECTION_STEP.step1) {
          return 'processing'
        } else {
          return 'done'
        }
      })(),
    },
    {
      stepNo: 2,
      description: `Open the ${walletType} app on your Ledger`,
      status: ((): 'pending' | 'processing' | 'done' => {
        if (status === LEDGER_CONNECTION_STEP.step1) {
          return 'processing'
        } else if (status === LEDGER_CONNECTION_STEP.step2) {
          return 'done'
        } else {
          return 'pending'
        }
      })(),
    },
  ]

  return (
    <div className='flex flex-col items-center pb-5'>
      <Text className='text-[28px] font-black mb-3'>{title}</Text>
      <Text
        size='md'
        color='text-gray-600 dark:text-gray-400'
        className='font-bold mb-[74px] text-center'
      >
        {subTitle}
      </Text>

      <div className='w-[592px] rounded-3xl bg-white-100 dark:bg-gray-900 p-8'>
        {stepsData.map((d, index) => (
          <StepCard
            key={index}
            stepNo={d.stepNo}
            description={d.description}
            suggestion={d.suggestion}
            status={d.status}
          />
        ))}

        <div className='flex gap-4 mb-4 mt-12'>
          {isEvmLedger && onSkip && (
            <Buttons.Generic
              color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray100}
              size='normal'
              className={'w-full'}
              onClick={onSkip}
              // disabled={status !== LEDGER_CONNECTION_STATUS.DONE}
            >
              <Text color='text-green-600'>Skip for now</Text>
            </Buttons.Generic>
          )}
          {status === LEDGER_CONNECTION_STEP.step2 ? (
            <div className='flex items-center justify-center w-full'>
              <LoaderAnimation color={Colors.white100} />
            </div>
          ) : (
            <Buttons.Generic
              color={Colors.green600}
              size='normal'
              className={'w-full'}
              onClick={onNext}
              disabled={status !== LEDGER_CONNECTION_STEP.step1}
            >
              Next
            </Buttons.Generic>
          )}
        </div>

        {isEvmLedger ? (
          <Text color='text-gray-400 dark:text-gray-600' className='font-medium justify-center'>
            You can add EVM based wallets later through wallet management.
          </Text>
        ) : (
          <Text color='text-gray-600 dark:text-gray-400' className='font-medium justify-center'>
            For more on using Ledger with Leap&nbsp;
            <a
              className='text-green-600 cursor-pointer'
              target='_blank'
              href={LEDGER_USAGE_LINK}
              rel='noreferrer'
            >
              click here.
            </a>
          </Text>
        )}
      </div>
    </div>
  )
}
