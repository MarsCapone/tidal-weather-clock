import { DataContext } from '@/types/data'
import { formatTime, withFractionalTime } from '@/utils/dates'
import { HighWaterIcon, LowWaterIcon } from '@/ui/components/icons/TideIcon'
import { SunriseIcon, SunsetIcon } from '@/ui/components/icons/SunStateIcon'
import { compareAsc } from 'date-fns'

type TimelineItem = {
  timestamp: Date | null
  label: string
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  additionalLabelClass?: string
}

export default function DayTimeline({
  referenceDate,
  tideData,
  sunData,
  vertical = false,
}: Omit<DataContext, 'weatherData' | 'windData'> & { vertical?: boolean }) {
  const tides = tideData.map((t) => ({
    ...t,
    timestamp: withFractionalTime(referenceDate, t.time),
    label: t.type === 'high' ? 'HW' : 'LW',
    Icon: t.type === 'high' ? HighWaterIcon : LowWaterIcon,
    additionalLabelClass: t.type === 'high' ? 'font-bold' : '',
  }))

  const timelineItems: TimelineItem[] = [
    {
      timestamp: sunData.sunRise,
      Icon: SunriseIcon,
      label: 'Sunrise',
    },
    {
      timestamp: sunData.sunSet,
      Icon: SunsetIcon,
      label: 'Sunset',
    },
    ...tides,
  ]
    .filter(({ timestamp }) => timestamp !== null)
    .toSorted((a, b) => compareAsc(a.timestamp!, b.timestamp!))

  return (
    <ul
      className={`timeline my-2 justify-center ${vertical ? 'timeline-vertical' : 'timeline-horizontal'}`}
    >
      {timelineItems.map(
        ({ timestamp, label, Icon, additionalLabelClass }, i) => (
          <li key={`timeline-item-${i}`}>
            <hr className="bg-primary" />
            <div
              className={`timeline-start text-xs ${additionalLabelClass || ''}`}
            >
              {label}
            </div>
            <div className="timeline-middle rounded-full p-1.5 border-1 border-primary">
              {Icon && <Icon width={20} height={20} />}
            </div>
            <div className="timeline-end timeline-box font-mono">
              {formatTime(timestamp!)}
            </div>
            <hr className="bg-primary" />
          </li>
        ),
      )}
    </ul>
  )
}
