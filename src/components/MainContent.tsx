'use client'

import ClockDisplay from '@/components/ClockDisplay'
import DayTimeline from '@/components/DayTimeline'
import SuggestedActivity from '@/components/SuggestedActivity'
import { WeatherDetails } from '@/components/WeatherDetails'
import WeatherOverview from '@/components/WeatherOverview'
import { ActivityScore } from '@/lib/db/helpers/activity'
import { Activity } from '@/lib/types/activity'
import { DataContext } from '@/lib/types/context'
import { WorkingHoursSetting } from '@/lib/types/settings'
import { DateContext } from '@/lib/utils/contexts'
import { useFlags } from 'launchdarkly-react-client-sdk'
import Link from 'next/link'
import React, { useContext } from 'react'

export default function MainContentWithoutDate({
  workingHours,
  dataContext,
  activityScores,
}: {
  activities: Activity[]
  workingHours: WorkingHoursSetting
  dataContext: DataContext | undefined
  activityScores: ActivityScore[]
}) {
  const { showSuggestedActivity } = useFlags()
  const [suggestionIndex, setSuggestionIndex] = React.useState(0)

  const suggestedActivity = activityScores[suggestionIndex]

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
            {showSuggestedActivity && (
              <SuggestedActivity
                activityScore={suggestedActivity}
                nextSuggestion={undefined}
                prevSuggestion={undefined}
              />
            )}
            <ClockDisplay
              suggestedActivity={suggestedActivity}
              dataContext={dataContext}
            />
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
