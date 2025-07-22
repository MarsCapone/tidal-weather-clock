import { DataContext } from '@/types/context'
import { formatTime, withFractionalTime } from '@/ui/utils/dates'
import { WindIcon } from '@/ui/components/icons/WindIcon'
import { calcMean } from '@/ui/utils/math'
import { CelsiusIcon } from '@/ui/components/icons/TemperatureIcon'
import { SimpleCloudIcon } from '@/ui/components/icons/CloudIcon'
import { SunriseIcon, SunsetIcon } from '@/ui/components/icons/SunStateIcon'
import {
  HighWaterIcon,
  LowWaterIcon,
  TideHeightIcon,
} from '@/ui/components/icons/TideIcon'
import { parseISO } from 'date-fns'

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
      <div>{Icon && <Icon height={36} width={36} />}</div>
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
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
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
      Icon: WindIcon,
      label: 'Wind',
      values: [
        windSpeeds.length > 0
          ? `${calcMean(windSpeeds).toFixed(1)} kts`
          : undefined,
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
      values: tides.map((t) => `${t.height.toFixed(1)}m`),
    },
  ]
}
