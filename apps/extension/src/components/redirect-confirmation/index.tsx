import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import React, { Dispatch, SetStateAction } from 'react'

type RedirectionConfirmationProps = {
  isOpen: boolean
  onClose: () => void
  url: string
  setUrl: Dispatch<SetStateAction<string>>
}

const RedirectionConfirmation = ({ url, setUrl, onClose }: RedirectionConfirmationProps) => {
  return (
    <div className='flex flex-col w-full justify-start items-center gap-6'>
      <div className='w-12 h-12 bg-red-300 rounded-full flex flex-row justify-center items-center gap-0'>
        <span className='text-white-100 material-icons-round !leading-[24px] !text-xl'>
          warning
        </span>
      </div>
      <div className='flex flex-col w-full justify-start items-center gap-[12px]'>
        <div className='dark:text-gray-200 text-gray-800 text-sm !leading-[22.4px] font-medium text-center'>
          You will be redirected to an external site. Proceed only if you have verified the link.
        </div>
        <div className='text-red-300 text-md !leading-[24px] font-medium max-w-full break-words'>
          {url}
        </div>
      </div>

      <div className='flex flex-row justify-between w-full gap-6 items-center'>
        <button
          onClick={() => {
            onClose()
          }}
          className='w-full dark:bg-gray-800 bg-gray-200 h-[46px] rounded-full text-center dark:shadow-[0px_3px_0px_0px_#00000066] shadow-[0px_3px_0px_0px_#FFFFFF66] font-bold text-md !leading-[21.6px] dark:text-white-100 text-black-100'
        >
          Go Back
        </button>
        <button
          onClick={() => {
            window.open(url, '_blank', 'noopener noreferrer')
            setUrl('')
            onClose()
          }}
          className='w-full dark:bg-white-100 bg-black-100 h-[46px] rounded-full text-center dark:shadow-[0px_3px_0px_0px_#00000066] shadow-[0px_3px_0px_0px_#FFFFFF66] font-bold text-md !leading-[21.6px] text-white-100 dark:text-black-100'
        >
          Continue
        </button>
      </div>
    </div>
  )
}

const RedirectionConfirmationModal = ({
  isOpen,
  onClose,
  ...rest
}: RedirectionConfirmationProps) => {
  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title='Confirm Redirect'
      closeOnBackdropClick={true}
      hideActionButton={true}
      showSecondaryActionButton={true}
      containerClassName='!bg-white-100 dark:!bg-gray-950'
      headerClassName='!bg-white-100 dark:!bg-gray-950'
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
      secondaryActionButton={
        <div className='absolute top-1 right-6'>
          <Buttons.Cancel onClick={onClose} />
        </div>
      }
    >
      <RedirectionConfirmation isOpen={isOpen} onClose={onClose} {...rest} />
    </BottomModal>
  )
}

export default RedirectionConfirmationModal
