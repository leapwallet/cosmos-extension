import { HeaderActionType } from '@leapwallet/leap-ui'
import Text from 'components/text'
import React from 'react'

import BottomSheet from './bottom-sheet'

export default function InfoSheet({
  desc,
  heading,
  title,
  isVisible,
  setVisible,
}: {
  heading: string
  title: string
  desc: string
  isVisible: boolean
  setVisible: (v: boolean) => void
}) {
  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => setVisible(false)}
      headerTitle={title}
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='flex flex-col p-7 gap-y-1'>
        <Text size='sm' color='dark:text-gray-400 text-gray-600 font-bold'>
          {heading}
        </Text>
        <Text size='sm'>{desc}</Text>
      </div>
    </BottomSheet>
  )
}
