import { DataContext } from '@/types/data'
import { formatTime, withFractionalTime } from '@/utils/dates'
import { WindIcon } from '@/ui/components/icons/WindIcon'
import { calcMean } from '@/utils/utils'
import { CelsiusIcon } from '@/ui/components/icons/TemperatureIcon'
import { SimpleCloudIcon } from '@/ui/components/icons/CloudIcon'
import { SunriseIcon, SunsetIcon } from '@/ui/components/icons/SunStateIcon'
import {
  HighWaterIcon,
  LowWaterIcon,
  TideHeightIcon,
} from '@/ui/components/icons/TideIcon'
import { compareAsc } from 'date-fns'
import { Fragment } from 'react'

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
              key={`${row.label}-${i}`}
              label={row.label}
              Icon={row.Icon}
              values={row.values}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

function WeatherStatusRow({ label, Icon, values }: DataTableRow) {
  return (
    <li className="list-row items-center">
      <div>{Icon && <Icon width={36} height={36} />}</div>
      <div>
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
  label: string
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  values: (string | undefined)[]
}

function getDataTable(dataContext: DataContext): DataTableRow[] {
  const tides = dataContext.tideData.map((t) => ({
    ...t,
    display: formatTime(withFractionalTime(dataContext.referenceDate, t.time)),
  }))

  const highTides = tides.filter((t) => t.type === 'high')
  const lowTides = tides.filter((t) => t.type === 'low')

  const windSpeeds = dataContext.windData.points.map((p) => p.speed)
  const cloudiness = dataContext.weatherData.points.map((p) => p.cloudCover)
  const temperature = dataContext.weatherData.points.map((p) => p.temperature)

  return [
    {
      label: 'Wind',
      Icon: WindIcon,
      values: [
        windSpeeds.length > 0
          ? `${calcMean(windSpeeds).toFixed(1)} kts`
          : undefined,
      ],
    },
    {
      label: 'Temperature',
      Icon: CelsiusIcon,
      values: [
        temperature.length > 0
          ? `${calcMean(temperature).toFixed(1)}°C`
          : undefined,
      ],
    },
    {
      label: 'Cloudiness',
      Icon: SimpleCloudIcon,
      values: [
        cloudiness.length > 0
          ? `${calcMean(cloudiness).toFixed(1)}%`
          : undefined,
      ],
    },
    {
      label: 'Sunrise',
      Icon: SunriseIcon,
      values: [
        dataContext.sunData.sunRise
          ? formatTime(dataContext.sunData.sunRise)
          : undefined,
      ],
    },
    {
      label: 'Sunset',
      Icon: SunsetIcon,
      values: [
        dataContext.sunData.sunSet
          ? formatTime(dataContext.sunData.sunSet)
          : undefined,
      ],
    },
    {
      label: 'HW',
      Icon: HighWaterIcon,
      values: highTides.map((t) => t.display),
    },
    { label: 'LW', Icon: LowWaterIcon, values: lowTides.map((t) => t.display) },
    {
      label: 'Tide Heights',
      Icon: TideHeightIcon,
      values: [...tides.map((t) => `${t.height.toFixed(1)}m`)],
    },
  ]
}
