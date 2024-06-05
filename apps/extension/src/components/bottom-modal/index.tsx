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
   * custom title component
   */
  titleComponent?: React.ReactNode
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
   * custom class names for the container
   */
  containerClassName?: string
  /*
   * custom class names for the header
   */
  headerClassName?: string
  /*
   * custom class names for the content
   */
  contentClassName?: string
  /*
   * callback when the action button is clicked
   */
  onActionButtonClick?: () => void
  /*
   * should the action button be hidden
   */
  hideActionButton?: boolean
  /*
   * custom action button
   */
  actionButton?: React.ReactNode
  /*
   * should the secondary action button be shown
   */
  showSecondaryActionButton?: boolean
  /*
   * custom secondary action button
   */
  secondaryActionButton?: React.ReactNode
  /*
   * callback when the secondary action button is clicked
   */
  onSecondaryActionButtonClick?: () => void
}>

const BottomModal: React.FC<BottomModalProps> = ({
  isOpen,
  title,
  titleComponent,
  closeOnBackdropClick,
  onClose,
  children,
  className,
  disableClose,
  actionButton,
  onActionButtonClick,
  containerClassName,
  headerClassName,
  contentClassName,
  hideActionButton,
  showSecondaryActionButton,
  secondaryActionButton,
  onSecondaryActionButtonClick,
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
        className={classNames('bg-gray-50 dark:bg-black-100 !rounded-t-2xl', containerClassName)}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
      >
        <Sheet.Header
          className={classNames('bg-gray-50 dark:bg-black-100 rounded-t-2xl', headerClassName)}
        />
        <Sheet.Content className={classNames('bg-gray-50 dark:bg-black-100', contentClassName)}>
          <div className='relative flex items-center justify-center px-7 pb-4 border-b border-b-gray-300 dark:border-b-gray-900'>
            {hideActionButton
              ? null
              : actionButton ?? (
                  <div className='absolute top-1 left-7'>
                    {<Buttons.Cancel onClick={onActionButtonClick ?? handleCloseAction} />}
                  </div>
                )}
            {titleComponent ?? (
              <h3 className='text-xl font-semibold dark:text-gray-50 text-gray-900 h-[28px]'>
                {title}
              </h3>
            )}
            {showSecondaryActionButton === true
              ? secondaryActionButton ?? (
                  <div className='absolute top-1 right-7'>
                    <Buttons.Cancel onClick={onSecondaryActionButtonClick ?? handleCloseAction} />
                  </div>
                )
              : null}
          </div>
          <div className={classNames('p-7', className)}>{children}</div>
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop
        className={classNames('!absolute', {
          '!cursor-default': !closeOnBackdropClick,
          '!cursor-pointer': closeOnBackdropClick,
        })}
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
