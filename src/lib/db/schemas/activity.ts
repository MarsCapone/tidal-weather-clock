import { datacontextTable } from '@/lib/db/schemas/datacontext'
import { usersTable } from '@/lib/db/schemas/users'
import { Constraint } from '@/lib/types/activity'
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
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
    user_id: text().references(() => usersTable.id, { onDelete: 'cascade' }),
    content: json().$type<ActivityContent>().notNull(),
    created_at: timestamp().defaultNow().notNull(),
    ignore_ooh: boolean().notNull().default(false),
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
    datacontext_id: integer().references(() => datacontextTable.id, {
      onDelete: 'set null',
    }),
    activity_id: text(),
    activity_version: integer(),
    timestamp: text().notNull(),
    score: real().notNull().default(0),
    debug: json(),
  },
  (table) => [
    foreignKey({
      columns: [table.activity_id, table.activity_version],
      foreignColumns: [activityTable.id, activityTable.version],
    }).onDelete('cascade'),
    uniqueIndex('fks_uniq_idx').on(
      table.activity_id,
      table.activity_version,
      table.datacontext_id,
      table.timestamp,
    ),
  ],
)
