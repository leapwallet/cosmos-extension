import { Info } from '@phosphor-icons/react'
import Text from 'components/text'
import React from 'react'

export default function LedgerSupportComingSoon() {
  return (
    <div className='flex items-start gap-x-3 p-4 rounded-2xl bg-blue-200 dark:bg-blue-900'>
      <Info size={20} className='text-blue-600 dark:text-blue-400' />
      <Text size='xs' color='text-black-100 dark:text-white-100'>
        Ledger support for restaking will be introduced in the upcoming software upgrade, which is
        planned for release soon
      </Text>
    </div>
  )
}
