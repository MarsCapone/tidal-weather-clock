import { integer, json, pgTable, text } from 'drizzle-orm/pg-core'
import { v4 as uuidv4 } from 'uuid'
import { Constraint } from '@/lib/types/activity'

type ActivityContent = {
  constraints: Constraint[]
}

export const activityTable = pgTable('activity', {
  id: text()
    .primaryKey()
    .$default(() => uuidv4()),
  name: text().notNull(),
  description: text().notNull(),
  priority: integer().notNull(),
  user_id: text().notNull(),
  content: json()
    .default('{"constraints": []}')
    .$type<ActivityContent>()
    .notNull(),
})
