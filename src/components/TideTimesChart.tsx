import ClockChart, {
  ClockChartProps,
  TimePointer,
  TimeRange,
} from '@/components/ClockChart'
import { getActivityGroupInfo } from '@/components/SuggestedActivity'
import { SunData, TideInfo } from '@/types/context'
import { formatInterval, getFractionalTime } from '@/utils/dates'
import { EnrichedActivityScore } from '@/utils/suggestions'
import { parseISO } from 'date-fns'
import React from 'react'

export type TideTimesChartProps = {
  suggestedActivity: EnrichedActivityScore | null
  sunData: SunData
  tideData: TideInfo[]
}

export default function TideTimesChart({
  suggestedActivity,
  sunData,
  tideData,
}: TideTimesChartProps) {
  const highTides = tideData.filter((t) => t.type === 'high')
  const lowTides = tideData.filter((t) => t.type === 'low')

  let lowTideEstimate = false
  if (lowTides.length === 0 && highTides.length > 0) {
    lowTideEstimate = true
    // If there are no low tides, we create a fake one 6 hours after the first high tide, or 6 hours before (if it
    // would be after midnight)
    lowTides.push({
      height: 0,
      time:
        highTides[0].time >= 18 ? highTides[0].time - 6 : highTides[0].time + 6,
      type: 'low',
    })
  }

  const timePointers: TimePointer[] = [
    {
      isOutside: true,
      label: 'Sunrise',
      timestamp: sunData.sunRise ? parseISO(sunData.sunRise) : null,
    },
    {
      isOutside: true,
      label: 'Sunset',
      timestamp: sunData.sunSet ? parseISO(sunData.sunSet) : null,
    },
    ...highTides.map((t, i) => ({
      hour: t.time,
      isOutside: true,
      label: `HW (${t.time >= 12 ? 'pm' : 'am'})`,
    })),
    ...lowTides.map((t, i) => ({
      hour: t.time,
      isOutside: true,
      label:
        `LW (${t.time >= 12 ? 'pm' : 'am'}) ${lowTideEstimate ? '[est.]' : ''}`.trim(),
    })),
  ].map((s) => ({
    color: 'warning',
    hour: 'hour' in s ? s.hour : getFractionalTime(s.timestamp!),
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
    if (intervals.length === 1 || index === 0) {
      return 'success'
    }

    if (intervals.length >= 2 && index === 1) {
      return 'success80'
    }

    if (intervals.length >= 3 && index === 2) {
      return 'success60'
    }

    return 'success40'
  }

  const timeRanges: TimeRange[] = intervals
    .sort((a, b) => b.score - a.score)
    .map((agi, index) => {
      return {
        color: scoreToColor(index),
        endHour: getFractionalTime(agi.interval.end) + 1,
        id: `${suggestedActivity.activity.id}-${formatInterval(agi.interval)}`,
        label: formatInterval(agi.interval),
        startHour: getFractionalTime(agi.interval.start),
      }
    })

  return <ClockChart {...chartOptions} timeRanges={timeRanges} />
}
