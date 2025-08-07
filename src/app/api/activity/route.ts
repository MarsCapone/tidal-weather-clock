import logger from '@/app/api/pinoLogger'
import { db } from '@/db/context'
import { activityTable, constraintTable } from '@/db/schemas/activity'
import { Activity } from '@/types/activity'
import { neon } from '@neondatabase/serverless'
import { notInArray } from 'drizzle-orm'
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
  const inserts = activities.map((a) => {
    const activityToInsert: typeof activityTable.$inferInsert = {
      ...a,
      user_id: userId,
    }
    return db
      .insert(activityTable)
      .values(activityToInsert)
      .onConflictDoUpdate({
        target: activityTable.id,
        set: {
          name: activityToInsert.name,
          priority: activityToInsert.priority,
          description: activityToInsert.description,
          user_id: activityToInsert.user_id,
        },
      })
      .returning({ id: activityTable.id })
  })

  const activityIds = (await Promise.all(inserts)).flatMap((res) =>
    res.map((r) => r.id),
  )
  logger.debug('updated activities', { activityIds })

  // first delete all the constraints. we can delete the ones for the activities we have because we're about to add
  // new constraints for them, and we can delete all the rest because we're going to delete any unlisted activities
  await db.delete(constraintTable)
  logger.debug('deleted all constraints')

  // now we can delete all activities that weren't sent to this endpoint
  const deletedIds = await db
    .delete(activityTable)
    .where(notInArray(activityTable.id, activityIds))
    .returning({ id: activityTable.id })
  logger.debug('deleted all unreferenced activities', {
    deletedIds: deletedIds.map((d) => d.id),
  })

  // then re-add all the constraints
  const constraintInsertions = activities.flatMap((activity, index) => {
    return activity.constraints.map((constraint) => {
      return db.insert(constraintTable).values({
        activity_id: activityIds[index],
        type: constraint.type,
        content: constraint,
      })
    })
  })
  await Promise.all(constraintInsertions)
  logger.debug('added all constraints')

  return new Response('', { status: 201 })
}
