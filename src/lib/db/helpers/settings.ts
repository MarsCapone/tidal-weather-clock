import { db } from '@/lib/db'
import { settingsTable } from '@/lib/db/schemas/settings'
import { eq } from 'drizzle-orm'

type SettingName = string

export async function getSetting<T>(name: SettingName): Promise<T | undefined> {
  const result = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.name, name))

  if (result.length > 0) {
    return result[0].value as T
  }
  return undefined
}

export async function putSetting<T>(
  name: SettingName,
  value: T,
): Promise<void> {
  await db.insert(settingsTable).values({ name, value }).onConflictDoUpdate({
    target: settingsTable.name,
    set: {
      value,
    },
  })
}

export class SettingManager<T> {
  constructor(private readonly name: SettingName) {
    this.name = name
  }

  async get(): Promise<T | undefined> {
    return await getSetting<T>(this.name)
  }

  async update(value: T): Promise<void> {
    return await putSetting<T>(this.name, value)
  }
}
