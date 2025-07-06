import DateDisplay from '@/ui/components/DateDisplay'
import TideTimesChart from '@/ui/components/TideTimesChart'
import { DataContext, TideDataPoints } from '@/types/data'
import { format } from 'date-fns'
import SuggestedActivity from '@/ui/components/SuggestedActivity'
import Header from '@/ui/components/Header'
import DataTable from '@/ui/components/DataTable'

const demoData: DataContext = {
  tideData: {
    points: [
      {
        type: 'high',
        timestamp: new Date(2025, 4, 2, 10, 30),
      },
      {
        type: 'high',
        timestamp: new Date(2025, 4, 2, 22, 45),
      },
      {
        type: 'low',
        timestamp: new Date(2025, 4, 2, 16, 10),
      },
    ],
  },
  sunData: {
    sunRise: new Date(2025, 4, 22, 6, 10),
    sunSet: new Date(2025, 4, 22, 20, 43),
  },
}

export default function App() {
  return (
    <div className="flex flex-col mx-auto p-8 text-center relative z-10 min-w-full md:min-w-0 gap-10">
      <DateDisplay />
      <div className="md:hidden">
        <SuggestedActivity dataContext={demoData} />
      </div>
      <div className="flex-col md:flex-row flex items-center justify-center gap-6">
        <div className="w-full md:w-2/3">
          <TideTimesChart tideData={demoData.tideData!} />
        </div>
        <div className="w-full md:w-1/3">
          <DataTable dataContext={demoData} />
        </div>
      </div>
      <div className="hidden md:flex justify-center gap-8">
        <SuggestedActivity dataContext={demoData} />
      </div>
    </div>
  )
}
