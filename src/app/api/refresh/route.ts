import logger from '@/app/api/pinoLogger'
import { doRefresh } from '@/app/api/refresh/index'
import { getUserId } from '@/lib/auth0'
import { dateOptions, utcDateStringToUtc } from '@/lib/utils/dates'
import { addDays, startOfToday } from 'date-fns'
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

  logger.info('Refreshing data', {
    scope,
    userId,
    startDate,
    endDate,
  })

  await doRefresh({
    scope: scope || 'global',
    userId,
    startDate,
    endDate,
  })

  return new Response('OK')
}
