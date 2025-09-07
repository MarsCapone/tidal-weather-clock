import logger from '@/app/api/pinoLogger'
import { db } from '@/lib/db'
import { activityScoresTable, activityTable } from '@/lib/db/schemas/activity'
import { TimeSlot } from '@/lib/score'
import { Constraint, TActivity } from '@/lib/types/activity'
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm'

export async function getActivitiesByUserId(
  userId: string,
  includeGlobal: boolean = false,
) {
  const userIds = [userId]
  if (includeGlobal) {
    userIds.push('global')
  }
  logger.debug('getActivitiesByUserId', { userIds, includeGlobal })

  const activityResponses: TActivity[] = (
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

export async function getAllActivities(): Promise<TActivity[]> {
  const dbResult = await db
    .selectDistinctOn([activityTable.id])
    .from(activityTable)
    .orderBy(activityTable.id, desc(activityTable.version))

  return dbResult.map(
    ({ id, name, description, priority, content, version, user_id }) => ({
      id,
      name,
      description,
      priority,
      scope: user_id === 'global' ? 'global' : 'user',
      version,
      user_id,
      constraints: content['constraints'] || [],
    }),
  )
}

export async function putActivities(activities: TActivity[], userId: string) {
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

export type ActivityScore = {
  name: string
  description: string
  priority: number
  user_id: string
  score: number
  timestamp: string
  debug: {
    timeSlot: TimeSlot
    constraintsWithScores: {
      constraint: Constraint
      score: number
    }[]
  }
  activityId: string
  activityVersion: number
  dataContextId: number
}

export async function getBestActivitiesForDatacontext(
  dataContextId: number,
  userIds: string[],
  options?: {
    scoreThreshold?: number
    futureOnly?: boolean
  },
): Promise<ActivityScore[]> {
  const limitFuture = options?.futureOnly ?? false

  const results = await db
    .select()
    .from(activityScoresTable)
    .innerJoin(
      activityTable,
      and(
        eq(activityScoresTable.activity_id, activityTable.id),
        eq(activityScoresTable.activity_version, activityTable.version),
      ),
    )
    .where(
      and(
        eq(activityScoresTable.datacontext_id, dataContextId),
        gte(activityScoresTable.score, options?.scoreThreshold ?? 0.5),
        sql`CASE WHEN ${limitFuture} THEN ${activityScoresTable.timestamp}::timestamp > now() ELSE true END`,
        inArray(activityTable.user_id, userIds),
      ),
    )

  return results.map(
    ({
      activity: { name, description, user_id, version, id, priority },
      activity_score: { score, timestamp, debug, datacontext_id },
    }) => {
      return {
        name,
        description,
        priority,
        user_id,
        score,
        timestamp,
        debug,
        activityId: id,
        activityVersion: version,
        dataContextId: datacontext_id,
      } as ActivityScore
    },
  )
}
