import React, { useEffect, useState } from 'react'

const SquareVisualization = ({ events }: { events: any }) => {
  const hdsSize = events ? events.square_width : 32
  const shares = events ? events.shares : null

  // NOTE • States
  const [activeCoords, setActiveCoords] = useState([])

  // NOTE • Functions
  useEffect(() => {
    if (shares) {
      setActiveCoords(shares)
    }
  }, [shares])

  const isActive = (x: number, y: number) => {
    return activeCoords.some((coord) => coord[0] === x && coord[1] === y)
  }

  const renderGrid = (gridCount: number) => {
    const rows = []
    for (let i = 0; i < gridCount; i++) {
      const cols = []
      for (let j = 0; j < gridCount; j++) {
        const key = `${i}-${j}`
        cols.push(
          <span
            key={key}
            className={`flex-1 h-full ${
              isActive(i, j) ? 'bg-[#8F34FF]' : 'dark:bg-gray-800 bg-gray-200'
            }`}
          ></span>,
        )
      }
      rows.push(
        <div key={i} className='flex flex-1 gap-[1px]'>
          {cols}
        </div>,
      )
    }
    return rows
  }
  return (
    <div id='square-visual' className='flex flex-col h-[320px] gap-[1px]'>
      {renderGrid(hdsSize)}
    </div>
  )
}

export default SquareVisualization
