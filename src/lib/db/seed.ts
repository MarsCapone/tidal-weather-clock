import logger from '@/app/api/pinoLogger'
import { doRefresh } from '@/app/api/refresh'
import { putActivities } from '@/lib/db/helpers/activity'
import { db } from '@/lib/db/index'
import { activityTable } from '@/lib/db/schemas/activity'
import { usersTable } from '@/lib/db/schemas/users'
import { Constraint, TActivity } from '@/lib/types/activity'
import { kebabCase } from 'change-case'
import { startOfToday } from 'date-fns'

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
  const activities: Omit<TActivity, 'id' | 'scope'>[] = [
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
      priority: 5,
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
      priority: 5,
    },
    {
      name: 'Swim in Bank Hole',
      description:
        'Walk down from the hard, across the water, and towards the first groyne for a swim',
      constraints: [defaultConstraints.daylight, defaultConstraints.lowTide],
      priority: 5,
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
      priority: 5,
    },
    {
      name: 'Play Scrabble',
      description:
        "There's nothing else for it - it's time for a game of Scrabble!",
      constraints: [
        {
          type: 'day',
          isWeekday: true,
          isWeekend: true,
        },
      ],
      priority: 1,
    },
  ]

  await putActivities(
    activities.map((a) => ({
      ...a,
      id: kebabCase(a.name.toLowerCase()),
      scope: 'global',
    })),
    null,
  )
}

const main = async () => {
  const deleted = await db
    .delete(activityTable)
    .returning({ id: activityTable.id, version: activityTable.version })
  logger.warn('deleted existing activities', { deleted })
  await db.delete(usersTable)

  await addActivities()
  await doRefresh({
    scope: 'all',
    startDate: startOfToday(),
    endDate: 7,
  })
}

main()
