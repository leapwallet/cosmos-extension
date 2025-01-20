import { Buttons } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React, { useCallback } from 'react'
import { Sheet } from 'react-modal-sheet'
import { isSidePanel } from 'utils/isSidePanel'

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
   * custom class names for the main wrapper
   */
  wrapperClassName?: string
  /*
   * custom class names for the container
   */
  containerClassName?: string
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
   * custom secondary action button
   */
  secondaryActionButton?: React.ReactNode
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
  wrapperClassName,
  containerClassName,
  contentClassName,
  hideActionButton,
  secondaryActionButton,
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
      className={classNames(
        'panel-width enclosing-panel mx-auto !absolute panel-height',
        wrapperClassName,
      )}
    >
      <Sheet.Container
        className={classNames(
          'bg-gray-50 dark:bg-black-100 !rounded-t-2xl overflow-hidden',
          { 'max-panel-height': !isSidePanel() },
          containerClassName,
        )}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
        }}
      >
        <Sheet.Content className={classNames('bg-gray-50 dark:bg-black-100', contentClassName)}>
          <div className='relative flex items-center justify-center px-7 py-5 border-b border-b-gray-300 dark:border-b-gray-900'>
            {secondaryActionButton ? secondaryActionButton : null}
            {titleComponent ?? (
              <h3 className='text-[18px] font-semibold dark:text-gray-50 text-gray-900 h-[28px]'>
                {title}
              </h3>
            )}
            {hideActionButton
              ? null
              : actionButton ?? (
                  <div className='absolute top-[22px] right-7'>
                    {<Buttons.Cancel onClick={onActionButtonClick ?? handleCloseAction} />}
                  </div>
                )}
          </div>
          <div className={classNames('p-7 max-h-[calc(100%-112px)] overflow-auto', className)}>
            {children}
          </div>
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop
        className={classNames('!absolute !bg-[#0003] dark:!bg-[#fff3]', {
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
