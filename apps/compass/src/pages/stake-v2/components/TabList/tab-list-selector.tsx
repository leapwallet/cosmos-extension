import { buttonRingClass } from 'components/ui/button'
import { useTabIndicatorPosition } from 'hooks/utility/useTabIndicatorPosition'
import React, { forwardRef } from 'react'
import { cn } from 'utils/cn'

const TabButton = forwardRef<
  HTMLButtonElement,
  { children: React.ReactNode; onClick: () => void; active?: boolean; className?: string }
>((props, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'text-sm font-medium text-foreground transition-colors capitalize pb-3.5 rounded-full',
        buttonRingClass,
        props.active ? 'text-accent-blue' : 'text-secondary-700 hover:text-foreground',
        props.className,
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
})

TabButton.displayName = 'TabButton'

type Tab = {
  label: string
  id?: string
}

const indicatorDefaultStyles = {
  transform: 'translateX(0px) scaleX(0.441654)',
}

export const TabSelectors = <T extends Tab>({
  setSelectedTab,
  selectedIndex,
  buttons,
  buttonClassName,
  className,
  indicatorDefaultScale,
}: {
  setSelectedTab: (tab: T) => void
  selectedIndex: number
  buttons: T[]
  buttonClassName?: string
  className?: string
  indicatorDefaultScale?: React.CSSProperties
}) => {
  const { containerRef, indicatorRef, childRefs } = useTabIndicatorPosition({
    navItems: buttons,
    activeLabel: buttons[selectedIndex]?.label,
  })

  return (
    <div ref={containerRef} className={cn('relative flex items-center isolate gap-7', className)}>
      {buttons.map((button, index) => (
        <TabButton
          ref={(ref) => childRefs.current.set(index, ref)}
          key={button.id ?? button.label}
          active={index === selectedIndex}
          onClick={() => setSelectedTab(button)}
          className={buttonClassName}
        >
          {button.label}
        </TabButton>
      ))}

      <div
        className='absolute bottom-0 h-0.5 origin-left scale-0 translate-x-3 transition-transform duration-200 w-full rounded-[50vmin/10vmin] z-10 bg-accent-blue'
        ref={indicatorRef}
        style={indicatorDefaultScale ?? indicatorDefaultStyles}
      />
    </div>
  )
}

TabSelectors.displayName = 'TabSelectors'
