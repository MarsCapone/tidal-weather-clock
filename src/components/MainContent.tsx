'use client'

import ActivityScoreList from '@/components/ActivityScoreList'
import ClockDisplay from '@/components/ClockDisplay'
import DayTimeline from '@/components/DayTimeline'
import SuggestedActivity from '@/components/SuggestedActivity'
import { WeatherDetails } from '@/components/WeatherDetails'
import WeatherOverview from '@/components/WeatherOverview'
import { APP_CONFIG } from '@/lib/config'
import { ActivityScore } from '@/lib/db/helpers/activity'
import { Activity } from '@/lib/types/activity'
import { DataContext } from '@/lib/types/context'
import { WorkingHoursSetting } from '@/lib/types/settings'
import { DateContext } from '@/lib/utils/contexts'
import { dateOptions } from '@/lib/utils/dates'
import tryDataFetchersWithCache from '@/lib/utils/fetchData'
import logger from '@/lib/utils/logger'
import { EnrichedActivityScore } from '@/lib/utils/suggestions'
import { formatISO, startOfDay } from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'

export default function MainContentWithoutDate({
  activities,
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
  const { date } = useContext(DateContext)

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
        {String(date)}
        {showSuggestedActivity && (
          <SuggestedActivity
            activityScore={null}
            className={'md:hidden'}
            nextSuggestion={undefined}
            prevSuggestion={undefined}
          />
        )}
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
            <ClockDisplay suggestedActivity={null} dataContext={dataContext} />
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
