import { Activity } from '@/types/activity'
import { ServerActivityFetcher } from '@/utils/activityFetcher'
import { ServerDataFetcher } from '@/utils/fetchData'
import logger from '@/utils/logger'

const CONSTANTS = {
  DEFAULT_CACHE_EXPIRY_HOURS: 24,
  LOCATION_COORDS: [52.9636, 0.7442] as [number, number],
  LOCATION_NAME: 'Burnham Overy Staithe',
  MAX_PERMITTED_DAYS: 10,
  TITLE: 'Tidal Weather Clock',
}

export default CONSTANTS

export const APP_CONFIG = {
  dataFetchers: [new ServerDataFetcher(logger)],
  activityFetcher: new ServerActivityFetcher(),
}

type ExampleData = {
  Activities: Activity[]
}
export const EXAMPLE_DATA: ExampleData = {
  Activities: [
    {
      constraints: [
        { type: 'wind' },
        { maxCloudCover: 80, type: 'weather' },
        { requiresDaylight: true, type: 'sun' },
        { earliestHour: 8, latestHour: 18, type: 'time' },
      ],
      description: 'Recreational sailing',
      id: 'sailing',
      name: 'Sailing',
      priority: 7,
    },
    {
      constraints: [
        { preferredStates: ['rising', 'high'], type: 'tide' },
        {
          directionTolerance: 45,
          maxSpeed: 12,
          preferredDirections: [270, 225],
          type: 'wind',
        },
        { requiresDaylight: true, type: 'sun' },
        { minTemperature: 12, type: 'weather' },
      ],
      description: 'Surf session',
      id: 'surfing',
      name: 'Surfing',
      priority: 8,
    },
    {
      constraints: [
        { requiresDarkness: true, type: 'sun' },
        { maxCloudCover: 30, type: 'weather' },
        { maxSpeed: 8, type: 'wind' },
        { earliestHour: 21, type: 'time' },
      ],
      description: 'Astronomical observation',
      id: 'stargazing',
      name: 'Stargazing',
      priority: 5,
    },
    {
      constraints: [
        { preferredStates: ['rising', 'falling'], type: 'tide' },
        { maxSpeed: 10, type: 'wind' },
        { preferredHours: [6, 7, 18, 19, 20], type: 'time' },
      ],
      description: 'Shore fishing',
      id: 'fishing',
      name: 'Fishing',
      priority: 6,
    },
  ],
}
