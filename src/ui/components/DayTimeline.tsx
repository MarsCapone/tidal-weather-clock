import { DataContext } from '@/types/context'
import { formatTime, withFractionalTime } from '@/ui/utils/dates'
import { HighWaterIcon, LowWaterIcon } from '@/ui/components/icons/TideIcon'
import { SunriseIcon, SunsetIcon } from '@/ui/components/icons/SunStateIcon'
import { compareAsc, parseISO } from 'date-fns'

type TimelineItem = {
  additionalClasses: {
    all?: string
    icon?: string
    label?: string
    line?: string
    time?: string
  }
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  timestamp: Date | null
}

export type DayTimelineProps = {
  vertical?: boolean
} & Omit<DataContext, 'weatherData' | 'windData'>

export default function DayTimeline({
  referenceDate,
  sunData,
  tideData,
  vertical = false,
}: DayTimelineProps) {
  const tides = tideData.map((t) => ({
    ...t,
    additionalClasses:
      t.type == 'high'
        ? {
            icon: 'border-success bg-success text-secondary-content',
            label: 'text-success',
            line: 'bg-success',
          }
        : {
            icon: 'border-error bg-error text-secondary-content',
            label: 'text-error',
            line: 'bg-error',
          },
    Icon: t.type === 'high' ? HighWaterIcon : LowWaterIcon,
    label: t.type === 'high' ? 'HW' : 'LW',
    timestamp: withFractionalTime(referenceDate, t.time),
  }))

  const timelineItems: TimelineItem[] = [
    {
      additionalClasses: {
        icon: 'border-secondary bg-secondary text-secondary-content',
        label: 'text-secondary',
        line: 'bg-secondary',
      },
      Icon: SunriseIcon,
      label: 'Sunrise',
      timestamp: sunData.sunRise,
    },
    {
      additionalClasses: {
        icon: 'border-secondary bg-secondary text-secondary-content',
        label: 'text-secondary',
        line: 'bg-secondary',
      },
      Icon: SunsetIcon,
      label: 'Sunset',
      timestamp: sunData.sunSet,
    },
    ...tides,
  ]
    .filter(({ timestamp }) => timestamp !== null)
    .map((item) => ({
      ...item,
      timestamp:
        typeof item.timestamp === 'string'
          ? parseISO(item.timestamp)
          : item.timestamp,
    }))
    .toSorted((a, b) => compareAsc(a.timestamp!, b.timestamp!))

  return (
    <ul
      className={`timeline timeline-vertical sm:timeline-horizontal my-2 justify-center ${vertical ? 'timeline-vertical' : 'timeline-horizontal'}`}
    >
      {timelineItems.map(({ additionalClasses, Icon, label, timestamp }, i) => (
        <li key={`timeline-item-${i}`}>
          <hr className={`${additionalClasses.line || 'bg-primary'}`} />
          <div
            className={`timeline-start text-xl w-24 xl:text-2xl xl:w-32 ${additionalClasses.label || ''} ${additionalClasses.all || ''}`}
          >
            {label}
          </div>
          <div
            className={`timeline-middle rounded-full p-1.5 border-1 ${additionalClasses.icon || ''} ${additionalClasses.all || ''}`}
          >
            {Icon && (
              <Icon
                className={'w-6 h-6 xl:w-10 xl:h-10'}
                height={20}
                strokeWidth={2}
                width={20}
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
