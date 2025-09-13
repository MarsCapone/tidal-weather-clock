import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { v4 as uuidv4 } from 'uuid'

export const usersTable = pgTable(
  'users',
  {
    id: text()
      .notNull()
      .$default(() => uuidv4())
      .unique(),
    email: text().notNull().unique(),
    created_at: timestamp().notNull().defaultNow(),
    last_login: timestamp(),
    copied_global_activities: boolean().notNull().default(false),
  },
  (table) => [],
)
