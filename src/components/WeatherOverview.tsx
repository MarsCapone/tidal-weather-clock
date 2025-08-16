import { DataContext } from '@/lib/types/context'
import { mpsToKnots } from '@/lib/utils/units'
import { ArrowBigUpIcon, WindIcon } from 'lucide-react'
import { CelsiusIcon } from '@/components/icons/TemperatureIcon'
import { calcMean } from '@/lib/utils/math'
import {
  describeCloudiness,
  describeWindDirection,
} from '@/lib/utils/weather-descriptions'

export type WeatherOverviewProps = {
  dataContext: DataContext
}

export default function WeatherOverview({ dataContext }: WeatherOverviewProps) {
  const dominantWindSpeed = dataContext.windData.dominantSpeed
    ? mpsToKnots(dataContext.windData.dominantSpeed).toFixed(1)
    : null
  const dominantWindGusts = dataContext.windData.dominantGustSpeed
    ? mpsToKnots(dataContext.windData.dominantGustSpeed).toFixed(1)
    : null
  const dominantWindDirection = dataContext.windData.dominantDirection

  const meanTemperature = calcMean(
    dataContext.weatherData.points.map((p) => p.temperature),
  )
  const meanCloudiness = calcMean(
    dataContext.weatherData.points.map((p) => p.cloudCover),
  )

  const divider = <div className={'m-2 text-sm'}>|</div>

  return (
    <div
      className={'flex flex-col justify-center text-3xl font-thin md:flex-row'}
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
        {dominantWindDirection && (
          <div className={'flex flex-row justify-center'}>
            <ArrowBigUpIcon
              className={'h-10 w-10 stroke-1'}
              style={{ rotate: `${dominantWindDirection + 180}deg` }}
            />
            <div className={''}>
              {describeWindDirection(dominantWindDirection, true)}
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
        <div className={''}>{meanTemperature}ºC</div>
      </div>

      {divider}

      <div data-testid={'overview-clouds'}>
        {/*  Clouds */}
        <div className={''}>{describeCloudiness(meanCloudiness)}</div>
      </div>
    </div>
  )
}
