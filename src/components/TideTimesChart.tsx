import ClockChart, { TimePointer, TimeRange } from '@/components/ClockChart'
import { SunData, TideInfo } from '@/types/context'
import { getFractionalTime, withFractionalTime } from '@/utils/dates'
import { EnrichedActivityScore } from '@/utils/suggestions'
import { parseISO } from 'date-fns'
import React from 'react'

export type TideTimesChartProps = {
  referenceDate: string
  sunData: SunData
  tideData: TideInfo[]
  suggestedActivity: EnrichedActivityScore | null
}

export default function TideTimesChart({
  referenceDate,
  sunData,
  tideData,
  suggestedActivity,
}: TideTimesChartProps) {
  const [highTideBounds, lowTideBounds] = [2, 1]

  const highTides = tideData.filter((t) => t.type === 'high')
  const lowTides = tideData.filter((t) => t.type === 'low')

  const highTideTime = highTides.length > 0 ? highTides[0].time : 12
  const lowTideTime = lowTides.length > 0 ? lowTides[0].time : 12

  const timeRanges: TimeRange[] = [
    // {
    //   color: 'success',
    //   endHour: highTideTime + highTideBounds,
    //   id: 'high-tide',
    //   label: 'High Tide',
    //   startHour: highTideTime - highTideBounds,
    // },
    // {
    //   color: 'error',
    //   endHour: lowTideTime + lowTideBounds,
    //   id: 'low-tide',
    //   label: 'Low Tide',
    //   startHour: lowTideTime - lowTideBounds,
    // },
  ]

  const timePointers: TimePointer[] = [
    {
      label: 'Sunrise',
      timestamp: sunData.sunRise ? parseISO(sunData.sunRise) : null,
      isOutside: true,
    },
    {
      label: 'Sunset',
      timestamp: sunData.sunSet ? parseISO(sunData.sunSet) : null,
      isOutside: true,
    },
    {
      label: 'HW',
      hour: highTideTime,
      isOutside: false,
    },
    {
      label: 'LW',
      hour: lowTideTime,
      isOutside: false,
    },
  ].map((s) => ({
    color: 'warning',
    hour: s.hour || getFractionalTime(s.timestamp!),
    id: s.label.toLowerCase(),
    isOutside: s.isOutside,
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
