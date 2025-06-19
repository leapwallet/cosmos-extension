import { motion } from 'framer-motion'
import React, { forwardRef, useEffect, useRef, useState } from 'react'

const TabButton = forwardRef<
  HTMLButtonElement,
  { children: React.ReactNode; onClick: () => void; active?: boolean }
>((props, ref) => {
  return (
    <button
      ref={ref}
      className={'text-xs font-bold text-foreground py-2 px-4 rounded-full'}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
})

TabButton.displayName = 'TabButton'

const transition = { duration: 0.2, ease: 'easeInOut' }

export const TabSelectors = ({
  selectedIndex,
  buttons,
}: {
  selectedIndex: number
  buttons: {
    label: string
    onClick: () => void
  }[]
}) => {
  const [slider, setSlider] = useState({ left: 0, right: 0, width: 0, height: 0, hasValue: false })
  const containerRef = useRef<HTMLDivElement>(null)
  const childRefs = useRef(new Map())

  useEffect(() => {
    const target = childRefs.current.get(selectedIndex)
    const container = containerRef.current
    if (!target || !container) {
      return
    }

    const cRect = container.getBoundingClientRect()

    // when container is `display: none`, width === 0.
    // ignore this case
    if (cRect.width === 0) {
      return
    }

    const tRect = target.getBoundingClientRect()
    const left = tRect.left - cRect.left
    const right = cRect.right - tRect.right

    setSlider({
      hasValue: true,
      left: left,
      right: right,
      width: tRect.width - 1,
      height: tRect.height - 1,
    })
  }, [childRefs, selectedIndex])

  return (
    <div
      ref={containerRef}
      className='relative flex items-center bg-secondary-300 rounded-full p-px isolate'
    >
      {buttons.map((button, index) => (
        <TabButton
          ref={(ref) => childRefs.current.set(index, ref)}
          key={button.label}
          active={index === selectedIndex}
          onClick={button.onClick}
        >
          {button.label}
        </TabButton>
      ))}

      <motion.div
        className='absolute bg-secondary rounded-full -z-10'
        layoutId='tab-button-highlight'
        hidden={!slider.hasValue}
        initial={false}
        animate={slider}
        transition={transition}
      />
    </div>
  )
}

TabSelectors.displayName = 'TabSelectors'
