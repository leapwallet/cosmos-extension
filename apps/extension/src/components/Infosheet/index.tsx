import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import React from 'react'

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
  // eslint-disable-next-line no-unused-vars
  setVisible: (v: boolean) => void
}) {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => setVisible(false)}
      title={title}
      closeOnBackdropClick={true}
    >
      <Text size='sm' color='dark:text-gray-400 text-gray-600 font-bold'>
        {heading}
      </Text>
      <Text size='sm' className='mt-4'>
        {desc}
      </Text>
    </BottomModal>
  )
}
