import { json, pgTable, text } from 'drizzle-orm/pg-core'

export const settingsTable = pgTable('settings', {
  name: text().primaryKey(),
  value: json(),
  // if we want to have different settings for different people, we can do something like scope=user_id
  // scope: text().default('global'),
})
