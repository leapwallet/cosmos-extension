'use client'

import * as React from 'react'
import { cn } from 'utils/cn'
import { Drawer as DrawerPrimitive } from 'vaul'

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
  shouldScaleBackground?: boolean
  container?: HTMLElement
}

const Drawer = ({ shouldScaleBackground = false, container, ...props }: DrawerProps) => {
  const containerEl =
    container ?? (document.getElementById('popup-layout')?.parentNode as HTMLElement)

  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      container={containerEl}
      handleOnly={true}
      {...props}
    />
  )
}
Drawer.displayName = 'Drawer'

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

type DrawerOverlayProps = React.ComponentProps<typeof DrawerPrimitive.Overlay> & {
  className?: string
}

const DrawerOverlay = React.forwardRef<React.ElementRef<'div'>, DrawerOverlayProps>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn('absolute inset-0 z-50 bg-background/90', className)}
      {...props}
    />
  ),
)
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content> & {
  className?: string
  overlayClassName?: string
  showHandle?: boolean
}

const DrawerContent = React.forwardRef<React.ElementRef<'div'>, DrawerContentProps>(
  ({ className, children, showHandle = true, overlayClassName, ...props }, ref) => (
    <DrawerPortal>
      <DrawerOverlay className={overlayClassName} />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          'overflow-hidden rounded-t-3xl absolute inset-x-0 bottom-0 z-50 flex h-auto flex-col outline-none border-none ring-0',
          className,
        )}
        {...props}
        /**
         * Added below to avoid the console warnings in vaul 1.1.2:
         * https://github.com/unovue/vaul-vue/issues/79
         */
        aria-describedby={undefined}
      >
        {showHandle && (
          <DrawerPrimitive.Handle className='mx-auto !mt-1 !bg-transparent !h-auto !opacity-100 [&>span]:h-1 [&>span]:!relative [&>span]:!inset-auto [&>span]:!transform-none [&>span]:!w-12 [&>span]:rounded-full [&>span]:bg-secondary-600 [&>span]:block hover:[&>span]:bg-secondary-800 [&>span]:!transition-colors [&>span]:!cursor-pointer' />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  ),
)
DrawerContent.displayName = 'DrawerContent'

type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
}

const DrawerHeader = ({ className, ...props }: DrawerHeaderProps) => (
  <div
    className={cn('grid gap-1.5 py-[6px] px-3 text-center sm:text-left', className)}
    {...props}
  />
)
DrawerHeader.displayName = 'DrawerHeader'

type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
}

const DrawerFooter = ({ className, ...props }: DrawerFooterProps) => (
  <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
)
DrawerFooter.displayName = 'DrawerFooter'

type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title> & {
  className?: string
}

const DrawerTitle = React.forwardRef<React.ElementRef<'h3'>, DrawerTitleProps>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
)
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

type DrawerDescriptionProps = React.ComponentProps<typeof DrawerPrimitive.Description> & {
  className?: string
}

const DrawerDescription = React.forwardRef<React.ElementRef<'p'>, DrawerDescriptionProps>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  ),
)
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
