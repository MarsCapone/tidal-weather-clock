import logger from '@/app/api/pinoLogger'
import { db } from '@/lib/db'
import { datacontextTable } from '@/lib/db/schemas/datacontext'
import { DataContext } from '@/lib/types/context'
import { LatLong } from '@/lib/types/settings'
import { formatISO } from 'date-fns'
import { and, eq, sql } from 'drizzle-orm'

export async function getDataContextRange(
  location: [number, number],
): Promise<{ earliest: string; latest: string; all: string[] }> {
  const [latitude, longitude] = location

  const [{ earliest, latest }] = await db
    .select({
      earliest: sql<string>`MIN(${datacontextTable.date})::text`.as('earliest'),
      latest: sql<string>`MAX(${datacontextTable.date})::text`.as('latest'),
    })
    .from(datacontextTable)
    .where(
      and(
        eq(datacontextTable.latitude, latitude),
        eq(datacontextTable.longitude, longitude),
      ),
    )

  const dates = await db
    .select({ date: datacontextTable.date })
    .from(datacontextTable)
    .where(
      and(
        eq(datacontextTable.latitude, latitude),
        eq(datacontextTable.longitude, longitude),
      ),
    )

  return {
    earliest,
    latest,
    all: dates.map((d) => d.date),
  }
}

export async function getDataContextByDate(
  date: Date,
  location: [number, number],
): Promise<{ id: number; dataContext: DataContext; lastUpdated: Date } | null> {
  const [latitude, longitude] = location
  const [result] = await db
    .select({
      id: datacontextTable.id,
      dataContext: datacontextTable.data,
      lastUpdated: datacontextTable.last_updated,
    })
    .from(datacontextTable)
    .where(
      and(
        eq(datacontextTable.date, formatISO(date, { representation: 'date' })),
        eq(datacontextTable.latitude, latitude),
        eq(datacontextTable.longitude, longitude),
      ),
    )

  if (!result) {
    return null
  }

  const { id, dataContext, lastUpdated } = result

  logger.debug('fetched data context from db', {
    date,
    lastUpdated,
    location,
    id,
  })

  return {
    id,
    dataContext,
    lastUpdated,
  } as {
    id: number
    dataContext: DataContext
    lastUpdated: Date
  }
}

export async function addDataContext(
  dataContext: DataContext,
  location: LatLong,
): Promise<number> {
  const [latitude, longitude] = location

  const [{ id }] = await db
    .insert(datacontextTable)
    .values({
      date: dataContext.referenceDate,
      latitude,
      longitude,
      data: dataContext,
      last_updated: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        datacontextTable.date,
        datacontextTable.latitude,
        datacontextTable.longitude,
      ],
      set: {
        data: dataContext,
        last_updated: new Date(),
      },
    })
    .returning({ id: datacontextTable.id })
  logger.info('saved data context to db', {
    id,
    location,
    date: dataContext.referenceDate,
  })
  return id
}
