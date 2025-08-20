import {
  date,
  decimal,
  index,
  json,
  pgTable,
  real,
  serial,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const datacontextTable = pgTable(
  'datacontext',
  {
    id: serial().primaryKey(),
    date: date().notNull(),
    latitude: real(),
    longitude: real(),
    data: json(),
    last_updated: timestamp().defaultNow(),
  },
  (table) => [
    index('idx_datacontext_date_location').on(
      table.date,
      table.latitude,
      table.longitude,
    ),
    uniqueIndex('unique_date_location').on(
      table.date,
      table.latitude,
      table.longitude,
    ),
  ],
)
