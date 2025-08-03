import ClockChart, {
  ClockChartProps,
  TimePointer,
  TimeRange,
} from '@/components/ClockChart'
import { getActivityGroupInfo } from '@/components/SuggestedActivity'
import { DataContext } from '@/types/context'
import { dateOptions, formatInterval, getFractionalTime } from '@/utils/dates'
import { EnrichedActivityScore } from '@/utils/suggestions'
import {
  format,
  formatDuration,
  formatRelative,
  intervalToDuration,
  isBefore,
  parseISO,
} from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import React, { useEffect } from 'react'

export type ClockDisplayProps = {
  suggestedActivity: EnrichedActivityScore | null
  dataContext: DataContext
}

export default function ClockDisplay(props: ClockDisplayProps) {
  const { clockType } = useFlags()

  switch (clockType) {
    case 'analog-activity-ranges':
      return <AnalogActivityRanges {...props} />
    case 'time-to-next-descriptive':
      return <TimeToNext {...props} type={'descriptive'} displayTime={true} />
    default:
      return null
  }
}

export function AnalogActivityRanges({
  suggestedActivity,
  dataContext,
}: ClockDisplayProps) {
  const { tideData, sunData } = dataContext

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
        label: formatInterval(agi.interval).join(' '),
        startHour: getFractionalTime(agi.interval.start),
      }
    })

  return <ClockChart {...chartOptions} timeRanges={timeRanges} />
}

export function TimeToNext({
  suggestedActivity,
  displayTime = true,
}: ClockDisplayProps & { displayTime?: boolean; type: 'descriptive' }) {
  const [diff, setDiff] = React.useState<string | number | null>(null)
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null)
  useEffect(() => {
    const updateTime = () => {
      if (!suggestedActivity) {
        return
      }
      const current = new Date()
      const duration = intervalToDuration({
        start: current,
        end: parseISO(suggestedActivity?.timestamp, dateOptions),
      })
      const formatted = formatDuration(duration)
      setDiff(formatted)
      setCurrentTime(current)
    }
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [suggestedActivity])

  if (!suggestedActivity) {
    return null
  }

  const timestamp = parseISO(suggestedActivity?.timestamp, dateOptions)

  const nextActivityInThePast = isBefore(timestamp, currentTime || new Date())

  return (
    <div className="flex flex-col items-center justify-center gap-1 p-10">
      {displayTime && currentTime && (
        <div className="mb-8">
          <div className="text-md font-bold md:text-xl xl:text-3xl">
            the time is
          </div>
          <div className="text-xl font-extrabold md:text-3xl xl:text-5xl">
            {format(currentTime, 'h:mm aaa')}
          </div>
        </div>
      )}

      <div className="bg-base-content text-base-100 w-fit px-1 py-0.5 text-xl font-extrabold md:text-3xl xl:text-5xl">
        {suggestedActivity.activity.name}
      </div>

      {nextActivityInThePast ? (
        <>
          <div className="text-md font-bold md:text-xl xl:text-3xl">
            was the acttivity suggested
          </div>
          <div className="text-xl font-extrabold md:text-3xl xl:text-5xl">
            {formatRelative(timestamp, currentTime || new Date(), dateOptions)}
          </div>
        </>
      ) : (
        <>
          <div className="text-md font-bold md:text-xl xl:text-3xl">in</div>
          <div className="text-xl font-extrabold md:text-3xl xl:text-5xl">
            {diff}
          </div>
        </>
      )}
    </div>
  )
}
