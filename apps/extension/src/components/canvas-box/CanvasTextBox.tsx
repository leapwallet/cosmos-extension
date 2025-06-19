import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { Images } from 'images'
import React, { ReactElement, useEffect, useRef } from 'react'

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  if (width < 2 * radius) radius = width / 2
  if (height < 2 * radius) radius = height / 2
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
  return ctx
}

export type CanvasTextBoxProps = {
  text: string
  size?: 'lg' | 'md' | 'sm'
  noSpace?: boolean
  className?: string
}

export type CanvasBoxProps = {
  text: string
  width: number
  height: number
  noSpace?: boolean
}

export const CanvasBox = ({ text, height, width, noSpace }: CanvasBoxProps): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const dpr = window.devicePixelRatio * 1.5
    const canvas = canvasRef.current
    const context = canvas && canvas.getContext('2d')
    if (canvas == null || context === null) return

    canvas.width = width * dpr
    canvas.height = height * dpr
    context.scale(dpr, dpr)
    const isDark = theme === ThemeName.DARK

    if (isDark) {
      context.fillStyle = '#2121210d'
    } else {
      context.fillStyle = '#ffffff'
    }
    context.fillRect(0, 0, width, height)

    let xPos = 24,
      yPos = 0
    let x = xPos,
      y = yPos

    /**
     * noSpace {true} for private key
     * noSpace {false} for mnemonic
     */
    if (noSpace) {
      const numberOfWords = Math.floor((width - 35) / 7)
      const res = []
      let currentStr = ''
      text.split('').forEach((char, idx) => {
        if ((idx + 1) % numberOfWords === 0) {
          res.push(currentStr)
          currentStr = ''
        }
        currentStr += char
      })

      if (currentStr.length > 0) {
        res.push(currentStr)
      }

      xPos = 10
      yPos = 20
      res.forEach((r) => {
        context.font = '700 13px Satoshi'
        if (isDark) {
          context.fillStyle = '#ffffff'
        } else {
          context.fillStyle = '#383838'
        }
        context.fillText(r, xPos, yPos)
        yPos += 20
      })
    } else {
      const splittedText = text.split(' ')
      const yLength = splittedText.length === 24 ? 8 : 4

      splittedText.forEach((word, idx) => {
        if (idx > 0 && idx % 3 === 0) {
          x = xPos
          y += height / yLength
        }
        const rectH = 26
        const rectW = 80
        const rectR = 13
        roundRect(context, x, y, rectW, rectH, rectR)

        context.font = '500 12px Satoshi'
        context.textAlign = 'start'
        context.fillStyle = '#9e9e9e'
        context.fillText(`${idx + 1}`, x - 8, y + rectH / 2 + 5)

        context.font = '500 14px Satoshi'
        context.textAlign = 'start'
        if (isDark) {
          context.fillStyle = '#ffffff'
        } else {
          context.fillStyle = '#383838'
        }
        context.fillText(`${word}`, x + 16, y + rectH / 2 + 5)
        x += width / 3
      })
    }
  }, [canvasRef, text, height, width, noSpace, theme])

  return <canvas style={{ height, width }} ref={canvasRef} />
}
const widthMap = {
  lg: 376,
  md: 344,
  sm: 304,
}

const widthClassMap = {
  lg: `w-[${widthMap.lg}px]`,
  md: `w-[${widthMap.md}px]`,
  sm: `w-[${widthMap.sm}px]`,
}

export default function CanvasTextBox({
  text,
  noSpace,
  size = 'lg',
}: CanvasTextBoxProps): ReactElement {
  const textLength = (text ?? '').split(' ').length

  return (
    <div
      className={classNames(
        'rounded-2xl bg-secondary-200 relative text-xs font-medium box-border max-[350px]:!px-1 group opacity-80 hover:opacity-100 transition-opacity duration-300',
        {
          'h-[184px]': textLength !== 24,
          'h-[328px]': textLength === 24,
        },
        widthClassMap[size],
        classNames,
      )}
    >
      <div className='flex flex-1 justify-center items-center h-full'>
        <CanvasBox
          height={textLength === 24 ? 288 : 144}
          width={widthMap[size] - 30}
          text={text}
          noSpace={noSpace}
        />
      </div>

      <div className='absolute inset-0 rounded-xl backdrop-blur-sm group-hover:backdrop-blur-none group-hover:opacity-0 w-full h-full transition-opacity duration-300'>
        <div className='absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-full text-center'>
          <img
            className='transform invert dark:invert-0 inline size-12'
            src={Images.Misc.VisibilityOffIcon}
            alt='visibility-off'
          />
          <span className='sr-only'>Hover here to view the phrase</span>
        </div>
      </div>
    </div>
  )
}
