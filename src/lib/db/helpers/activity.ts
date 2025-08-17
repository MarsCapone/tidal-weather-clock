import { Activity, Constraint } from '@/lib/types/activity'
import { db } from '@/lib/db'
import { activityTable, constraintTable } from '@/lib/db/schemas/activity'
import { eq, notInArray, sql, inArray, and } from 'drizzle-orm'
import logger from '@/app/api/pinoLogger'

export async function getActivitiesByUserId(
  userId: string,
  includeGlobal: boolean = false,
) {
  const userIds = [userId]
  if (includeGlobal) {
    userIds.push('global')
  }

  const activityResponses: Activity[] = await db
    .select({
      id: activityTable.id,
      name: activityTable.name,
      description: activityTable.description,
      priority: activityTable.priority,
      constraints: sql<Constraint[]>`jsonb_agg(
        jsonb_set(${constraintTable.content}::jsonb, '{type}'::text[], to_jsonb(${constraintTable.type}))
        )`,
      userId: activityTable.user_id,
    })
    .from(activityTable)
    .leftJoin(
      constraintTable,
      eq(activityTable.id, constraintTable.activity_id),
    )
    .where(inArray(activityTable.user_id, userIds))
    .groupBy(
      activityTable.id,
      activityTable.name,
      activityTable.description,
      activityTable.priority,
    )

  return activityResponses
}

//  TODO: rethink how activities are stored so that it's easier to manage them

export async function putActivities(activities: Activity[], userId: string) {
  // we do not want to overwrite global activities
  const filteredActivities = activities.filter((a) => a.userId !== 'global')

  const inserts = filteredActivities.map((a) => {
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

  const activityIdsForUser = (await getActivitiesByUserId(userId)).map(
    (a) => a.id,
  )

  // first delete all the constraints. we can delete the ones for the activities we have because we're about to add
  // new constraints for them, and we can delete all the rest because we're going to delete any unlisted activities
  await db
    .delete(constraintTable)
    .where(inArray(constraintTable.activity_id, activityIdsForUser))
  logger.debug('deleted all constraints')

  // now we can delete all activities that weren't sent to this endpoint
  const deletedIds = await db
    .delete(activityTable)
    .where(
      and(
        notInArray(activityTable.id, activityIds),
        eq(activityTable.user_id, userId),
      ),
    )
    .returning({ id: activityTable.id })
  logger.debug('deleted all unreferenced activities', {
    deletedIds: deletedIds.map((d) => d.id),
  })

  // then re-add all the constraints
  const constraintInsertions = filteredActivities.flatMap((activity, index) => {
    return activity.constraints.map((constraint) => {
      return db.insert(constraintTable).values({
        activity_id: activityIds[index],
        type: constraint.type,
        content: constraint,
      })
    })
  })
  await Promise.all(constraintInsertions)
}
