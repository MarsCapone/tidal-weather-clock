import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function getDataContextRange(
  location: [number, number],
): Promise<{ earliest: string; latest: string; all: string[] }> {
  const [result] = await sql`
    SELECT MIN(date)::text AS earliest, MAX(date)::text AS latest
    FROM datacontext
    WHERE latitude = ${location[0]} AND longitude = ${location[1]}
  `

  const dates = await sql`
  SELECT date::text FROM datacontext
  WHERE latitude = ${location[0]} AND longitude = ${location[1]}
  ORDER BY date DESC`

  if (!result) {
    throw new Error('No data context found for the given location')
  }

  return {
    earliest: result.earliest,
    latest: result.latest,
    all: dates.map((d) => d.date),
  }
}
