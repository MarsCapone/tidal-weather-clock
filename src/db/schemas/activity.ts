import { integer, json, pgTable, text } from 'drizzle-orm/pg-core'
import { v4 as uuidv4 } from 'uuid'

export const activity = pgTable('activity', {
  id: text()
    .primaryKey()
    .$default(() => uuidv4()),
  name: text(),
  description: text(),
  priority: integer(),
  user_id: text(),
})

export const constraint = pgTable('constraint', {
  id: text()
    .primaryKey()
    .$default(() => uuidv4()),
  activity_id: text().references(() => activity.id),
  type: text(),
  content: json(),
})
