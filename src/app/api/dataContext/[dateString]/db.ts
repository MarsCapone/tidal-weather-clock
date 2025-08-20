import logger from '@/app/api/pinoLogger'
import { getDataContextByDate } from '@/lib/db/helpers/datacontext'
import { DataContext } from '@/lib/types/context'
import { neon } from '@neondatabase/serverless'
import { formatISO } from 'date-fns'

const sql = neon(process.env.DATABASE_URL!)

export default {
  addDataContext,
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
    ON CONFLICT (date, latitude, longitude)
    DO UPDATE SET 
      data = EXCLUDED.data,
      date = EXCLUDED.date,
      last_updated = EXCLUDED.last_updated
    RETURNING id;
  `
  logger.info('saved datacontext to db', {
    contextId: id,
    date: dataContext.referenceDate,
  })
}
