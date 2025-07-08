import { Activity } from '@/types/activities'

const CONSTANTS = {
  TITLE: 'Tidal Weather Clock',
  LOCATION_COORDS: [52.9636, 0.7442] as [number, number],
  LOCATION_NAME: 'Burnham Overy Staithe',
  MAX_PERMITTED_DAYS: 10,
  DEFAULT_CACHE_EXPIRY_HOURS: 24,
}

export default CONSTANTS

const daylightConstraint = {
  description: "it's daylight hours",
  isDaylight: true,
  type: 'sun',
} as const

export const Activities: Activity[] = [
  {
    constraints: [
      {
        comp: 'gt',
        description: 'not too early',
        type: 'time',
        value: '09:00',
      },
      {
        comp: 'lt',
        description: 'not too late',
        type: 'time',
        value: '16:45',
      },
      daylightConstraint,
      {
        comp: 'lt',
        description: 'not much wind',
        type: 'wind-speed',
        value: 15,
      },
      {
        comp: 'gt',
        description: 'tide more than 1.8m',
        tideType: 'high',
        type: 'hightide-height',
        value: 1.8,
      },
      {
        type: 'tide-state',
        deltaHours: 2,
        tideType: 'high',
        description: 'within 2 hours of high tide',
      },
    ],
    displayName: 'Paddle boarding',
    label: 'paddle-board',
  },
  {
    constraints: [
      daylightConstraint,
      {
        deltaHours: 1,
        description: 'the tide is low',
        tideType: 'low',
        type: 'tide-state',
      },
    ],
    displayName: 'Swim in Bank Hole',
    label: 'bank-hole',
  },
]
