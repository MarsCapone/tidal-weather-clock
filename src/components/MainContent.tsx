'use client'

import ActivityScoreList from '@/components/ActivityScoreList'
import ClockDisplay from '@/components/ClockDisplay'
import DayTimeline from '@/components/DayTimeline'
import SuggestedActivity from '@/components/SuggestedActivity'
import { WeatherDetails } from '@/components/WeatherDetails'
import WeatherOverview from '@/components/WeatherOverview'
import { APP_CONFIG } from '@/lib/config'
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
}: {
  activities: Activity[]
  workingHours: WorkingHoursSetting
  dataContext: DataContext | undefined
}) {
  const { showSuggestedActivity } = useFlags()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { date } = useContext(DateContext)

  useEffect(() => {}, [date])

  // useEffect(() => {
  //   tryDataFetchersWithCache(
  //     logger,
  //     startOfDay(date, dateOptions),
  //     APP_CONFIG.dataFetchers,
  //     APP_CONFIG.clientCache,
  //     (lat, lng, date) =>
  //       `[${lat},${lng}]-${formatISO(date, { representation: 'date' })}`,
  //   ).then((dc) => {
  //     if (dc === null) {
  //       logger.warn('final data context is null')
  //     }
  //     logger.info('setting data context', { dataContext: dc })
  //     setDataContext(dc)
  //     setIsLoading(false)
  //   })
  // }, [date])

  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl">Loading data...</h1>
        <span className="loading loading-dots loading-lg"></span>
      </>
    )
  }

  if (dataContext === null || dataContext === undefined) {
    return (
      <>
        <h1 className="text-3xl">No data context available</h1>
        <button className="btn btn-warning rounded-md">
          <Link href="/">Back to Today</Link>
        </button>
      </>
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
