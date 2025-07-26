'use client'

import ActivityScoreList from '@/components/ActivityScoreList'
import DatePagination from '@/components/DatePagination'
import DayTimeline from '@/components/DayTimeline'
import SuggestedActivity from '@/components/SuggestedActivity'
import TideTimesChart from '@/components/TideTimesChart'
import WeatherStatus from '@/components/WeatherStatus'
import { EXAMPLE_DATA } from '@/constants'
import { DateInfo } from '@/hooks/useDateString'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { DataContext } from '@/types/context'
import { LocalStorageCache } from '@/utils/cache'
import tryDataFetchersWithCache, { ServerDataFetcher } from '@/utils/fetchData'
import logger from '@/utils/logger'
import { ActivityRecommender } from '@/utils/suggestions'
import { formatISO, startOfDay } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSwipeable } from 'react-swipeable'

const clientCache = new LocalStorageCache<DataContext>()
const dialogId = 'activity-explanation-dialog'

export function MainContent({ date, nextPath, prevPath }: DateInfo) {
  const ff = useFeatureFlags()
  const [dataContext, setDataContext] = useState<DataContext | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  // const navigate = useNavigate()
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
  const [selectionIndex, setSelectionIndex] = useState(0)

  useEffect(() => {
    tryDataFetchersWithCache(
      logger,
      startOfDay(date),
      [new ServerDataFetcher(logger)],
      clientCache,
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
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl">Loading data...</h1>
        <span className="loading loading-dots loading-lg"></span>
      </div>
    )
  }

  if (dataContext === null || dataContext === undefined) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-3xl">No data context available</h1>
        <button className="btn btn-warning rounded-md">
          <Link href="/">Back to Today</Link>
        </button>
      </div>
    )
  }

  const suggestions = new ActivityRecommender(
    dataContext,
  ).getRecommendedActivities(EXAMPLE_DATA.Activities)

  return (
    <div
      {...handlers}
      className="mx-auto flex min-w-full flex-col gap-10 p-8 text-center md:min-w-0"
    >
      <DatePagination date={date} nextPath={nextPath} prevPath={prevPath} />
      <div>
        {ff.showSuggestedActivity && (
          <SuggestedActivity
            className={'md:hidden'}
            index={selectionIndex}
            setIndex={setSelectionIndex}
            suggestions={suggestions}
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
              sunData={dataContext.sunData}
              tideData={dataContext.tideData}
            />
          </div>
          <div className="w-full md:w-1/3">
            {ff.showSuggestedActivity && (
              <SuggestedActivity
                className="mb-4 hidden md:flex"
                index={selectionIndex}
                setIndex={setSelectionIndex}
                suggestions={suggestions}
              />
            )}
            <WeatherStatus dataContext={dataContext} />
          </div>
        </div>
        <div className="my-8">
          <ActivityScoreList scores={suggestions} />
        </div>
      </div>
    </div>
  )
}
