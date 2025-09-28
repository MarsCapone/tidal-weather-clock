import logger from '@/app/api/pinoLogger'
import { db } from '@/lib/db'
import { activityScoresTable, activityTable } from '@/lib/db/schemas/activity'
import { TimeSlot } from '@/lib/score'
import { Constraint, TActivity } from '@/lib/types/activity'
import { and, asc, desc, eq, gte, isNull, notInArray, sql } from 'drizzle-orm'

export async function getActivitiesByUserId(userId: string | null) {
  const userIds = userId ? [userId] : []
  logger.debug('getActivitiesByUserId', { userId, userIds })

  const where =
    userId === null
      ? isNull(activityTable.user_id)
      : eq(activityTable.user_id, userId)

  const activityResponses: TActivity[] = (
    await db
      .selectDistinctOn([activityTable.id])
      .from(activityTable)
      .where(where)
      .orderBy(asc(activityTable.id), desc(activityTable.version))
  ).map(
    ({
      id,
      name,
      description,
      priority,
      content,
      version,
      user_id,
      ignore_ooh,
    }) => ({
      id,
      name,
      description,
      priority,
      version,
      scope: user_id === null ? 'global' : 'user',
      constraints: content['constraints'] || [],
      ignoreOoh: ignore_ooh,
    }),
  )

  return activityResponses
}

export async function getAllActivities(): Promise<TActivity[]> {
  const dbResult = await db
    .selectDistinctOn([activityTable.id])
    .from(activityTable)
    .orderBy(activityTable.id, desc(activityTable.version))

  return dbResult.map(
    ({
      id,
      name,
      description,
      priority,
      content,
      version,
      user_id,
      ignore_ooh,
    }) => ({
      id,
      name,
      description,
      priority,
      scope: user_id === null ? 'global' : 'user',
      version,
      user_id,
      constraints: content['constraints'] || [],
      ignoreOoh: ignore_ooh,
    }),
  )
}

export async function putActivities(
  activities: TActivity[],
  userId: string | null,
) {
  // we do not want to overwrite global activities, unless we are setting them for the global user
  const filteredActivities = activities.filter((a) =>
    userId === null ? a.scope === 'global' : a.scope === 'user',
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
        ignore_ooh: a.ignoreOoh ?? false,
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

export async function setActivities(activities: TActivity[], userId: string) {
  // userId not nullable here because we don't want to ever set global activities
  // delete everything for that userId where the id is not in the current list of activities
  const deletedActivities = await db
    .delete(activityTable)
    .where(
      and(
        eq(activityTable.user_id, userId),
        notInArray(
          activityTable.id,
          activities.map((a) => a.id),
        ),
      ),
    )
    .returning({
      id: activityTable.id,
      version: activityTable.version,
    })
  logger.debug('deleted activities', { userId, deletedActivities })
  await putActivities(activities, userId)
}

export type ActivityScore = {
  name: string
  description: string
  priority: number
  ignoreOoh: boolean
  userId: string
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
  userId: string | null,
  options?: {
    scoreThreshold?: number
    futureOnly?: boolean
    // if future only, then include the previous lookbackHours in the range
    lookbackHours?: number
  },
): Promise<ActivityScore[]> {
  const limitFuture = options?.futureOnly ?? false
  const lookbackHours = `'${String(options?.lookbackHours ?? 0)}'`

  const currentActivities =
    userId === null
      ? await getAllActivities()
      : await getActivitiesByUserId(userId)

  console.log('currentActivities', { currentActivities })

  const activityScores = (
    await Promise.all(
      currentActivities.map(({ id, version }) => {
        return db
          .select()
          .from(activityScoresTable)
          .where(
            and(
              eq(activityScoresTable.activity_id, id),
              eq(activityScoresTable.activity_version, version),
              sql`CASE WHEN ${limitFuture} THEN (${activityScoresTable.timestamp}::timestamp) > (now() - INTERVAL ${sql.raw(lookbackHours)} hour) ELSE true END`,
              eq(activityScoresTable.datacontext_id, dataContextId),
            ),
          )
      }),
    )
  ).flatMap((scores, index) => {
    const { name, description, version, id, priority, ignoreOoh } =
      currentActivities[index]
    return scores.map(({ score, timestamp, debug }) => ({
      name,
      description,
      priority,
      ignoreOoh,
      userId,
      score,
      timestamp,
      debug,
      activityId: id,
      activityVersion: version,
      dataContextId,
    }))
  })

  return activityScores as ActivityScore[]
}
