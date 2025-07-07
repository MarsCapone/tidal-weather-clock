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

type _MoonPhase = {
  text: string
  time: string
  value: number
}

type StormglassSunTimestampResponse = {
  moonFraction: number
  moonPhase: {
    closest: _MoonPhase
    current: _MoonPhase
  }
  moonrise: string
  moonset: string
  nauticalDawn: string
  nauticalDusk: string
  sunrise: string
  sunset: string
  time: string
}

type StormglassTideTimestampResponse = {
  height: number
  time: string
  type: 'low' | 'high'
}

type StormglassMeta = {
  cost: number
  requestCount: number
  dailyQuota: number
  lat: number
  lng: number
  start: string
}

type StormglassWeatherMeta = StormglassMeta & {
  end: string
  params: (typeof stormglassWeatherParams)[number][]
}

type StormglassTideMeta = StormglassMeta & {
  datum: string
  end: string
  station: {
    distance: number
    lat: number
    lng: number
    name: string
    source: string
  }
}

type StormglassSunMeta = StormglassMeta

export type StormglassWeatherResponse = {
  hours: StormglassWeatherTimestampResponse[]
  meta: StormglassWeatherMeta
}

export type StormglassSunResponse = {
  data: StormglassSunTimestampResponse[]
  meta: StormglassSunMeta
}

export type StormglassTideResponse = {
  data: StormglassTideTimestampResponse[]
  meta: StormglassTideMeta
}
