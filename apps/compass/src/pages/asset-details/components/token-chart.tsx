import { MarketChartPrice, useformatCurrency } from '@leapwallet/cosmos-wallet-hooks'
import { BigNumber } from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  AreaSeries,
  ChartDataShape,
  ChartTooltip,
  Gradient,
  GradientStop,
  Gridline,
  GridlineSeries,
  Line,
  LinearAxisLine,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearYAxis,
  LinearYAxisTickSeries,
  TooltipArea,
} from 'reaviz'
import { Colors } from 'theme/colors'

const HoverSpaceTooltip = ({
  data,
  maxAndLastDiff,
}: {
  data: { price: string; formattedDate: string }
  maxAndLastDiff: number
}) => {
  return (
    <div className={`flex h-full absolute right-10`}>
      <div className='relative'>
        <div className='border-r border-blue-600 h-full' />
        <div
          className={`flex absolute -right-[4px]`}
          style={{
            top: `${maxAndLastDiff}px`,
          }}
        >
          <div className='flex flex-col gap-1 mr-1 items-start'>
            <p className='bg-blue-600 rounded text-monochrome text-xs font-bold !leading-4 px-1'>
              {data.price}
            </p>
            <p className='bg-secondary-200 rounded text-muted-foreground text-[10px] font-bold !leading-3 py-0.5 px-1 min-w-20'>
              {data.formattedDate}
            </p>
          </div>
          <div className='w-[10px] h-[10px] rounded-full bg-blue-600' />
        </div>
      </div>
    </div>
  )
}

export function TokensChart({
  chartData,
  loadingCharts,
  price,
  minMax,
  chainColor,
  selectedDays,
}: {
  chartData: MarketChartPrice[]
  loadingCharts: boolean
  price: number
  chainColor: string
  minMax: MarketChartPrice[]
  selectedDays: string
}) {
  const [formatCurrency] = useformatCurrency()
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredData, setHoveredData] = useState<ChartDataShape | undefined>()
  const [formattedChartData, setFormattedChartData] = useState<ChartDataShape[] | undefined>()
  const maxPrice = useMemo(() => {
    return Math.max(...chartData.map((item) => item.price))
  }, [chartData])

  const chartColor = isHovered ? '#292929' : chainColor

  useEffect(
    () =>
      setFormattedChartData(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chartData?.map((val: { price: any; date: any }) => {
          return {
            data: val.price,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            key: new Date((val as any).timestamp),
            metadata: val.date,
          }
        }),
      ),
    [chartData],
  )
  const getDateAndPrice = (data: any) => {
    const price = (data?.value ?? data?.data) + minMax[0].price

    const date = new Date(data.key)
    let formattedDate

    if (selectedDays === '1Y' || selectedDays === 'YTD' || selectedDays === 'All') {
      formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } else {
      formattedDate = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    return {
      price: formatCurrency(new BigNumber(price)),
      formattedDate,
    }
  }

  const onMouseEnter = () => {
    setIsHovered(true)
  }

  const onMouseLeave = () => {
    setIsHovered(false)
  }

  return chartData && !loadingCharts && price ? (
    <div className='flex w-full h-[184px] relative'>
      <AreaChart
        height={184}
        containerClassName='!w-[calc(100%-40px)]'
        xAxis={
          <LinearXAxis
            tickSeries={
              <LinearXAxisTickSeries tickSize={0} interval={5} label={null} line={null} />
            }
            axisLine={<LinearAxisLine strokeWidth={0} strokeColor={Colors.gray900} />}
            type={'time'}
          />
        }
        yAxis={
          <LinearYAxis
            tickSeries={
              <LinearYAxisTickSeries tickSize={0} width={0} interval={5} label={null} line={null} />
            }
            axisLine={<LinearAxisLine strokeWidth={0} />}
          />
        }
        series={
          <AreaSeries
            markLine={null}
            tooltip={
              <TooltipArea
                placement='right-start'
                onValueEnter={onMouseEnter}
                onValueLeave={onMouseLeave}
                color='#fff'
                tooltip={
                  <ChartTooltip
                    placement='right-start'
                    modifiers={{
                      offset: '2px, 5px',
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    content={(data: any) => {
                      const { price, formattedDate } = getDateAndPrice(data)
                      const distFromTop = Math.ceil((184 / maxPrice) * data.value) - 184

                      return (
                        <div className='relative flex h-[184px]'>
                          <div
                            className='border-r border-blue-600 h-[184px] -left-[11.5px] absolute'
                            style={{
                              top: distFromTop + 12,
                            }}
                          />
                          <div className='w-2.5 h-2.5 rounded-full absolute top-2.5 -left-4 bg-blue-600' />
                          <div className='flex flex-col gap-1 items-start'>
                            <p className='bg-blue-600 rounded text-monochrome text-xs font-bold !leading-4 px-1'>
                              {price}
                            </p>
                            <p className='bg-secondary-200 rounded text-muted-foreground text-[10px] font-bold !leading-3 py-0.5 px-1 min-w-20'>
                              {formattedDate}
                            </p>
                          </div>
                        </div>
                      )
                    }}
                  />
                }
              />
            }
            colorScheme={chartColor}
            interpolation={'smooth'}
            line={<Line strokeWidth={2} />}
            area={
              <Area
                gradient={
                  <Gradient
                    stops={[
                      <GradientStop key={0} offset='0' stopOpacity={0} color={chartColor} />,
                      <GradientStop key={2} offset='1' stopOpacity={0.2} color={chartColor} />,
                    ]}
                  />
                }
              />
            }
          />
        }
        gridlines={<GridlineSeries line={<Gridline direction='all' strokeWidth={0} />} />}
        data={formattedChartData}
      />
      {hoveredData ? (
        <HoverSpaceTooltip
          data={getDateAndPrice({ ...hoveredData, value: hoveredData.data })}
          maxAndLastDiff={
            chartData
              ? 184 - Math.ceil((184 / maxPrice) * chartData[chartData.length - 1].price)
              : 0
          }
        />
      ) : null}
      <div
        className='w-[40px] h-full cursor-pointer z-1'
        onMouseOver={() => {
          if (formattedChartData) {
            setHoveredData(formattedChartData[formattedChartData.length - 1])
          }
        }}
        onMouseLeave={() => setHoveredData(undefined)}
      />
    </div>
  ) : (
    <>{price && <div className='h-auto' />}</>
  )
}
