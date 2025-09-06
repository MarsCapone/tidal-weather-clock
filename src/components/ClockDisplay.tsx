import { ActivityScore } from '@/lib/db/helpers/activity'
import { DataContext } from '@/lib/types/context'
import { DateContext, TimeZoneContext } from '@/lib/utils/contexts'
import { utcDateStringToUtc } from '@/lib/utils/dates'
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
  suggestedActivity: ActivityScore | null
  dataContext: DataContext
}

export default function ClockDisplay(props: ClockDisplayProps) {
  const { clockType } = useFlags()

  switch (clockType) {
    case 'time-to-next-descriptive':
      return <TimeToNext {...props} type={'descriptive'} displayTime={true} />
    default:
      return null
  }
}

export function TimeToNext({
  suggestedActivity,
  displayTime = true,
}: ClockDisplayProps & { displayTime?: boolean; type: 'descriptive' }) {
  const [diff, setDiff] = React.useState<string | null>(null)
  const [currentTime, setCurrentTime] = React.useState<TZDate>(new TZDate())
  const { showSecondsCountdown, showSuggestedActivity } = useFlags()
  const { timeZone } = useContext(TimeZoneContext)
  const { isPast } = useContext(DateContext)

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
    isPast,
    showSuggestedActivity,
    {
      diff,
      currentTime,
      timestamp,
    },
  )

  if (isPast) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 px-10 py-2">
        <div className="mb-8">
          <div className="text-xl font-bold xl:text-3xl">
            you are looking at a date in the past
          </div>
        </div>
        {activityView}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 px-10 py-2">
      {displayTime && currentTime && (
        <div className="mb-8">
          <div className="text-xl font-bold xl:text-3xl">the time is</div>
          <div className="text-3xl font-extrabold md:text-5xl">
            {format(currentTime, 'h:mm aaa', { in: tz(timeZone) })}
          </div>
        </div>
      )}
      {activityView}
    </div>
  )
}

function getActivityView(
  suggestedActivity: ActivityScore | null,
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
      {suggestedActivity.name}
    </div>
  )

  if (isInThePast) {
    return (
      <>
        {activity}
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
      {activity}
      <div className="text-md font-bold md:text-xl xl:text-3xl">in</div>
      <div className="text-xl font-extrabold md:text-3xl xl:text-5xl">
        {timings.diff}
      </div>
    </>
  )
}
