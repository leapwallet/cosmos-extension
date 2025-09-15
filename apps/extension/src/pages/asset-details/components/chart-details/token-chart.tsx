import { MarketChartPrice, useformatCurrency } from '@leapwallet/cosmos-wallet-hooks'
import { BigNumber } from 'bignumber.js'
import React, { useEffect, useState } from 'react'
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
  MarkLine,
  TooltipArea,
} from 'reaviz'
import { Colors } from 'theme/colors'

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

  const [formattedChartData, setFormattedChartData] = useState<ChartDataShape[] | undefined>()

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

  return chartData && !loadingCharts && price ? (
    <AreaChart
      height={128}
      xAxis={
        <LinearXAxis
          tickSeries={<LinearXAxisTickSeries tickSize={0} interval={5} label={null} line={null} />}
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
          markLine={<MarkLine strokeColor={chainColor} strokeWidth={1} />}
          tooltip={
            <TooltipArea
              tooltip={
                <ChartTooltip
                  followCursor={true}
                  placement='auto'
                  modifiers={{
                    offset: '5px, 5px',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  content={(data: any) => {
                    let price = data.value + minMax[0].price

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

                    try {
                      price = formatCurrency(new BigNumber(price))
                    } catch (_) {
                      //
                    }
                    return (
                      <div className='text-xs font-medium !text-black-100 dark:!text-white-100'>
                        {price} | {formattedDate}
                      </div>
                    )
                  }}
                />
              }
            />
          }
          colorScheme={chainColor}
          interpolation={'smooth'}
          line={<Line strokeWidth={2} />}
          area={
            <Area
              gradient={
                <Gradient
                  stops={[
                    <GradientStop key={0} offset='0' stopOpacity={0} color={chainColor} />,
                    <GradientStop key={2} offset='1' stopOpacity={0.55} color={chainColor} />,
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
  ) : (
    <>{price && <div className='h-auto' />}</>
  )
}
