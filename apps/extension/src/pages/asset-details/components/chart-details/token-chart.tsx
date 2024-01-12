import { useformatCurrency } from '@leapwallet/cosmos-wallet-hooks'
import { MarketChartPrice } from '@leapwallet/leap-api-js'
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
  LinearXAxisTickLabel,
  LinearXAxisTickLine,
  LinearXAxisTickSeries,
  LinearYAxis,
  LinearYAxisTickLabel,
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
}: {
  chartData: MarketChartPrice[]
  loadingCharts: boolean
  price: number
  chainColor: string
  minMax: MarketChartPrice[]
}) {
  const [formatCurrency] = useformatCurrency()

  const [formattedChartData, setFormattedChartData] = useState<ChartDataShape[] | undefined>()

  useEffect(
    () =>
      setFormattedChartData(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chartData?.map((val: { price: any; date: any }, index: any) => {
          return {
            data: val.price,
            key: new Date((val as any).timestamp),
            metadata: val.date,
          }
        }),
      ),
    [chartData],
  )

  return chartData && !loadingCharts && price ? (
    <AreaChart
      height={248}
      xAxis={
        <LinearXAxis
          tickSeries={
            <LinearXAxisTickSeries
              tickSize={25}
              interval={5}
              label={
                <LinearXAxisTickLabel
                  fontSize={8}
                  fontFamily={'Satoshi'}
                  className={'font-medium !leading-[8px] text-gray-500 dark:text-gray-500'}
                  padding={9}
                />
              }
              line={<LinearXAxisTickLine strokeWidth={1} strokeColor={Colors.gray900} size={13} />}
            />
          }
          axisLine={<LinearAxisLine strokeWidth={1} strokeColor={Colors.gray900} />}
          type={'time'}
        />
      }
      yAxis={
        <LinearYAxis
          tickSeries={
            <LinearYAxisTickSeries
              tickSize={100}
              width={0}
              interval={5}
              label={
                <LinearYAxisTickLabel
                  fontSize={8}
                  className={'font-medium !leading-[8px] text-gray-500 dark:text-gray-500'}
                  fontFamily={'Satoshi'}
                  format={(data: any) => {
                    let price = data + minMax[0].price
                    try {
                      price = formatCurrency(new BigNumber(price))
                    } catch (_) {
                      //
                    }
                    return String(price)
                  }}
                  padding={10}
                />
              }
              line={null}
            />
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
                    try {
                      price = formatCurrency(new BigNumber(price))
                    } catch (_) {
                      //
                    }
                    return (
                      <>
                        <div className='text-[10px] font-bold !text-blue-300 dark:!text-blue-300'>
                          {price}
                        </div>
                        <div className='text-[10px] font-semibold text-blue-300 dark:text-blue-300'>
                          {data.metadata}
                        </div>
                      </>
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
                    <GradientStop key={0} offset='0' stopOpacity={0} color={'#0068D1'} />,
                    <GradientStop key={2} offset='1' stopOpacity={0.55} color={'#0068D1'} />,
                  ]}
                />
              }
            />
          }
        />
      }
      gridlines={
        <GridlineSeries
          line={
            <Gridline
              direction='y'
              strokeWidth={1}
              strokeColor={Colors.gray900}
              strokeDasharray=''
            />
          }
        />
      }
      data={formattedChartData}
    />
  ) : (
    <>{price && <div className='h-[248px]' />}</>
  )
}
