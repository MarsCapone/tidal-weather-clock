'use client'

import ActivityScoreList from '@/components/ActivityScoreList'
import DatePagination from '@/components/DatePagination'
import DayTimeline from '@/components/DayTimeline'
import SuggestedActivity from '@/components/SuggestedActivity'
import TideTimesChart from '@/components/TideTimesChart'
import WeatherStatus from '@/components/WeatherStatus'
import { APP_CONFIG } from '@/config'
import { useActivities } from '@/hooks/useApiRequest'
import { DateInfo } from '@/hooks/useDateString'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { DataContext } from '@/types/context'
import tryDataFetchersWithCache from '@/utils/fetchData'
import logger from '@/utils/logger'
import { ActivityRecommender, groupScores } from '@/utils/suggestions'
import { formatISO, startOfDay } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSwipeable } from 'react-swipeable'

export default function MainContent({ date, nextPath, prevPath }: DateInfo) {
  const router = useRouter()
  const handlers = useSwipeable({
    onSwiped: ({ dir }) => {
      // swipe left means you want to see what's on the right, i.e. next
      if (nextPath && dir === 'Left') {
        router.push(nextPath)
      }
      if (prevPath && dir === 'Right') {
        router.push(prevPath)
      }
    },
  })
  return (
    <div {...handlers}>
      <DatePagination date={date} nextPath={nextPath} prevPath={prevPath} />
      <MainContentWithoutDate date={date} />
    </div>
  )
}

function MainContentWithoutDate({ date }: { date: Date }) {
  const activities = useActivities(APP_CONFIG.activityFetcher)
  const ff = useFeatureFlags()
  const [dataContext, setDataContext] = useState<DataContext | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectionIndex, setSelectionIndex] = useState(0)

  useEffect(() => {
    tryDataFetchersWithCache(
      logger,
      startOfDay(date),
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
        {ff.showSuggestedActivity && (
          <SuggestedActivity
            activityScore={suggestedActivity}
            className={'md:hidden'}
            nextSuggestion={
              selectionIndex <= filteredSuggestions.length - 1
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
            <TideTimesChart
              key={date.toDateString()}
              suggestedActivity={suggestedActivity}
              sunData={dataContext.sunData}
              tideData={dataContext.tideData}
            />
          </div>
          <div className="w-full md:w-1/3">
            {ff.showSuggestedActivity && (
              <SuggestedActivity
                activityScore={suggestedActivity}
                className="mb-4 hidden md:flex"
                nextSuggestion={
                  selectionIndex <= filteredSuggestions.length - 1
                    ? nextSuggestion
                    : undefined
                }
                prevSuggestion={selectionIndex > 0 ? prevSuggestion : undefined}
              />
            )}
            <WeatherStatus dataContext={dataContext} />
          </div>
        </div>
        <div className="my-8">
          <ActivityScoreList scores={suggestions} />
        </div>
      </div>
    </>
  )
}
