import { db } from '@/lib/db'
import { datacontextTable } from '@/lib/db/schemas/datacontext'
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
