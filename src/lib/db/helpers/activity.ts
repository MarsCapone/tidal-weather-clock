import { Activity } from '@/lib/types/activity'
import { db } from '@/lib/db'
import { activityTable } from '@/lib/db/schemas/activity'
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

  const activityResponses: Activity[] = (
    await db
      .select({
        id: activityTable.id,
        name: activityTable.name,
        description: activityTable.description,
        priority: activityTable.priority,
        content: activityTable.content,
        scope: sql<
          'global' | 'user'
        >`CASE WHEN ${activityTable.user_id} = 'global' THEN 'global' ELSE 'user' END`,
      })
      .from(activityTable)
      .where(inArray(activityTable.user_id, userIds))
      .groupBy(
        activityTable.id,
        activityTable.name,
        activityTable.description,
        activityTable.priority,
      )
  ).map(({ id, name, description, priority, scope, content }) => ({
    id,
    name,
    description,
    priority,
    scope,
    constraints: content['constraints'],
  }))

  return activityResponses
}

//  TODO: rethink how activities are stored so that it's easier to manage them

export async function putActivities(activities: Activity[], userId: string) {
  // we do not want to overwrite global activities, unless we are setting them for the global user
  const filteredActivities = activities.filter((a) =>
    userId === 'global' ? a.scope === 'global' : a.scope === 'user',
  )

  const inserts = filteredActivities.map((a) => {
    const activityToInsert: typeof activityTable.$inferInsert = {
      ...a,
      content: { constraints: a.constraints },
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
          content: activityToInsert.content,
        },
      })
      .returning({ id: activityTable.id })
  })

  const activityIds = (await Promise.all(inserts)).flatMap((res) =>
    res.map((r) => r.id),
  )
  logger.debug('updated activities', { activityIds })

  // now we can delete all activities that weren't updated but are for this user
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
}
