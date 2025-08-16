import logger from '@/app/api/pinoLogger'
import { activityTable, constraintTable } from '@/lib/db/schemas/activity'
import { Activity, Constraint } from '@/lib/types/activity'
import { eq, notInArray, sql } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { db } from '../../../lib/db'

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams || {}

  const userId = searchParams.get('user_id') || 'demouser'

  const activityResponses: Activity[] = await db
    .select({
      id: activityTable.id,
      name: activityTable.name,
      description: activityTable.description,
      priority: activityTable.priority,
      constraints: sql<Constraint[]>`jsonb_agg(
        jsonb_set(${constraintTable.content}::jsonb, '{type}'::text[], to_jsonb(${constraintTable.type}))
    )`,
    })
    .from(activityTable)
    .leftJoin(
      constraintTable,
      eq(activityTable.id, constraintTable.activity_id),
    )
    .where(eq(activityTable.user_id, userId))
    .groupBy(
      activityTable.id,
      activityTable.name,
      activityTable.description,
      activityTable.priority,
    )

  logger.info('fetched activities from db', {
    activityCount: activityResponses.length,
    userId,
  })

  return Response.json(
    activityResponses.map((activityResponse) => ({
      ...activityResponse,
      // sometimes null gets set as the value
      constraints: activityResponse.constraints.filter((v) => v !== null),
    })),
  )
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
