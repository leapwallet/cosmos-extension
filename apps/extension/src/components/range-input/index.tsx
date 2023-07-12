import * as React from 'react'
import { getTrackBackground, Range } from 'react-range'

const STEP = 1
const MIN = 1
const MAX = 5

const RangeInput = ({
  initialValue,
  onChangeHandler,
  activeColor = '#FF958C',
}: {
  initialValue: number
  onChangeHandler: (value: number) => void
  activeColor?: string
}) => {
  const [values, setValues] = React.useState([initialValue])

  return (
    <div className='flex justify-center flex-wrap'>
      <Range
        values={values}
        step={STEP}
        min={MIN}
        max={MAX}
        onChange={(values) => {
          setValues(values)
          onChangeHandler(values[0])
        }}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            className='h-9 w-full'
          >
            <div
              ref={props.ref}
              style={{
                background: getTrackBackground({
                  values,
                  colors: [activeColor, '#D6D6D6'],
                  min: MIN,
                  max: MAX,
                }),
              }}
              className='h-3 w-full rounded-lg self-center cursor-pointer'
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            style={{
              backgroundColor: activeColor,
              height: '0',
              width: '0',
            }}
          >
            <div className='block min-w-7 p-[6px] absolute top-[-38px] translate-x-[-50%] font-bold text-xs dark:bg-white-100 bg-black-100 text-white-100 dark:text-black-100 rounded-lg'>
              {`${values[0]}%`}
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default RangeInput
