import { json, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

export const settingsTable = pgTable(
  'settings',
  {
    name: text().notNull(),
    value: json(),
    // we will set user:{userid}
    scope: text().default('global').notNull(),
  },
  (table) => [primaryKey({ columns: [table.name, table.scope] })],
)
