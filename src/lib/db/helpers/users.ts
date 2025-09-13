import logger from '@/app/api/pinoLogger'
import { doRefresh } from '@/app/api/refresh'
import { db } from '@/lib/db'
import {
  getActivitiesByUserId,
  putActivities,
  setActivities,
} from '@/lib/db/helpers/activity'
import { activityScoresTable, activityTable } from '@/lib/db/schemas/activity'
import { usersTable } from '@/lib/db/schemas/users'
import { addDays, startOfToday, subDays } from 'date-fns'
import { eq, inArray } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const users = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1)
  if (users.length === 0) {
    return null
  }
  return users[0].id
}

export async function createUserWithExtras(email: string): Promise<string> {
  /** Create a user and return the id */

  const userIdResults = await db
    .insert(usersTable)
    .values({
      email,
    })
    .onConflictDoNothing()
    .returning({ id: usersTable.id })
  const userId = userIdResults[0].id
  logger.debug('created user', { userId })

  // then do other setup
  // 1. copy all global activities to the user
  const globalActivities = await getActivitiesByUserId('global')
  logger.debug('copying global activities to user', {
    userId,
    activityCount: globalActivities.length,
  })
  await putActivities(
    globalActivities.map((a) => ({
      ...a,
      scope: 'user',
      id: uuidv4(),
      version: 1,
    })),
    userId,
  )

  // 2. refresh the data for these new activities
  await doRefresh({
    scope: 'user',
    userId,
    startDate: subDays(startOfToday(), 1),
    endDate: addDays(startOfToday(), 6),
  })

  return userId
}

export async function deleteUser(userId: string): Promise<void> {
  const activities = await db
    .delete(activityTable)
    .where(eq(activityTable.user_id, userId))
    .returning({ id: activityTable.id })
  await db.delete(activityScoresTable).where(
    inArray(
      activityScoresTable.activity_id,
      activities.map((a) => a.id),
    ),
  )
  await db.delete(usersTable).where(eq(usersTable.id, userId))
  logger.warn('deleted user', { userId, activityCount: activities.length })
}
