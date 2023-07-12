import { Buttons } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React, { useCallback } from 'react'
import Sheet from 'react-modal-sheet'

type BottomModalProps = React.PropsWithChildren<{
  /*
   * is the modal open
   */
  isOpen: boolean
  /*
   * title of the modal
   */
  title: string
  /*
   * callback when the modal is closed
   */
  onClose?: () => void
  /*
   * should the modal close when backdrop is clicked
   */
  closeOnBackdropClick?: boolean
  /*
   * should the modal be prevented from closing
   */
  disableClose?: boolean
  /*
   * custom class names for the modal
   */
  className?: string
  /*
   * callback when the action button is clicked
   */
  onActionButtonClick?: () => void
  /*
   * should the action button be hidden
   */
  hideActionButton?: boolean
}>

const BottomModal: React.FC<BottomModalProps> = ({
  isOpen,
  title,
  closeOnBackdropClick,
  onClose,
  children,
  className,
  disableClose,
  onActionButtonClick,
  hideActionButton,
}) => {
  const container = document.getElementById('popup-layout')?.parentNode as HTMLElement

  const handleCloseAction = useCallback(() => {
    if (!disableClose) {
      onClose?.()
    }
  }, [disableClose, onClose])

  if (!container) {
    return null
  }

  return (
    <Sheet
      disableDrag={true}
      mountPoint={container}
      isOpen={isOpen}
      detent='content-height'
      onClose={handleCloseAction}
      className='w-[400px] h-[600px] mx-auto !absolute'
    >
      <Sheet.Container
        className='bg-gray-50 dark:bg-black-100 !rounded-t-2xl'
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
      >
        <Sheet.Header className='bg-gray-50 dark:bg-black-100 rounded-t-2xl' />
        <Sheet.Content className='bg-gray-50 dark:bg-black-100'>
          <div className='relative flex items-center justify-center px-7 pb-4 border-b border-b-gray-300 dark:border-b-gray-900'>
            {hideActionButton ? null : (
              <div className='absolute top-1 left-7'>
                <Buttons.Cancel onClick={onActionButtonClick ?? handleCloseAction} />
              </div>
            )}
            <h3 className='text-xl font-semibold dark:text-gray-50 text-gray-900'>{title}</h3>
          </div>
          <div className={classNames('p-7', className)}>{children}</div>
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop
        className='!absolute'
        onTap={() => {
          if (closeOnBackdropClick) {
            handleCloseAction()
          }
        }}
      />
    </Sheet>
  )
}

export default BottomModal
