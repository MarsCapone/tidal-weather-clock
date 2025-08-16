import ClockChart, {
  ClockChartProps,
  TimePointer,
  TimeRange,
} from '@/components/ClockChart'
import { getActivityGroupInfo } from '@/components/SuggestedActivity'
import { DataContext } from '@/types/context'
import { TimeZoneContext } from '@/utils/contexts'
import {
  formatInterval,
  naiveDateToFractionalLocal,
  utcDateStringToUtc,
} from '@/utils/dates'
import { EnrichedActivityScore } from '@/utils/suggestions'
import { tz, TZDate } from '@date-fns/tz'
import {
  Duration,
  format,
  formatDuration,
  formatRelative,
  intervalToDuration,
  isBefore,
} from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import React, { useContext, useEffect } from 'react'

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

  const timePointers: TimePointer[] = [
    {
      isOutside: true,
      label: 'Sunrise',
      timestamp: sunData.sunRise ? utcDateStringToUtc(sunData.sunRise) : null,
    },
    {
      isOutside: true,
      label: 'Sunset',
      timestamp: sunData.sunSet ? utcDateStringToUtc(sunData.sunSet) : null,
    },
    ...highTides.map((t, i) => ({
      hour: t.time,
      isOutside: true,
      label: `HW (${t.time >= 12 ? 'pm' : 'am'})`,
    })),
    ...lowTides.map((t, i) => ({
      hour: t.time,
      isOutside: true,
      label: `LW (${t.time >= 12 ? 'pm' : 'am'})`,
    })),
  ].map((s) => ({
    color: 'warning',
    hour: 'hour' in s ? s.hour : naiveDateToFractionalLocal(s.timestamp!),
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
        endHour: naiveDateToFractionalLocal(agi.interval.end) + 1,
        id: `${suggestedActivity.activity.id}-${formatInterval(agi.interval)}`,
        label: formatInterval(agi.interval).join(' '),
        startHour: naiveDateToFractionalLocal(agi.interval.start),
      }
    })

  return <ClockChart {...chartOptions} timeRanges={timeRanges} />
}

export function TimeToNext({
  suggestedActivity,
  displayTime = true,
}: ClockDisplayProps & { displayTime?: boolean; type: 'descriptive' }) {
  const [diff, setDiff] = React.useState<string | null>(null)
  const [currentTime, setCurrentTime] = React.useState<TZDate>(new TZDate())
  const { showSecondsCountdown, showSuggestedActivity } = useFlags()
  const { timeZone } = useContext(TimeZoneContext)

  useEffect(() => {
    const updateTime = () => {
      if (!suggestedActivity || !showSuggestedActivity) {
        return
      }
      const current = new TZDate().withTimeZone(timeZone)
      const duration = intervalToDuration({
        start: current,
        end: utcDateStringToUtc(suggestedActivity.timestamp),
      })

      const additionalFormats: (keyof Duration)[] = showSecondsCountdown
        ? ['seconds']
        : []
      const formatted = formatDuration(duration, {
        format: ['weeks', 'days', 'hours', 'minutes', ...additionalFormats],
      })
      setDiff(formatted)
      setCurrentTime(current)
    }
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [suggestedActivity, showSecondsCountdown, showSuggestedActivity, timeZone])

  const timestamp =
    suggestedActivity &&
    utcDateStringToUtc(suggestedActivity.timestamp).withTimeZone(timeZone)

  const activityView = getActivityView(
    suggestedActivity,
    timestamp ? isBefore(timestamp, currentTime) : false,
    showSuggestedActivity,
    {
      diff,
      currentTime,
      timestamp,
    },
  )

  return (
    <div className="flex flex-col items-center justify-center gap-1 p-10">
      {displayTime && currentTime && (
        <div className="mb-8">
          <div className="text-md font-bold md:text-xl xl:text-3xl">
            the time is
          </div>
          <div className="text-xl font-extrabold md:text-3xl xl:text-5xl">
            {format(currentTime, 'h:mm aaa', { in: tz(timeZone) })}
          </div>
        </div>
      )}
      {activityView}
    </div>
  )
}

function getActivityView(
  suggestedActivity: EnrichedActivityScore | null,
  isInThePast: boolean,
  shouldShow: boolean,
  timings: {
    timestamp: TZDate | null
    currentTime: Date
    diff: string | null
  },
): React.ReactNode | null {
  if (!shouldShow || !suggestedActivity) {
    return null
  }

  // if it's in the past, we want to show:
  // ACTIVITY was the activity suggested TIME

  // if it's in the future, we want to show
  // the selected activity is ACTIVITY in TIME

  const activity = (
    <div className="bg-base-content text-base-100 w-fit px-1 py-0.5 text-xl font-extrabold md:text-3xl xl:text-5xl">
      {suggestedActivity.activity.name}
    </div>
  )

  if (isInThePast) {
    return (
      <>
        {activity}
        <div className="bg-base-content text-base-100 w-fit px-1 py-0.5 text-xl font-extrabold md:text-3xl xl:text-5xl">
          {suggestedActivity.activity.name}
        </div>
        <div className="text-md font-bold md:text-xl xl:text-3xl">
          was the activity suggested
        </div>
        <div className="text-xl font-extrabold md:text-3xl xl:text-5xl">
          {timings.timestamp &&
            formatRelative(timings.timestamp, timings.currentTime)}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="text-md font-bold md:text-xl xl:text-3xl">
        the selected activity is
      </div>
      {activity}
      <div className="text-md font-bold md:text-xl xl:text-3xl">in</div>
      <div className="text-xl font-extrabold md:text-3xl xl:text-5xl">
        {timings.diff}
      </div>
    </>
  )
}
