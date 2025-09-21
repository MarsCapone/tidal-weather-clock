import { usersTable } from '@/lib/db/schemas/users'
import { json, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

export const settingsTable = pgTable(
  'settings',
  {
    name: text().notNull(),
    value: json(),
    // we will set user:{userid}
    scope: text().default('global').notNull(),
    user_id: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.name, table.scope, table.user_id] }),
  ],
)
