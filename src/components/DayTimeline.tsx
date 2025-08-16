import { SunriseIcon, SunsetIcon } from '@/components/icons/SunStateIcon'
import { HighWaterIcon, LowWaterIcon } from '@/components/icons/TideIcon'
import { TimeZoneContext } from '@/lib/utils/contexts'
import {
  dateOptions,
  formatTime,
  utcDateStringAddFractional,
  utcDateStringToUtc,
} from '@/lib/utils/dates'
import { DataContext } from '@/types/context'
import { compareAsc, parseISO } from 'date-fns'
import { useContext } from 'react'

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

export type DayTimelineProps = {} & Omit<
  DataContext,
  'weatherData' | 'windData'
>

export default function DayTimeline({
  referenceDate,
  sunData,
  tideData,
}: DayTimelineProps) {
  const { timeZone } = useContext(TimeZoneContext)
  const dateFnOptions = { tz: timeZone }
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
    timestamp: utcDateStringToUtc(
      utcDateStringAddFractional(referenceDate, t.time),
    ),
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
      timestamp: parseISO(sunData.sunRise, dateOptions),
    },
    {
      additionalClasses: {
        icon: 'border-secondary bg-secondary text-secondary-content',
        label: 'text-secondary',
        line: 'bg-secondary',
      },
      Icon: SunsetIcon,
      label: 'Sunset',
      timestamp: parseISO(sunData.sunSet, dateOptions),
    },
    ...tides,
  ]
    .filter(({ timestamp }) => timestamp !== null)
    .toSorted((a, b) => compareAsc(a.timestamp!, b.timestamp!))

  return (
    <ul
      className={`timeline timeline-vertical md:timeline-horizontal my-2 justify-center`}
    >
      {timelineItems.map(({ additionalClasses, Icon, label, timestamp }, i) => (
        <li key={`timeline-item-${i}`}>
          <hr className={`${additionalClasses.line || 'bg-primary'}`} />
          <div
            className={`timeline-start w-24 text-xl md:w-16 lg:w-24 xl:w-32 xl:text-2xl ${additionalClasses.label || ''} ${additionalClasses.all || ''}`}
          >
            {label}
          </div>
          <div
            className={`timeline-middle rounded-full border-1 p-1.5 ${additionalClasses.icon || ''} ${additionalClasses.all || ''}`}
          >
            {Icon && (
              <Icon
                className={'h-6 w-6 xl:h-10 xl:w-10'}
                height={20}
                strokeWidth={2}
                width={20}
              />
            )}
          </div>
          <div
            className={`timeline-end timeline-box font-mono ${additionalClasses.time || ''} ${additionalClasses.all || ''}`}
          >
            {formatTime(timestamp!, dateFnOptions)}
          </div>
          <hr className={additionalClasses.line || 'bg-primary'} />
        </li>
      ))}
    </ul>
  )
}
