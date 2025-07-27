import logger from '@/app/api/pinoLogger'
import { Activity } from '@/types/activity'
import { neon } from '@neondatabase/serverless'
import { NextRequest } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams || {}

  const userId = searchParams.get('user_id') || 'demouser'

  const activityResponses = (await sql`
    SELECT
      a.id,
      a.name,
      a.priority,
      a.description,
      jsonb_agg(
        jsonb_set(c.content::jsonb,
                  '{type}'::text[],
                  to_jsonb(c.type))
      ) AS "constraints"
    FROM public.activity a
      LEFT JOIN public.constraint c ON a.id = c.activity_id
    WHERE a.user_id = ${userId}
    GROUP BY a.id, a.name, a.priority, a.description`) as Activity[]

  logger.info('fetched activities from db', {
    activityCount: activityResponses.length,
    userId,
  })

  return Response.json(activityResponses)
}
