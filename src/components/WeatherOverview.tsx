import { DataContext } from '@/lib/types/context'
import { WorkingHoursSetting } from '@/lib/types/settings'
import { utcDateStringToFractionalUtc } from '@/lib/utils/dates'
import { calcMean } from '@/lib/utils/math'
import { isInWorkingHours } from '@/lib/utils/settings'
import { mpsToKnots } from '@/lib/utils/units'
import {
  describeCloudiness,
  describeWindDirection,
} from '@/lib/utils/weather-descriptions'
import { ArrowBigUpIcon } from 'lucide-react'

export type WeatherOverviewProps = {
  dataContext: DataContext
  workingHours: WorkingHoursSetting
}

export default function WeatherOverview({
  dataContext,
  workingHours,
}: WeatherOverviewProps) {
  const dominantWindSpeed = dataContext.windData.dominantSpeed
    ? mpsToKnots(dataContext.windData.dominantSpeed).toFixed(1)
    : null
  const dominantWindGusts = dataContext.windData.dominantGustSpeed
    ? mpsToKnots(dataContext.windData.dominantGustSpeed).toFixed(1)
    : null
  const dominantWindDirection = dataContext.windData.dominantDirection

  const workingHoursPoints = dataContext.weatherData.points.filter((p) =>
    isInWorkingHours(workingHours, utcDateStringToFractionalUtc(p.timestamp)),
  )

  const workingHoursTemperature = calcMean(
    workingHoursPoints.map((p) => p.temperature),
  )
  const totalTemperature = calcMean(
    dataContext.weatherData.points.map((p) => p.temperature),
  )

  const workingHoursCloudiness = calcMean(
    workingHoursPoints.map((p) => p.cloudCover),
  )
  const totalCloudiness = calcMean(
    dataContext.weatherData.points.map((p) => p.cloudCover),
  )

  const divider = <div className={'m-1 text-sm md:m-2'}>|</div>

  return (
    <div
      className={
        'flex flex-col justify-center gap-2 text-3xl font-thin md:flex-row md:gap-8'
      }
    >
      <div
        data-testid={'overview-wind'}
        className={'items-top flex flex-row justify-center gap-4'}
      >
        {/*  Dominant wind */}
        {/*  <WindIcon className={"w-12 h-12 stroke-1 "} />*/}
        <div className={''}>
          {dominantWindSpeed && <div>{dominantWindSpeed} kts</div>}
          {dominantWindGusts && (
            <div className={'text-sm'}>(gusting {dominantWindGusts} kts)</div>
          )}
        </div>
      </div>
      {divider}
      <div
        data-testid={'overview-wind-direction'}
        className={'items-top flex flex-row justify-center gap-4'}
      >
        {/*  Dominant wind direction */}
        {/*  <WindIcon className={"w-12 h-12 stroke-1 "} />*/}
        {dominantWindDirection && (
          <div className={'flex flex-row justify-center'}>
            <ArrowBigUpIcon
              className={'fill-accent h-10 w-10 stroke-1'}
              style={{ rotate: `${dominantWindDirection + 180}deg` }}
            />
            <div className={''}>
              <div>{describeWindDirection(dominantWindDirection, false)}</div>
              <div className={'text-sm'}>({dominantWindDirection}º)</div>
            </div>
          </div>
        )}
      </div>

      {divider}

      <div
        data-testid={'overview-temp'}
        className={'items-top flex flex-row justify-around gap-4'}
      >
        {/*  Temperature */}
        {workingHours.enabled ? (
          <div>
            <div>{workingHoursTemperature.toFixed(1)}ºC</div>
            <div className={'text-sm'}>
              {totalTemperature.toFixed(1)}ºC (24h)
            </div>
          </div>
        ) : (
          <div className={''}>{totalTemperature.toFixed(1)}ºC</div>
        )}
      </div>

      {divider}

      <div data-testid={'overview-clouds'}>
        {/*  Clouds */}
        {workingHours.enabled ? (
          <div>
            <div>{describeCloudiness(workingHoursCloudiness)}</div>
            <div className={'text-sm'}>
              {describeCloudiness(totalCloudiness)} (24h)
            </div>
          </div>
        ) : (
          <div className={''}>{describeCloudiness(totalCloudiness)}</div>
        )}
      </div>
    </div>
  )
}
