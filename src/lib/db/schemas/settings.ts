import { json, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

export const settingsTable = pgTable(
  'settings',
  {
    name: text(),
    value: json(),
    // we will set user:{userid}
    scope: text().default('global'),
  },
  (table) => [primaryKey({ columns: [table.name, table.scope] })],
)
