import { integer, json, pgTable, text } from 'drizzle-orm/pg-core'
import { v4 as uuidv4 } from 'uuid'

export const activityTable = pgTable('activity', {
  id: text()
    .primaryKey()
    .$default(() => uuidv4()),
  name: text().notNull(),
  description: text().notNull(),
  priority: integer().notNull(),
  user_id: text().notNull(),
})

export const constraintTable = pgTable('constraint', {
  id: text()
    .primaryKey()
    .$default(() => uuidv4()),
  activity_id: text().references(() => activityTable.id),
  type: text().notNull(),
  content: json(),
})
