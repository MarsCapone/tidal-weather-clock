import { SimpleCloudIcon } from '@/components/icons/CloudIcon'
import { SunriseIcon, SunsetIcon } from '@/components/icons/SunStateIcon'
import { CelsiusIcon } from '@/components/icons/TemperatureIcon'
import {
  HighWaterIcon,
  LowWaterIcon,
  TideHeightIcon,
} from '@/components/icons/TideIcon'
import { WindIcon } from '@/components/icons/WindIcon'
import { DataContext } from '@/types/context'
import { formatTime, withFractionalTime } from '@/utils/dates'
import { calcMean } from '@/utils/math'
import { mpsToKnots } from '@/utils/units'
import { parseISO } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
} from 'lucide-react'
import React from 'react'

export default function WeatherStatus({
  dataContext,
}: {
  dataContext: DataContext
}) {
  const dataTable = getDataTable(dataContext)

  return (
    <div className="card card-lg shadow-sm">
      <div className="card-body">
        <div className="card-title">Weather Status</div>
        <ul className="list list-unstyled">
          {dataTable.map((row, i) => (
            <WeatherStatusRow
              Icon={row.Icon}
              key={`${row.label}-${i}`}
              label={row.label}
              values={row.values}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

function WeatherStatusRow({ Icon, label, values }: DataTableRow) {
  return (
    <li className="list-row items-center">
      <div className="list-col-grow flex flex-row items-center justify-start gap-x-2 md:flex-col lg:flex-row">
        {Icon && (
          <div>
            <Icon height={36} width={36} />
          </div>
        )}
        <div>{label}</div>
      </div>
      <div>
        <ul>
          {values
            .filter((v) => v !== undefined)
            .map((value, i) => (
              <li key={`${label}-${i}`}>{value}</li>
            ))}
        </ul>
      </div>
    </li>
  )
}

type DataTableRow = {
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  values: (string | undefined | React.ReactNode)[]
}

function getDataTable(dataContext: DataContext): DataTableRow[] {
  const tides = dataContext.tideData.map((t) => ({
    ...t,
    display: formatTime(withFractionalTime(dataContext.referenceDate, t.time)),
  }))

  const highTides = tides.filter((t) => t.type === 'high')
  const lowTides = tides.filter((t) => t.type === 'low')

  const windSpeeds = dataContext.windData.points.map((p) => mpsToKnots(p.speed))
  const cloudiness = dataContext.weatherData.points.map((p) => p.cloudCover)
  const temperature = dataContext.weatherData.points.map((p) => p.temperature)

  const directionToIcon = (direction: number) => {
    if (direction >= 337.5 || direction < 22.5) {
      return ArrowUpIcon
    }
    if (direction >= 22.5 && direction < 67.5) {
      return ArrowUpLeftIcon
    }
    if (direction >= 67.5 && direction < 112.5) {
      return ArrowLeftIcon
    }
    if (direction >= 112.5 && direction < 157.5) {
      return ArrowDownLeftIcon
    }
    if (direction >= 157.5 && direction < 202.5) {
      return ArrowDownIcon
    }
    if (direction >= 202.5 && direction < 247.5) {
      return ArrowDownRightIcon
    }
    if (direction >= 247.5 && direction < 292.5) {
      return ArrowRightIcon
    }
    if (direction >= 292.5 && direction < 337.5) {
      return ArrowUpRightIcon
    }
    return 'div'
  }

  const WindDirectionIcon = dataContext.windData.dominantDirection
    ? directionToIcon(dataContext.windData.dominantDirection)
    : null

  return [
    {
      Icon: WindIcon,
      label: 'Wind',
      values: [
        windSpeeds.length > 0
          ? `${calcMean(windSpeeds).toFixed(1)} kts`
          : undefined,
        <div key={'wind'} className="flex flex-row items-center gap-x-1">
          {WindDirectionIcon && <WindDirectionIcon className="h-4 w-4" />}
          {dataContext.windData.dominantDirection}°
        </div>,
      ],
    },
    {
      Icon: CelsiusIcon,
      label: 'Temperature',
      values: [
        temperature.length > 0
          ? `${calcMean(temperature).toFixed(1)}°C`
          : undefined,
      ],
    },
    {
      Icon: SimpleCloudIcon,
      label: 'Cloudiness',
      values: [
        cloudiness.length > 0
          ? `${calcMean(cloudiness).toFixed(1)}%`
          : undefined,
      ],
    },
    {
      Icon: SunriseIcon,
      label: 'Sunrise',
      values: [
        dataContext.sunData.sunRise
          ? formatTime(
              typeof dataContext.sunData.sunRise === 'string'
                ? parseISO(dataContext.sunData.sunRise)
                : dataContext.sunData.sunRise,
            )
          : undefined,
      ],
    },
    {
      Icon: SunsetIcon,
      label: 'Sunset',
      values: [
        dataContext.sunData.sunSet
          ? formatTime(
              typeof dataContext.sunData.sunSet === 'string'
                ? parseISO(dataContext.sunData.sunSet)
                : dataContext.sunData.sunSet,
            )
          : undefined,
      ],
    },
    {
      Icon: HighWaterIcon,
      label: 'HW',
      values: highTides.map((t) => t.display),
    },
    { Icon: LowWaterIcon, label: 'LW', values: lowTides.map((t) => t.display) },
    {
      Icon: TideHeightIcon,
      label: 'Tide Heights',
      values: tides.map((t) => `${t.height.toFixed(2)}m`),
    },
  ]
}
