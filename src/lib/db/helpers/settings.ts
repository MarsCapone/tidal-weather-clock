import logger from '@/app/api/pinoLogger'
import { db } from '@/lib/db'
import { settingsTable } from '@/lib/db/schemas/settings'
import { and, eq } from 'drizzle-orm'

type SettingName = string

export async function getSetting<T>(
  name: SettingName,
  userId: string,
): Promise<T | undefined> {
  const result = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(
      and(
        eq(settingsTable.name, name),
        eq(settingsTable.scope, `user:${userId}`),
      ),
    )

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
    .values({ name, value, scope: `user:${userId}` })
    .onConflictDoUpdate({
      target: [settingsTable.name, settingsTable.scope],
      set: {
        value,
      },
    })
}

export async function getOrPutSetting<T>(
  name: SettingName,
  userId: string,
  fallback: T,
): Promise<T> {
  logger.debug('Getting setting with fallback', {
    name,
    userId,
    fallback,
  })
  const value = await getSetting<T>(name, userId)
  if (value === undefined) {
    await putSetting<T>(name, fallback, userId)
    return fallback
  }
  return value
}
