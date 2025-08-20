import { datacontextTable } from '@/lib/db/schemas/datacontext'
import { Constraint } from '@/lib/types/activity'
import {
  decimal,
  index,
  integer,
  json,
  numeric,
  pgTable,
  primaryKey,
  real,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
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

export const activityScoresTable = pgTable(
  'suggestions',
  {
    id: text()
      .primaryKey()
      .notNull()
      .$default(() => uuidv4()),
    datacontext_id: integer().references(() => datacontextTable.id),
    activity_id: text().references(() => activityTable.id),
    activity_version: integer().references(() => activityTable.version),
    score: real().notNull().default(0),
    debug: json().notNull().default('{}'),
  },
  (table) => [
    uniqueIndex('fks_uniq_idx').on(
      table.activity_id,
      table.activity_version,
      table.datacontext_id,
    ),
    index('activity_idx').on(table.activity_id, table.activity_version),
  ],
)
