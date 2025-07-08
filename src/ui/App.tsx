import DateDisplay from '@/ui/components/DateDisplay'
import TideTimesChart from '@/ui/components/TideTimesChart'
import SuggestedActivity from '@/ui/components/SuggestedActivity'
import DataTable from '@/ui/components/DataTable'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

import { Link, redirect, useLoaderData, useNavigate } from 'react-router'
import React, { useEffect, useState } from 'react'
import { StormglassDataFetcher, DataContextFetcher } from '@/utils/fetchData'
import { DataContext } from '@/types/data'
import CONSTANTS, { Activities } from './constants'
import { useSwipeable } from 'react-swipeable'
import { useFeatureFlags } from '@/utils/hooks'

function AppContent({
  date,
  dataFetcher,
}: {
  date: Date
  dataFetcher: DataContextFetcher
}) {
  const [data, setData] = useState<DataContext | null>(null)
  const [isLoading, setLoading] = useState<boolean>(true)
  const featureFlags = useFeatureFlags()

  useEffect(() => {
    dataFetcher.getDataContext(date).then((data) => {
      setData(data)
      setLoading(false)
    })
  }, [date])

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl">Loading data...</h1>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="text-3xl">
        <h1>No data context...</h1>
      </div>
    )
  }

  const suggestedActivity = featureFlags.showSuggestedActivity ? (
    <SuggestedActivity dataContext={data} date={date} activities={Activities} />
  ) : null

  return (
    <div>
      <div className="md:hidden">{suggestedActivity}</div>
      <div className="flex-col md:flex-row flex items-center justify-center gap-6">
        <div className="w-full md:w-2/3">
          <TideTimesChart key={date.toDateString()} tideData={data.tideData} />
        </div>
        <div className="w-full md:w-1/3">
          <DataTable key={date.toDateString()} dataContext={data} />
          <div className="hidden lg:flex mt-8">{suggestedActivity}</div>
        </div>
      </div>
      <div className="hidden md:flex lg:hidden justify-center gap-8">
        {suggestedActivity}
      </div>
    </div>
  )
}

function NextPageButton({
  path,
  Icon,
}: {
  path: string
  Icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="hidden sm:block">
      <Link to={path}>
        <button
          disabled={path === null}
          className={`rounded-md bg-background aspect-square p-2 ${path === null ? 'cursor-default' : 'hover:bg-muted hover:shadow-md'}`}
        >
          <Icon
            className={`size-full sm:size-24 md:size-10 ${path === null ? 'text-background' : ''}`}
          />
        </button>
      </Link>
    </div>
  )
}

export default function App() {
  const { date, nextPath, prevPath } = useLoaderData()
  const navigate = useNavigate()
  const handlers = useSwipeable({
    onSwiped: ({ dir }) => {
      console.log(`Swiped ${dir}`)
      // swipe left means you want to see what's on the right, i.e. next
      if (nextPath && dir === 'Left') navigate(nextPath)
      if (prevPath && dir === 'Right') navigate(prevPath)
    },
  })

  const stormglass = new StormglassDataFetcher(CONSTANTS.LOCATION_COORDS)

  return (
    <div
      {...handlers}
      className="flex flex-col mx-auto p-8 text-center min-w-full md:min-w-0 gap-10"
    >
      <div className="flex justify-center px-20 gap-x-2">
        <NextPageButton path={prevPath} Icon={ChevronLeftIcon} />
        <div className="py-2">
          <DateDisplay date={date} location={CONSTANTS.LOCATION_NAME} />
        </div>
        <NextPageButton path={nextPath} Icon={ChevronRightIcon} />
      </div>
      <AppContent date={date} dataFetcher={stormglass} />
    </div>
  )
}
