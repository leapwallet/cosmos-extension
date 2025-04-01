import { Images } from 'images'
import React from 'react'

type ArrowHeaderProps = {
  activeIndex: number
  setActiveIndex: (index: number) => void
  limit: number
}

export function ArrowHeader({ activeIndex, setActiveIndex, limit }: ArrowHeaderProps) {
  const handlePrevClick = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }

  const handleNextClick = () => {
    if (activeIndex < limit - 1) {
      setActiveIndex(activeIndex + 1)
    }
  }

  return (
    <div className='flex items-center gap-1'>
      {activeIndex > 0 ? (
        <div className='flex items-center'>
          <button onClick={() => setActiveIndex(0)}>
            <img src={Images.Misc.ArrowDoubleLeft} alt='arrow-double-left' />
          </button>

          <button onClick={handlePrevClick}>
            <img src={Images.Misc.ArrowSingleLeft} alt='arrow-single-left' />
          </button>
        </div>
      ) : null}

      <div className='flex-1 text-center'>
        <p className='dark:text-white-100 text-gray-900 text-[12px]'>
          <strong>
            {activeIndex + 1} of {limit}
          </strong>
        </p>
        <p className='dark:text-white-100 text-gray-900 text-[10px]'>
          requests waiting to be acknowledged
        </p>
      </div>

      {activeIndex < limit - 1 ? (
        <div className='flex items-center'>
          <button onClick={handleNextClick}>
            <img src={Images.Misc.ArrowSingleRight} alt='arrow-single-right' />
          </button>

          <button onClick={() => setActiveIndex(limit - 1)}>
            <img src={Images.Misc.ArrowDoubleRight} alt='arrow-double-right' />
          </button>
        </div>
      ) : null}
    </div>
  )
}
