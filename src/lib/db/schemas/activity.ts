import { datacontextTable } from '@/lib/db/schemas/datacontext'
import { Constraint } from '@/lib/types/activity'
import {
  foreignKey,
  integer,
  json,
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
    content: json().$type<ActivityContent>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.id, table.version] })],
)

export const activityScoresTable = pgTable(
  'activity_score',
  {
    id: text()
      .primaryKey()
      .notNull()
      .$default(() => uuidv4()),
    datacontext_id: integer().references(() => datacontextTable.id),
    activity_id: text(),
    activity_version: integer(),
    score: real().notNull().default(0),
    debug: json().notNull().default('{}'),
  },
  (table) => [
    foreignKey({
      columns: [table.activity_id, table.activity_version],
      foreignColumns: [activityTable.id, activityTable.version],
    }),
    uniqueIndex('fks_uniq_idx').on(
      table.activity_id,
      table.activity_version,
      table.datacontext_id,
    ),
  ],
)
