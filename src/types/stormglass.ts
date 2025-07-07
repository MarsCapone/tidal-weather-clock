export const stormglassWeatherParams = [
  'cloudCover',
  'gust',
  'windDirection',
  'windSpeed',
  'airTemperature',
]

type StormglassSourceData = {
  [source: string]: number | undefined
}

type StormglassWeatherTimestampResponse = {
  time: string
  cloudCover: StormglassSourceData
  gust: StormglassSourceData
  windDirection: StormglassSourceData
  windSpeed: StormglassSourceData
  airTemperature: StormglassSourceData
}

type StormglassWeatherMeta = {
  cost: number
  requestCount: number
  dailyQuota: number
  lat: number
  lng: number
  start: string
  end: string
  params: (typeof stormglassWeatherParams)[number][]
}

export type StormglassWeatherResponse = {
  hours: StormglassWeatherTimestampResponse[]
  meta: StormglassWeatherMeta
}
