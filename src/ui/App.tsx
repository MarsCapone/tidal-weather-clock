import DateDisplay from '@/ui/components/DateDisplay'
import TideTimesChart from '@/ui/components/TideTimesChart'
import { DataContext, TideDataPoints } from '@/types/data'

const demoData: DataContext = {
  tideData: {
    points: [
      {
        type: 'high',
        timestamp: new Date(2025, 4, 2, 10, 30),
      },
      // {
      //   type: 'high',
      //   timestamp: new Date(2025, 4, 2, 22, 45),
      // },
      {
        type: 'low',
        timestamp: new Date(2025, 4, 2, 16, 10),
      },
    ],
  },
  sunData: {
    points: [
      {
        type: 'rise',
        timestamp: new Date(2025, 4, 2, 6, 10),
      },
      {
        type: 'set',
        timestamp: new Date(2025, 4, 2, 20, 45),
      },
    ],
  },
}

export default function App() {
  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <DateDisplay />
      <div className="flex items-center justify-center gap-8">
        <div className="w-2/3">
          <TideTimesChart
            tideData={demoData.tideData!}
            sunData={demoData.sunData!}
          />
        </div>
        <div className="w-1/3">
          <p>
            Wind: <span>12kts</span>
          </p>
          <p>
            Time: <span>2m</span>
          </p>
          <p>
            Weather: <span>sunny</span>
          </p>
          <p>
            Sunrise / Sunset: <span>6am - 9pm</span>
          </p>
        </div>
      </div>
      <div></div>
    </div>
  )
}
