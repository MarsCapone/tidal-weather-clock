import { SunData, TideInfo } from '@/types/data'
import ClockChart, { TimePointer, TimeRange } from '@/ui/components/ClockChart'
import React from 'react'
import { getFractionalTime } from '@/ui/utils/dates'
import { parseISO } from 'date-fns'

export type TideTimesChartProps = {
  highTideBounds?: number
  lowTideBounds?: number
  tideData: TideInfo[]
  sunData: SunData
}

export default function TideTimesChart({
  highTideBounds = 2,
  lowTideBounds = 1,
  tideData,
  sunData,
}: TideTimesChartProps) {
  const highTides = tideData.filter((t) => t.type === 'high')
  const lowTides = tideData.filter((t) => t.type === 'low')

  const highTideTime = highTides.length > 0 ? highTides[0].time : 12
  const lowTideTime = lowTides.length > 0 ? lowTides[0].time : 12

  const timeRanges: TimeRange[] = [
    {
      id: 'high-tide',
      startHour: highTideTime - highTideBounds,
      endHour: highTideTime + highTideBounds,
      color: 'success',
      label: 'High Tide',
    },
    {
      id: 'low-tide',
      startHour: lowTideTime - lowTideBounds,
      endHour: lowTideTime + lowTideBounds,
      color: 'error',
      label: 'Low Tide',
    },
  ]

  const timePointers: TimePointer[] = [
    {
      label: 'Sunrise',
      timestamp: sunData.sunRise
        ? typeof sunData.sunRise === 'string'
          ? parseISO(sunData.sunRise)
          : sunData.sunRise
        : null,
    },
    {
      label: 'Sunset',
      timestamp: sunData.sunSet
        ? typeof sunData.sunSet === 'string'
          ? parseISO(sunData.sunSet)
          : sunData.sunSet
        : null,
    },
  ]
    .filter((s) => !!s.timestamp)
    .map((s) => ({
      id: s.label.toLowerCase(),
      hour: getFractionalTime(s.timestamp!),
      color: 'warning',
      label: s.label,
      isOutside: true,
    }))

  return (
    <ClockChart
      timePointers={timePointers}
      timeRanges={timeRanges}
      showCenterDot={true}
      size={500}
      clockRadius={180}
      options={{
        range: {
          width: 69,
          offset: -37,
        },
      }}
    />
  )
}
