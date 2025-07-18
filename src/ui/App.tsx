import DateDisplay from '@/ui/components/DateDisplay'
import TideTimesChart from '@/ui/components/TideTimesChart'
import SuggestedActivity from '@/ui/components/SuggestedActivity'
import DataTable from '@/ui/components/DataTable'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

import { Link, useLoaderData, useNavigate } from 'react-router'
import React, { useEffect, useState } from 'react'
import tryDataFetchersWithCache, {
  ServerDataFetcher,
  DemoStormglassDataFetcher,
  StormglassDataFetcher,
} from '@/utils/fetchData'
import { DataContext } from '@/types/data'
import CONSTANTS, { Activities } from './constants'
import { useSwipeable } from 'react-swipeable'
import { useFeatureFlags } from '@/utils/featureFlags'
import { formatISO } from 'date-fns'
import logger from '@/ui/logger'
import { LocalStorageCache } from '@/utils/cache'
import DatePagination from './components/DatePagination'

const clientCache = new LocalStorageCache()

function AppContent({
  date,
  dataContext,
}: {
  date: Date
  dataContext: DataContext | null
}) {
  const featureFlags = useFeatureFlags()

  if (dataContext === null) {
    return (
      <div className="text-3xl">
        <h1>No data context...</h1>
      </div>
    )
  }

  const suggestedActivity = featureFlags.showSuggestedActivity ? (
    <SuggestedActivity
      dataContext={dataContext || {}}
      date={date}
      activities={Activities}
    />
  ) : null

  return (
    <div>
      <div className="md:hidden">{suggestedActivity}</div>
      <div className="flex-col md:flex-row flex items-center justify-center gap-6">
        <div className="w-full md:w-2/3">
          <TideTimesChart
            key={date.toDateString()}
            tideData={dataContext.tideData}
          />
        </div>
        <div className="w-full md:w-1/3">
          <DataTable key={date.toDateString()} dataContext={dataContext} />
          <div className="hidden lg:flex mt-8">{suggestedActivity}</div>
        </div>
      </div>
      <div className="hidden md:flex lg:hidden justify-center gap-8">
        {suggestedActivity}
      </div>
    </div>
  )
}

export default function App() {
  const { date, nextPath, prevPath } = useLoaderData()
  const [dataContext, setDataContext] = useState<DataContext | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const navigate = useNavigate()
  const handlers = useSwipeable({
    onSwiped: ({ dir }) => {
      // swipe left means you want to see what's on the right, i.e. next
      if (nextPath && dir === 'Left') navigate(nextPath)
      if (prevPath && dir === 'Right') navigate(prevPath)
    },
  })

  useEffect(() => {
    tryDataFetchersWithCache(
      logger,
      date,
      [
        new ServerDataFetcher(logger),
        // new StormglassDataFetcher(logger),
        new DemoStormglassDataFetcher(logger),
      ],
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
      <div>
        <h1 className="text-3xl">Loading data...</h1>
      </div>
    )
  }

  return (
    <div
      {...handlers}
      className="flex flex-col mx-auto p-8 text-center min-w-full md:min-w-0 gap-10"
    >
      <DatePagination nextPath={nextPath} prevPath={prevPath} date={date} />
      <AppContent date={date} dataContext={dataContext} />
    </div>
  )
}
