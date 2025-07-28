import ClockChart, {
  ClockChartProps,
  TimePointer,
  TimeRange,
} from '@/components/ClockChart'
import { getActivityGroupInfo } from '@/components/SuggestedActivity'
import { SunData, TideInfo } from '@/types/context'
import {
  formatInterval,
  getFractionalTime,
  withFractionalTime,
} from '@/utils/dates'
import { EnrichedActivityScore } from '@/utils/suggestions'
import { parseISO } from 'date-fns'
import React from 'react'

export type TideTimesChartProps = {
  sunData: SunData
  tideData: TideInfo[]
  suggestedActivity: EnrichedActivityScore | null
}

export default function TideTimesChart({
  sunData,
  tideData,
  suggestedActivity,
}: TideTimesChartProps) {
  const highTides = tideData.filter((t) => t.type === 'high')
  const lowTides = tideData.filter((t) => t.type === 'low')

  const highTideTime = highTides.length > 0 ? highTides[0].time : 12
  const lowTideTime = lowTides.length > 0 ? lowTides[0].time : 12

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

  const chartOptions: ClockChartProps = {
    clockRadius: 180,
    options: {
      range: {
        offset: -37,
        width: 69,
      },
    },
    showCenterDot: true,
    size: 500,
    timePointers,
    timeRanges: [],
  }

  if (suggestedActivity === null) {
    return <ClockChart {...chartOptions} />
  }

  const intervals = getActivityGroupInfo(suggestedActivity)

  const scoreToColor = (index: number): TimeRange['color'] => {
    // score is between 0 and 1.
    if (intervals.length === 1 || index === 0) return 'success'

    if (intervals.length >= 2 && index === 1) return 'success80'

    if (intervals.length >= 3 && index === 2) return 'success60'

    return 'success40'
  }

  const timeRanges: TimeRange[] = intervals
    .sort((a, b) => b.score - a.score)
    .map((agi, index) => {
      return {
        color: scoreToColor(index),
        id: `${suggestedActivity.activity.id}-${formatInterval(agi.interval)}`,
        label: formatInterval(agi.interval),
        startHour: getFractionalTime(agi.interval.start),
        endHour: getFractionalTime(agi.interval.end) + 1,
      }
    })

  return <ClockChart {...chartOptions} timeRanges={timeRanges} />
}
