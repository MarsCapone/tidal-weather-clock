import DateDisplay from '@/ui/components/DateDisplay'
import TideTimesChart from '@/ui/components/TideTimesChart'
import { DataContext } from '@/types/data'
import SuggestedActivity from '@/ui/components/SuggestedActivity'
import DataTable from '@/ui/components/DataTable'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

import { Link, useLoaderData, useNavigate } from 'react-router'
import { startOfDay } from 'date-fns'
import React, { HTMLProps } from 'react'

function AppContent({ date }: { date: Date }) {
  const demoData: DataContext = {
    referenceDate: startOfDay(date),
    sunData: {
      sunRise: new Date(2025, 4, 22, 6, 10),
      sunSet: new Date(2025, 4, 22, 20, 43),
    },
    tideData: [
      {
        height: 1.8,
        time: 10.5,
        type: 'high',
      },
      {
        height: 2.0,
        time: 22.75,
        type: 'high',
      },
      {
        height: 0.7,
        time: 16 + 10 / 60,
        type: 'low',
      },
    ],
    weatherData: { points: [] },
    windData: { points: [] },
  }

  const suggestedActivity = (
    <SuggestedActivity dataContext={demoData} date={date} />
  )

  return (
    <div>
      <div className="md:hidden">{suggestedActivity}</div>
      <div className="flex-col md:flex-row flex items-center justify-center gap-6">
        <div className="w-full md:w-2/3">
          <TideTimesChart tideData={demoData.tideData} />
        </div>
        <div className="w-full md:w-1/3">
          <DataTable dataContext={demoData} />
        </div>
      </div>
      <div className="hidden md:flex justify-center gap-8">
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
  )
}

export default function App() {
  const { date, nextPath, prevPath } = useLoaderData()

  return (
    <div className="flex flex-col mx-auto p-8 text-center min-w-full md:min-w-0 gap-10">
      <div className="flex justify-between px-20 gap-x-2">
        <NextPageButton path={prevPath} Icon={ChevronLeftIcon} />
        <div className="py-2">
          <DateDisplay date={date} />
        </div>
        <NextPageButton path={nextPath} Icon={ChevronRightIcon} />
      </div>
      <AppContent date={date} />
    </div>
  )
}
