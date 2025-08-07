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

export async function PUT(request: NextRequest): Promise<Response> {
  const data: { userId?: string; activities: Activity[] } = await request.json()
  if (!data.activities) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const userId = data.userId || 'demouser'
  const activities = data.activities

  // upsert all the activities
  const activityIds: string[] = (
    await Promise.all(
      activities.map((activity) => {
        return sql`
            INSERT INTO public.activity (id, name, priority, description, user_id)
                VALUES (${activity.id}, ${activity.name}, ${activity.priority}, ${activity.description}, ${userId})
            ON CONFLICT (id) DO UPDATE
            SET 
                name = EXCLUDED.name,
                priority = EXCLUDED.priority,
                description = EXCLUDED.description,
                user_id = EXCLUDED.user_id
            RETURNING id
    `
      }),
    )
  ).map((result) => result[0].id)

  logger.debug('updated activities', { activityIds })

  // first delete all the constraints. we can delete the ones for the activities we have because we're about to add
  // new constraints for them, and we can delete all the rest because we're going to delete any unlisted activities
  await sql`DELETE FROM public.constraint`
  logger.debug('deleted all constraints')

  const array = `(${activityIds.join(', ')})`
  logger.debug('array', { array })
  // now we can delete all activities that weren't sent to this endpoint
  const deletedIds = await sql.query(
    `DELETE FROM public.activity WHERE id NOT IN ${array} RETURNING id`,
  )
  logger.debug('deleted all unreferenced activities', {
    deletedIds: deletedIds.map((d) => d.id),
  })

  // then re-add all the constraints
  const constraintInsertions = activities.flatMap((activity, index) => {
    return activity.constraints.map((constraint) => {
      return sql`
        INSERT INTO public.constraint (id, activity_id, type, content)
        VALUES (
          gen_random_uuid(),
          ${activityIds[index]},
          ${constraint.type},
          ${JSON.stringify(constraint)}
        )
      `
    })
  })
  await Promise.all(constraintInsertions)
  logger.debug('added all constraints')

  return new Response('', { status: 201 })
}
