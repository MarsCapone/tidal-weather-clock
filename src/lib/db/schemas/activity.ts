import { Constraint } from '@/lib/types/activity'
import { integer, json, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { v4 as uuidv4 } from 'uuid'

type ActivityContent = {
  constraints: Constraint[]
}

export const activityTable = pgTable(
  'activity',
  {
    id: text()
      .notNull()
      .$default(() => uuidv4()),
    version: integer().notNull().default(1),
    name: text().notNull(),
    description: text().notNull(),
    priority: integer().notNull(),
    user_id: text().notNull(),
    content: json()
      .default('{"constraints": []}')
      .$type<ActivityContent>()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.id, table.version] })],
)
