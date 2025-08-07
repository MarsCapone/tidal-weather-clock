import { db } from '@/db/context'
import { settingsTable } from '@/db/schemas/settings'
import { eq } from 'drizzle-orm'

export async function getSetting<T>(name: string): Promise<T> {
  const result = await db
    .select({ value: settingsTable.value })
    .from(settingsTable)
    .where(eq(settingsTable.name, name))
  return result[0].value as T
}

export async function putSetting<T>(name: string, value: T): Promise<void> {
  await db.insert(settingsTable).values({ name, value }).onConflictDoUpdate({
    target: settingsTable.name,
    set: {
      value,
    },
  })
}

export class SettingManager<T> {
  constructor(private readonly name: string) {
    this.name = name
  }

  async get(): Promise<T> {
    return await getSetting<T>(this.name)
  }

  async update(value: T): Promise<void> {
    return await putSetting<T>(this.name, value)
  }
}
