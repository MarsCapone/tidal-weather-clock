import TideTimesChart from '@/ui/components/TideTimesChart'

import { useLoaderData, useNavigate } from 'react-router'
import React, { useEffect, useState } from 'react'
import tryDataFetchersWithCache, {
  ServerDataFetcher,
} from '@/ui/utils/fetchData'
import { DataContext } from '@/types/context'
import { useSwipeable } from 'react-swipeable'
import { useFeatureFlags } from '@/ui/hooks/useFeatureFlags'
import { formatISO } from 'date-fns'
import logger from '@/ui/utils/logger'
import { LocalStorageCache } from '@/ui/utils/cache'
import DatePagination from '../components/DatePagination'
import WeatherStatus from '@/ui/components/WeatherStatus'
import DayTimeline from '@/ui/components/DayTimeline'
import SuggestedActivity from '@/ui/components/SuggestedActivity'
import { Activity } from '@/types/claude'
import { ActivityRecommender } from '@/ui/utils/suggestions'
import ActivityScoreList from '@/ui/components/ActivityScoreList'

const clientCache = new LocalStorageCache<DataContext>()
const dialogId = 'activity-explanation-dialog'
export default function Home() {
  const ff = useFeatureFlags()
  const { date, nextPath, prevPath } = useLoaderData()
  const [dataContext, setDataContext] = useState<DataContext | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const navigate = useNavigate()
  const handlers = useSwipeable({
    onSwiped: ({ dir }) => {
      // swipe left means you want to see what's on the right, i.e. next
      if (nextPath && dir === 'Left') {
        navigate(nextPath)
      }
      if (prevPath && dir === 'Right') {
        navigate(prevPath)
      }
    },
  })
  const [selectionIndex, setSelectionIndex] = useState(0)

  useEffect(() => {
    tryDataFetchersWithCache(
      logger,
      date,
      [new ServerDataFetcher(logger)],
      clientCache,
      (lat, lng, date) =>
        `[${lat},${lng}]-${formatISO(date, { representation: 'date' })}`,
    ).then((dc) => {
      if (dc === null) {
        logger.warn('final data context is null')
      }
      logger.info('setting data context')
      setDataContext(dc)
      setIsLoading(false)
    })
  }, [date])

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl">Loading data...</h1>
        <span className="loading loading-dots loading-lg"></span>
      </div>
    )
  }

  if (dataContext === null) {
    return (
      <div>
        <h1 className="text-3xl">No data context available</h1>
      </div>
    )
  }

  const exampleActivities: Activity[] = [
    {
      constraints: [
        { type: 'wind' },
        { maxCloudCover: 80, type: 'weather' },
        { requiresDaylight: true, type: 'sun' },
        { earliestHour: 8, latestHour: 18, type: 'time' },
      ],
      description: 'Recreational sailing',
      duration: 3,
      id: 'sailing',
      name: 'Sailing',
      priority: 7,
    },
    {
      constraints: [
        { preferredStates: ['rising', 'high'], type: 'tide' },
        {
          directionTolerance: 45,
          maxSpeed: 12,
          preferredDirections: [270, 225],
          type: 'wind',
        },
        { requiresDaylight: true, type: 'sun' },
        { minTemperature: 12, type: 'weather' },
      ],
      description: 'Surf session',
      duration: 2,
      id: 'surfing',
      name: 'Surfing',
      priority: 8,
    },
    {
      constraints: [
        { requiresDarkness: true, type: 'sun' },
        { maxCloudCover: 30, type: 'weather' },
        { maxSpeed: 8, type: 'wind' },
        { earliestHour: 21, type: 'time' },
      ],
      description: 'Astronomical observation',
      duration: 2,
      id: 'stargazing',
      name: 'Stargazing',
      priority: 5,
    },
    {
      constraints: [
        { preferredStates: ['rising', 'falling'], type: 'tide' },
        { maxSpeed: 10, type: 'wind' },
        { preferredHours: [6, 7, 18, 19, 20], type: 'time' },
      ],
      description: 'Shore fishing',
      duration: 4,
      id: 'fishing',
      name: 'Fishing',
      priority: 6,
    },
  ]

  const suggestions = new ActivityRecommender(
    dataContext,
  ).getRecommendedActivities(exampleActivities)

  return (
    <div
      {...handlers}
      className="flex flex-col mx-auto p-8 text-center min-w-full md:min-w-0 gap-10"
    >
      <DatePagination date={date} nextPath={nextPath} prevPath={prevPath} />
      <div>
        {ff.showSuggestedActivity && (
          <SuggestedActivity
            dialogId={dialogId}
            suggestions={suggestions}
            index={selectionIndex}
            setIndex={setSelectionIndex}
            className={'md:hidden'}
          />
        )}
        <div className="flex-col md:flex-row flex items-start justify-center gap-6">
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
                dialogId={dialogId}
                suggestions={suggestions}
                index={selectionIndex}
                setIndex={setSelectionIndex}
                className="hidden md:flex mb-4"
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
