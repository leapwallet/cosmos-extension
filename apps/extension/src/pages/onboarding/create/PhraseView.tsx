import Text from 'components/text'
import { Images } from 'images'
import React, { ReactNode } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

type PhraseViewProps = {
  readonly children: ReactNode
  readonly heading: string
  readonly subHeading: string
}

export function PhraseView({ children, heading, subHeading }: PhraseViewProps) {
  return (
    <div className='flex flex-row gap-x-[20px]'>
      <div className='flex flex-col w-[408px] justify-center'>
        <div className='flex flex-wrap gap-x-[20px]'>
          <img src={Images.Misc.KeyDark} className='mb-[10px]' height={36} width={36} /> <br />
          <Text size='xxl' className='font-medium'>
            {heading}
          </Text>
        </div>
        <Text size='lg' color='text-gray-600 dark:text-gray-400' className='font-light mb-[32px]'>
          {subHeading}
        </Text>
        {children}
      </div>
      <div>
        <div className='shrink flex-col gap-y-[4px] w-[408px] p-[32px] rounded-lg border-[1px] border-gray-800'>
          <Text size='lg' className='font-medium'>
            {' '}
            What is a recovery phrase?
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-400 mb-[32px]'>
            {' '}
            Recovery phrase is a 12 or 24-word phrase that can be used to restore your wallet. The
            recovery phrase alone can give anyone full access to your wallet and the funds.
          </Text>

          <Text size='lg' className='font-medium'>
            {' '}
            What if I lose the recovery phrase?
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-400 mb-[32px]'>
            There is no way to get back your recovery phrase if you lose it. Make sure you store
            them at someplace safe which is accessible only to you.
          </Text>

          <Text size='lg' className='font-medium'>
            {' '}
            Precautions to follow:
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-400'>
            <ul>
              <li>Never share your recovery phrase with anyone or enter it in any form</li>
              <li>
                {isCompassWallet() ? 'Compass' : 'Leap'} support will never ask for your recovery
                phrase.
              </li>
            </ul>
          </Text>
        </div>
      </div>
    </div>
  )
}
