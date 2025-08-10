import { OpenMeteoAndEasyTideDataFetcher } from '@/app/api/dataContext/[dateString]/opendatasources'
import logger from '@/app/api/pinoLogger'
import CONSTANTS from '@/constants'
import { DataContext } from '@/types/context'
import { utcDateStringToUtc } from '@/utils/dates'
import {
  addDays,
  differenceInHours,
  isAfter,
  isBefore,
  startOfDay,
  startOfToday,
} from 'date-fns'
import { NextRequest } from 'next/server'
import db from './db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dateString: string }> },
) {
  const { dateString } = await params

  const date = startOfDay(utcDateStringToUtc(dateString))
  const result = await getDataContextForDateString(date)
  return Response.json(result)
}

const dataFetcher = new OpenMeteoAndEasyTideDataFetcher(logger)
const location = CONSTANTS.LOCATION_COORDS
const EXPIRY_HOURS = 24

/**
 * Get the datacontext from the db given a dateString.
 *
 * 1. Look up that date in the db
 * 2. If it's there, check the last updated time.
 * 3. If the last updated time is within the last 24 hours, use that.
 * 4. Otherwise, if it isn't there, or it's too old, requery the API for all
 *    dates from today
 * 5. Then save them in the db
 * 6. Finally return the value for the date that was requested
 *
 * If the dateString is in the past or too far in the future, only return things
 * from the db, but don't call the API.
 *
 * @param date the date to get the datacontext for
 */
async function getDataContextForDateString(
  date: Date,
): Promise<DataContext | null> {
  const today = startOfToday()

  const res = await db.getDataContextForDate(date, location)
  if (res) {
    const { dataContext, lastUpdated } = res
    if (
      // it's current
      differenceInHours(new Date(), lastUpdated) < EXPIRY_HOURS ||
      // or it's old, so we don't mind if it's out of date
      isBefore(date, today) ||
      // or it's too far ahead so we don't want to fetch (this can't easily happen naturally)
      isAfter(date, addDays(today, CONSTANTS.MAX_PERMITTED_DAYS))
    ) {
      // then just return whatever we found
      return dataContext
    }
  }

  if (
    isBefore(date, today) ||
    isAfter(date, addDays(today, CONSTANTS.MAX_PERMITTED_DAYS))
  ) {
    // we can't fetch data from the past if we don't already have it
    // we don't want to try to fetch data too far in the future
    return null
  }

  // otherwise we need to try to fetch a more recent value. we'll use the
  // datafetcher to get the datacontexts that we can find from today
  const dcs = await dataFetcher.getDataContexts(today)

  // then whatever we find, we put in the db
  for (const dc of dcs) {
    await db.addDataContext(location, dc)
  }

  // finally return whatever was requested
  return (await db.getDataContextForDate(date, location))?.dataContext || null
}
