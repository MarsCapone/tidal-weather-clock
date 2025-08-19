import { db } from '@/lib/db'
import { settingsTable } from '@/lib/db/schemas/settings'
import { eq, and } from 'drizzle-orm'

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

export async function getGlobalSetting<T>(
  name: SettingName,
): Promise<T | undefined> {
  return await getSetting(name, 'global')
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
