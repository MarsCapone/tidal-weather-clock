'use client'

import ActivityScoreList from '@/components/ActivityScoreList'
import ClockDisplay from '@/components/ClockDisplay'
import DatePagination from '@/components/DatePagination'
import DayTimeline from '@/components/DayTimeline'
import SuggestedActivity from '@/components/SuggestedActivity'
import { WeatherDetails } from '@/components/WeatherDetails'
import WeatherStatus from '@/components/WeatherStatus'
import { useActivities } from '@/hooks/apiRequests'
import { useWorkingHours } from '@/hooks/settings'
import { APP_CONFIG } from '@/lib/config'
import { DataContext } from '@/lib/types/context'
import { dateOptions } from '@/lib/utils/dates'
import tryDataFetchersWithCache from '@/lib/utils/fetchData'
import logger from '@/lib/utils/logger'
import { ActivityRecommender, groupScores } from '@/lib/utils/suggestions'
import { formatISO, startOfDay } from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type DateInfo = {
  date: Date
  nextPath: string | null
  prevPath: string | null
}

export default function MainContent({ date, nextPath, prevPath }: DateInfo) {
  return (
    <div>
      <DatePagination date={date} nextPath={nextPath} prevPath={prevPath} />
      <MainContentWithoutDate date={date} />
    </div>
  )
}

function MainContentWithoutDate({ date }: { date: Date }) {
  const [activities] = useActivities([])
  const [workingHours] = useWorkingHours()
  const { showSuggestedActivity, showActivityTable } = useFlags()
  const [dataContext, setDataContext] = useState<DataContext | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectionIndex, setSelectionIndex] = useState(0)

  useEffect(() => {
    tryDataFetchersWithCache(
      logger,
      startOfDay(date, dateOptions),
      APP_CONFIG.dataFetchers,
      APP_CONFIG.clientCache,
      (lat, lng, date) =>
        `[${lat},${lng}]-${formatISO(date, { representation: 'date' })}`,
    ).then((dc) => {
      if (dc === null) {
        logger.warn('final data context is null')
      }
      logger.info('setting data context', { dataContext: dc })
      setDataContext(dc)
      setIsLoading(false)
    })
  }, [date])

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

  const suggestions = new ActivityRecommender(
    dataContext,
    workingHours,
  ).getRecommendedActivities(activities || [])
  const filteredSuggestions = groupScores(
    suggestions.filter((r) => r.feasible),
    'timeAndActivity',
  )

  const suggestedActivity =
    filteredSuggestions.length > 0 ? filteredSuggestions[selectionIndex] : null

  const nextSuggestion = () =>
    setSelectionIndex(
      Math.min(filteredSuggestions.length - 1, selectionIndex + 1),
    )
  const prevSuggestion = () =>
    setSelectionIndex(Math.max(0, selectionIndex - 1))

  return (
    <>
      <div>
        {showSuggestedActivity && (
          <SuggestedActivity
            activityScore={suggestedActivity}
            className={'md:hidden'}
            nextSuggestion={
              selectionIndex < filteredSuggestions.length - 1
                ? nextSuggestion
                : undefined
            }
            prevSuggestion={selectionIndex > 0 ? prevSuggestion : undefined}
          />
        )}
        <div className="flex flex-col items-start justify-center gap-6 md:flex-row">
          <div className="w-full md:w-2/3">
            <DayTimeline
              referenceDate={dataContext.referenceDate}
              sunData={dataContext.sunData}
              tideData={dataContext.tideData}
            />
            <ClockDisplay
              suggestedActivity={suggestedActivity}
              dataContext={dataContext}
            />
            <WeatherDetails dataContext={dataContext} />
          </div>
          <div className="w-full md:w-1/3">
            {showSuggestedActivity && (
              <SuggestedActivity
                activityScore={suggestedActivity}
                className="mb-4 hidden md:flex"
                nextSuggestion={
                  selectionIndex < filteredSuggestions.length - 1
                    ? nextSuggestion
                    : undefined
                }
                prevSuggestion={selectionIndex > 0 ? prevSuggestion : undefined}
              />
            )}
            <WeatherStatus dataContext={dataContext} />
          </div>
        </div>
        {showActivityTable && showSuggestedActivity && (
          <div className="my-8">
            <ActivityScoreList scores={suggestions} />
          </div>
        )}
      </div>
    </>
  )
}
