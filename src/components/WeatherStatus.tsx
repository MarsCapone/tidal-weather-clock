import { SimpleCloudIcon } from '@/components/icons/CloudIcon'
import { SunriseIcon, SunsetIcon } from '@/components/icons/SunStateIcon'
import { CelsiusIcon } from '@/components/icons/TemperatureIcon'
import { HighWaterIcon, LowWaterIcon } from '@/components/icons/TideIcon'
import { WindIcon } from '@/components/icons/WindIcon'
import { TimeZoneContext } from '@/lib/utils/contexts'
import { utcDateStringToLocalTimeString } from '@/lib/utils/dates'
import { calcMean } from '@/lib/utils/math'
import { mpsToKnots } from '@/lib/utils/units'
import { DataContext } from '@/types/context'
import { ArrowBigUpIcon } from 'lucide-react'
import React, { useContext } from 'react'

export default function WeatherStatus({
  dataContext,
}: {
  dataContext: DataContext
}) {
  const { timeZone } = useContext(TimeZoneContext)
  const dataTable = getDataTable(dataContext, timeZone)

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
        <div data-testid="weather-status-label">{label}</div>
      </div>
      <div>
        <ul data-testid={`${label}-value`}>
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

function getDataTable(
  dataContext: DataContext,
  timeZone: string,
): DataTableRow[] {
  const dateFnOptions = { tz: timeZone }
  const tides = dataContext.tideData.map((t) => ({
    ...t,
    display: () => {
      const timeString = utcDateStringToLocalTimeString(
        t.timestamp,
        dateFnOptions,
      )
      return (
        <div className={'flex flex-row items-center justify-between gap-x-2'}>
          <span>{timeString}</span>
          {t.height === 0 ? (
            <span>approx.</span>
          ) : (
            <span>({t.height.toFixed(1)} m)</span>
          )}
        </div>
      )
    },
  }))

  const highTides = tides.filter((t) => t.type === 'high')
  const lowTides = tides.filter((t) => t.type === 'low')

  const windSpeeds = dataContext.windData.points.map((p) => mpsToKnots(p.speed))
  const cloudiness = dataContext.weatherData.points.map((p) => p.cloudCover)
  const temperature = dataContext.weatherData.points.map((p) => p.temperature)

  const dominantWindDirection = dataContext.windData.dominantDirection

  const cloudinessMean =
    cloudiness.length > 0 ? calcMean(cloudiness) : undefined

  return [
    {
      Icon: WindIcon,
      label: 'Wind',
      values: [
        windSpeeds.length > 0
          ? `${calcMean(windSpeeds).toFixed(1)} kts`
          : undefined,
        <div key={'wind'} className="flex flex-row items-center gap-x-1">
          {dominantWindDirection && (
            <>
              <ArrowBigUpIcon
                className={`fill-accent h-4 w-4`}
                style={{ rotate: `${dominantWindDirection + 180}deg` }}
              />
              {describeWindDirection(dominantWindDirection, true)}
            </>
          )}
        </div>,
      ],
    },
    {
      Icon: CelsiusIcon,
      label: 'Temperature',
      values: [
        temperature.length > 0
          ? `${calcMean(temperature).toFixed(1)}ºC`
          : undefined,
      ],
    },
    {
      Icon: SimpleCloudIcon,
      label: 'Cloudiness',
      values: [describeCloudiness(cloudinessMean)],
    },
    {
      Icon: SunriseIcon,
      label: 'Sunrise',
      values: [
        dataContext.sunData.sunRise
          ? utcDateStringToLocalTimeString(
              dataContext.sunData.sunRise,
              dateFnOptions,
            )
          : undefined,
      ],
    },
    {
      Icon: SunsetIcon,
      label: 'Sunset',
      values: [
        dataContext.sunData.sunSet
          ? utcDateStringToLocalTimeString(
              dataContext.sunData.sunSet,
              dateFnOptions,
            )
          : undefined,
      ],
    },
    {
      Icon: HighWaterIcon,
      label: 'HW',
      values: highTides.map((t) => t.display()),
    },
    {
      Icon: LowWaterIcon,
      label: 'LW',
      values: lowTides.map((t) => t.display()),
    },
  ]
}

/*
Here's a more detailed breakdown:
Clear: Less than 1/8 (or 12.5%) cloud cover.
Few: 1/8 to 2/8 (12.5% to 25%) cloud cover.
Scattered: 3/8 to 4/8 (37.5% to 50%) cloud cover.
Broken: 5/8 to 7/8 (62.5% to 87.5%) cloud cover.
Overcast: 8/8 (100%) cloud cover.
In addition to these, terms like "mostly clear" and "mostly cloudy" are also used, typically corresponding to ranges like 10-30% and 70-80% cloud cover respectively, according to Spectrum News.
 */
export function describeCloudiness(cloudCover: number | undefined): string {
  if (cloudCover === undefined) {
    return 'Unknown'
  }
  if (cloudCover < 12.5) {
    return 'Clear'
  }
  if (cloudCover < 25) {
    return 'Mostly Clear'
  }
  if (cloudCover < 50) {
    return 'Scattered Clouds'
  }
  if (cloudCover < 87.5) {
    return 'Mostly Cloudy'
  }
  return 'Overcast'
}

export function describeWindDirection(
  direction: number,
  includeDegrees: boolean = true,
): string {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

  const val = Math.round((direction * points.length) / 360)

  const cardinal = points[(val + points.length) % points.length]

  if (!includeDegrees) {
    return cardinal
  }
  return `${cardinal} (${direction}º)`
}

export function describeUvIndex(
  uvIndex: number,
  includeIndex: boolean = true,
): React.ReactNode {
  // https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage
  let color = '#B567A4'
  let description = 'Extreme'
  let invertText = true

  if (uvIndex < 3) {
    color = '#3EA72D'
    description = 'Low'
  } else if (uvIndex < 5) {
    color = '#FFF300'
    description = 'Moderate'
    invertText = false
  } else if (uvIndex < 8) {
    color = '#F18B00'
    description = 'High'
    invertText = false
  } else if (uvIndex < 11) {
    color = '#E53210'
    description = 'Very High'
  }

  return (
    <div className="flex flex-row items-center justify-between">
      {description}
      <div
        style={{
          backgroundColor: color,
          color: invertText ? 'white' : 'black',
        }}
        className="w-9 p-2"
      >
        {includeIndex && <span>{uvIndex.toFixed(1)}</span>}
      </div>
    </div>
  )
}
