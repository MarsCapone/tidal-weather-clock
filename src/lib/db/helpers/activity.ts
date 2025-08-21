import logger from '@/app/api/pinoLogger'
import { db } from '@/lib/db'
import { activityTable } from '@/lib/db/schemas/activity'
import { Activity } from '@/lib/types/activity'
import { and, desc, inArray, sql } from 'drizzle-orm'

export async function getActivitiesByUserId(
  userId: string,
  includeGlobal: boolean = false,
) {
  const userIds = [userId]
  if (includeGlobal) {
    userIds.push('global')
  }
  logger.debug('getActivitiesByUserId', { userIds, includeGlobal })

  const activityResponses: Activity[] = (
    await db
      .selectDistinctOn([activityTable.id], {
        id: activityTable.id,
        version: activityTable.version,
        name: activityTable.name,
        description: activityTable.description,
        priority: activityTable.priority,
        content: activityTable.content,
        scope: sql<
          'global' | 'user'
        >`CASE WHEN ${activityTable.user_id} = 'global' THEN 'global' ELSE 'user' END`,
      })
      .from(activityTable)
      .where(and(inArray(activityTable.user_id, userIds)))
      .groupBy(
        activityTable.id,
        activityTable.name,
        activityTable.description,
        activityTable.priority,
        activityTable.version,
      )
      .orderBy(activityTable.id, desc(activityTable.version))
  ).map(({ id, name, description, priority, scope, content, version }) => ({
    id,
    name,
    description,
    priority,
    scope,
    version,
    constraints: content['constraints'] || [],
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
    const q = async () => {
      const nextVersion = await db
        .select({
          v: sql<number>`(SELECT COALESCE(MAX(${activityTable.version}), 0) + 1
                        FROM ${activityTable}
                        WHERE ${activityTable.id} = ${a.id})`.as('v'),
        })
        .from(activityTable)

      const activityToInsert: typeof activityTable.$inferInsert = {
        ...a,
        content: { constraints: a.constraints || [] },
        user_id: userId,
        version: nextVersion[0]?.v || 1,
      }

      const query = await db
        .insert(activityTable)
        .values(activityToInsert)
        .returning({ id: activityTable.id, version: activityTable.version })

      return query
    }
    return q()
  })

  const activityIds = (await Promise.all(inserts)).flat()
  logger.debug('updated activities', { activityIds })
}
