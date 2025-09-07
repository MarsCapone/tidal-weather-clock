import logger from '@/app/api/pinoLogger'
import { putActivities } from '@/lib/db/helpers/activity'
import { db } from '@/lib/db/index'
import { activityTable } from '@/lib/db/schemas/activity'
import { Activity, Constraint } from '@/lib/types/activity'
import { kebabCase } from 'change-case'

const defaultConstraints: Record<string, Constraint> = {
  highTide: {
    type: 'tide',
    minHeight: 0.9,
    eventType: 'high',
    maxHoursAfter: 2,
    maxHoursBefore: 2,
  },
  daylight: {
    type: 'sun',
    maxHoursBeforeSunset: 2,
    requiresDaylight: true,
  },
  lowTide: {
    type: 'tide',
    eventType: 'low',
    maxHoursAfter: 1.5,
    maxHoursBefore: 1.5,
  },
}

const addActivities = async () => {
  const activities: Omit<Activity, 'id' | 'scope' | 'priority'>[] = [
    {
      name: 'Paddle Boarding (inland)',
      description: 'Head into the creek, and back',
      constraints: [
        defaultConstraints.highTide,
        defaultConstraints.daylight,
        {
          type: 'wind',
          maxSpeed: 5.2,
        },
      ],
    },
    {
      name: 'Ferry to Island',
      description: 'Get the ferry to the island for a day out',
      constraints: [
        defaultConstraints.daylight,
        defaultConstraints.highTide,
        {
          type: 'day',
          isWeekday: true,
          isWeekend: false,
        },
      ],
    },
    {
      name: 'Swim in Bank Hole',
      description:
        'Walk down from the hard, across the water, and towards the first groyne for a swim',
      constraints: [defaultConstraints.daylight, defaultConstraints.lowTide],
    },
    {
      name: 'Stargazing',
      description: 'Turn off all the lights and look up at the stars',
      constraints: [
        {
          type: 'sun',
          requiresDarkness: true,
        },
        {
          type: 'weather',
          maxCloudCover: 0,
        },
      ],
    },
  ]

  await putActivities(
    activities.map((a) => ({
      ...a,
      id: kebabCase(a.name.toLowerCase()),
      scope: 'global',
      priority: 1,
    })),
    'global',
  )
}

const main = async () => {
  const deleted = await db
    .delete(activityTable)
    .returning({ id: activityTable.id, version: activityTable.version })
  logger.warn('deleted existing activities', { deleted })

  await addActivities()
}

main()
