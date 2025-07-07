import DateDisplay from '@/ui/components/DateDisplay'
import TideTimesChart from '@/ui/components/TideTimesChart'
import { DataContext, TideDataPoints } from '@/types/data'
import SuggestedActivity from '@/ui/components/SuggestedActivity'
import DataTable from '@/ui/components/DataTable'
import {
  addDays,
  addWeeks,
  endOfDay,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns'
import { useLoaderData, useNavigate, useParams } from 'react-router'

const demoData: DataContext = {
  tideData: {
    points: [
      {
        type: 'high',
        height: 1.8,
        timestamp: new Date(2025, 4, 22, 10, 30),
      },
      {
        type: 'high',
        height: 2.0,
        timestamp: new Date(2025, 4, 22, 22, 45),
      },
      {
        type: 'low',
        height: 0.7,
        timestamp: new Date(2025, 4, 22, 16, 10),
      },
    ],
  },
  sunData: {
    sunRise: new Date(2025, 4, 22, 6, 10),
    sunSet: new Date(2025, 4, 22, 20, 43),
  },
}

function AppContent({ date }: { date: Date }) {
  const suggestedActivity = (
    <SuggestedActivity dataContext={demoData} date={date} />
  )

  return (
    <div className="flex flex-col mx-auto p-8 text-center relative z-10 min-w-full md:min-w-0 gap-10">
      <DateDisplay date={date} />
      <div className="md:hidden">{suggestedActivity}</div>
      <div className="flex-col md:flex-row flex items-center justify-center gap-6">
        <div className="w-full md:w-2/3">
          <TideTimesChart tideData={demoData.tideData!} />
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

export default function App() {
  const { date } = useLoaderData()

  return <AppContent date={date} />
}
