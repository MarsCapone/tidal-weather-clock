import logger from '@/app/api/pinoLogger'
import { doRefresh } from '@/app/api/refresh/index'
import { getUserId } from '@/lib/auth0'
import CONSTANTS from '@/lib/constants'
import { db } from '@/lib/db'
import {
  getActivitiesByUserId,
  getAllActivities,
} from '@/lib/db/helpers/activity'
import { getDataContextsByDateRange } from '@/lib/db/helpers/datacontext'
import { activityScoresTable } from '@/lib/db/schemas/activity'
import { getScores } from '@/lib/score'
import { dateOptions, utcDateStringToUtc } from '@/lib/utils/dates'
import { addDays, startOfToday } from 'date-fns'
import { sql } from 'drizzle-orm'
import fastCartesian from 'fast-cartesian'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  /** Refresh data with parameters */

  const { scope, start_date, end_date } = (await request.json()) as {
    scope?: 'user' | 'global' | 'all'
    start_date?: string
    end_date?: string
  }

  const userId = await getUserId()

  const startDate = start_date
    ? utcDateStringToUtc(start_date)
    : startOfToday(dateOptions)
  const endDate = end_date
    ? utcDateStringToUtc(end_date)
    : addDays(startOfToday(dateOptions), 7)

  await doRefresh({
    scope: scope || 'global',
    userId,
    startDate,
    endDate,
  })
}
