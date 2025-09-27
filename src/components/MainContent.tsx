'use client'

import ClockDisplay from '@/components/ClockDisplay'
import DayTimeline from '@/components/DayTimeline'
import MoreSuggestions from '@/components/MoreSuggestions'
import { WeatherDetails } from '@/components/weather/WeatherDetails'
import WeatherOverview from '@/components/weather/WeatherOverview'
import { ActivityScore } from '@/lib/db/helpers/activity'
import { TActivity } from '@/lib/types/activity'
import { DataContext } from '@/lib/types/context'
import { WorkingHoursSetting } from '@/lib/types/settings'
import { DateContext } from '@/lib/utils/contexts'
import { groupActivityScores } from '@/lib/utils/group-activity-score'
import { formatDistanceToNowStrict } from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { RefreshCwIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function MainContent({
  workingHours,
  dataContext,
  activityScores,
}: {
  activities: TActivity[]
  workingHours: WorkingHoursSetting
  dataContext: DataContext | undefined
  activityScores: ActivityScore[]
}) {
  const { showSuggestedActivity } = useFlags()
  const groupedActivityScores = groupActivityScores(activityScores)

  if (dataContext === undefined) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl">No data context available</h1>
        <button className="btn btn-warning w-full rounded-md md:w-36">
          <Link href="/">Back to Today</Link>
        </button>
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="flex flex-col items-start justify-center gap-6 md:flex-row">
          <div className="w-full">
            <DayTimeline
              referenceDate={dataContext.referenceDate}
              sunData={dataContext.sunData}
              tideData={dataContext.tideData}
            />
            <WeatherOverview
              dataContext={dataContext}
              workingHours={workingHours}
            />
            <ClockDisplay
              activityScores={groupedActivityScores}
              dataContext={dataContext}
            />
            {showSuggestedActivity && (
              <MoreSuggestions activityScores={groupedActivityScores} />
            )}
            <WeatherDetails
              dataContext={dataContext}
              workingHours={workingHours}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export type RefreshDataProps = {
  lastUpdatedTime: Date | undefined
  onClickedRefreshAction: (currentPath: string) => Promise<void>
}
export function RefreshData({
  lastUpdatedTime,
  onClickedRefreshAction,
}: RefreshDataProps) {
  const [refreshing, setRefreshing] = React.useState(false)
  const { isPast } = React.useContext(DateContext)
  const formattedTime = lastUpdatedTime
    ? `${formatDistanceToNowStrict(lastUpdatedTime)} ago`
    : 'never'

  const onClick = () => {
    setRefreshing(true)
    onClickedRefreshAction(window.location.pathname).then(() => {
      setRefreshing(false)
    })
  }

  return (
    <div className="md:bg-base-100 p-4 md:absolute md:top-24 md:right-2 md:z-10">
      <div className="flex flex-row items-center justify-center text-xs md:justify-end">
        <div className="flex items-center gap-2 md:flex-col md:items-end">
          <span>Last updated: {formattedTime} </span>
          {!isPast && (
            <button
              className={`btn btn-xs btn-accent rounded-field w-fit ${refreshing ? 'btn-disabled' : ''}`}
              onClick={onClick}
            >
              Refresh <RefreshCwIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
