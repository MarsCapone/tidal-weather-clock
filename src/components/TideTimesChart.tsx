import ClockChart, { TimePointer, TimeRange } from '@/components/ClockChart'
import { ActivityScore } from '@/types/activity'
import { SunData, TideInfo } from '@/types/context'
import { getFractionalTime } from '@/utils/dates'
import { parseISO } from 'date-fns'
import React from 'react'

export type TideTimesChartProps = {
  sunData: SunData
  tideData: TideInfo[]
  suggestedActivity: ActivityScore<unknown>
}

export default function TideTimesChart({
  sunData,
  tideData,
}: TideTimesChartProps) {
  const [highTideBounds, lowTideBounds] = [2, 1]

  const highTides = tideData.filter((t) => t.type === 'high')
  const lowTides = tideData.filter((t) => t.type === 'low')

  const highTideTime = highTides.length > 0 ? highTides[0].time : 12
  const lowTideTime = lowTides.length > 0 ? lowTides[0].time : 12

  const timeRanges: TimeRange[] = [
    {
      color: 'success',
      endHour: highTideTime + highTideBounds,
      id: 'high-tide',
      label: 'High Tide',
      startHour: highTideTime - highTideBounds,
    },
    {
      color: 'error',
      endHour: lowTideTime + lowTideBounds,
      id: 'low-tide',
      label: 'Low Tide',
      startHour: lowTideTime - lowTideBounds,
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
      color: 'warning',
      hour: getFractionalTime(s.timestamp!),
      id: s.label.toLowerCase(),
      isOutside: true,
      label: s.label,
    }))

  return (
    <ClockChart
      clockRadius={180}
      options={{
        range: {
          offset: -37,
          width: 69,
        },
      }}
      showCenterDot={true}
      size={500}
      timePointers={timePointers}
      timeRanges={timeRanges}
    />
  )
}
