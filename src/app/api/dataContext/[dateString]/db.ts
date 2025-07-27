import logger from '@/app/api/pinoLogger'
import { DataContext } from '@/types/context'
import { neon } from '@neondatabase/serverless'
import { formatISO } from 'date-fns'

const sql = neon(process.env.DATABASE_URL!)

export default {
  addDataContext,
  getDataContextForDate,
}

export async function addDataContext(
  location: [number, number],
  dataContext: DataContext,
): Promise<void> {
  const [{ id }] = await sql`
    INSERT INTO datacontext (date, latitude, longitude, data, last_updated)
    VALUES (
      ${formatISO(dataContext.referenceDate, { representation: 'date' })},
      ${location[0]},
      ${location[1]},
      ${dataContext},
      ${new Date()}
    )
    ON CONFLICT 
    DO UPDATE SET 
      data = ${dataContext},
      date = ${new Date()}
    RETURNING id;
  `
  logger.info('saved datacontext to db', {
    contextId: id,
    date: dataContext.referenceDate,
  })
}

export async function getDataContextForDate(
  date: Date,
  location: [number, number],
): Promise<{ dataContext: DataContext; lastUpdated: Date } | null> {
  const [dc] = await sql`
  SELECT data, last_updated FROM datacontext
  WHERE
    date = ${formatISO(date, { representation: 'date' })}
    AND latitude = ${location[0]}
    AND longitude = ${location[1]}
  `

  if (!dc) {
    return null
  }

  const { data: dataContext, last_updated: lastUpdated } = dc

  console.log({
    dataContext,
    lastUpdated,
  })

  return {
    dataContext,
    lastUpdated,
  }
}
