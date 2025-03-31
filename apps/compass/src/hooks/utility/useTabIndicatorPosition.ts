import { useEffect, useRef } from 'react'

export const useTabIndicatorPosition = <TNavItem extends { label: string }>(config: {
  navItems: TNavItem[]
  activeLabel: string
  widthScale?: number
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const childRefs = useRef<Map<number, HTMLElement | null>>(new Map())

  useEffect(() => {
    const idx = config.navItems.findIndex((item) => item.label === config.activeLabel) ?? 0
    const target = childRefs.current.get(idx)
    const container = containerRef.current

    if (!target || !container) return

    const cRect = container.getBoundingClientRect()
    if (cRect.width === 0) return

    const widthScale = config.widthScale ?? 1
    const translateXScale = (1 - widthScale) / 2

    const tRect = target.getBoundingClientRect()
    const buttonWidth = tRect.width
    const containerWidth = cRect.width
    const scaleX = (buttonWidth / containerWidth) * widthScale // 70% of button width
    const translateX = tRect.left - cRect.left + buttonWidth * translateXScale // Center the indicator

    indicatorRef.current?.style.setProperty(
      'transform',
      `translateX(${translateX}px) scaleX(${scaleX})`,
    )
  }, [containerRef, config.activeLabel, config.navItems, config.widthScale])

  return { containerRef, indicatorRef, childRefs }
}
