import { DataContext } from '@/types/data'
import { formatTime, withFractionalTime } from '@/utils/dates'
import { HighWaterIcon, LowWaterIcon } from '@/ui/components/icons/TideIcon'
import { SunriseIcon, SunsetIcon } from '@/ui/components/icons/SunStateIcon'
import { compareAsc } from 'date-fns'

type TimelineItem = {
  timestamp: Date | null
  label: string
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  additionalClasses: {
    label?: string
    icon?: string
    time?: string
    line?: string
    all?: string
  }
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
    additionalClasses:
      t.type == 'high'
        ? {
            label: 'text-success',
            icon: 'border-success bg-success text-secondary-content',
            line: 'bg-success',
          }
        : {
            label: 'text-error',
            icon: 'border-error bg-error text-secondary-content',
            line: 'bg-error',
          },
  }))

  const timelineItems: TimelineItem[] = [
    {
      timestamp: sunData.sunRise,
      Icon: SunriseIcon,
      label: 'Sunrise',
      additionalClasses: {
        label: 'text-secondary',
        icon: 'border-secondary bg-secondary text-secondary-content',
        line: 'bg-secondary',
      },
    },
    {
      timestamp: sunData.sunSet,
      Icon: SunsetIcon,
      label: 'Sunset',
      additionalClasses: {
        label: 'text-secondary',
        icon: 'border-secondary bg-secondary text-secondary-content',
        line: 'bg-secondary',
      },
    },
    ...tides,
  ]
    .filter(({ timestamp }) => timestamp !== null)
    .toSorted((a, b) => compareAsc(a.timestamp!, b.timestamp!))

  return (
    <ul
      className={`timeline my-2 justify-center ${vertical ? 'timeline-vertical' : 'timeline-horizontal'}`}
    >
      {timelineItems.map(({ timestamp, label, Icon, additionalClasses }, i) => (
        <li key={`timeline-item-${i}`}>
          <hr className={`${additionalClasses.line || 'bg-primary'}`} />
          <div
            className={`timeline-start text-xs lg:w-24 lg:text-xl xl:text-2xl xl:w-32 ${additionalClasses.label || ''} ${additionalClasses.all || ''}`}
          >
            {label}
          </div>
          <div
            className={`timeline-middle rounded-full p-1.5 border-1 ${additionalClasses.icon || ''} ${additionalClasses.all || ''}`}
          >
            {Icon && (
              <Icon
                width={20}
                height={20}
                strokeWidth={2}
                className={'w-6 h-6 xl:w-10 xl:h-10'}
              />
            )}
          </div>
          <div
            className={`timeline-end timeline-box font-mono ${additionalClasses.time || ''} ${additionalClasses.all || ''}`}
          >
            {formatTime(timestamp!)}
          </div>
          <hr className={additionalClasses.line || 'bg-primary'} />
        </li>
      ))}
    </ul>
  )
}
