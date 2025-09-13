import logger from '@/app/api/pinoLogger'
import { db } from '@/lib/db'
import { settingsTable } from '@/lib/db/schemas/settings'
import { and, eq } from 'drizzle-orm'

type SettingName = string

export async function getSetting<T>(
  name: SettingName,
  userId: string | null,
): Promise<T | undefined> {
  const where =
    userId === null
      ? and(eq(settingsTable.name, name), eq(settingsTable.scope, 'global'))
      : and(eq(settingsTable.name, name), eq(settingsTable.user_id, userId))

  const result = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(where)

  if (result.length > 0) {
    return result[0].value as T
  }
  return undefined
}

export async function putSetting<T>(
  name: SettingName,
  value: T,
  userId: string,
): Promise<void> {
  await db
    .insert(settingsTable)
    .values({ name, value, scope: 'user', user_id: userId })
    .onConflictDoUpdate({
      target: [settingsTable.name, settingsTable.scope, settingsTable.user_id],
      set: {
        value,
      },
    })
}

export async function getOrPutSetting<T>(
  name: SettingName,
  userId: string | null,
  fallback: T,
): Promise<T> {
  logger.debug('Getting setting with fallback', {
    name,
    userId,
    fallback,
  })
  if (userId === null) {
    return fallback
  }
  const value = await getSetting<T>(name, userId)
  if (value === undefined) {
    await putSetting<T>(name, fallback, userId)
    return fallback
  }
  return value
}
