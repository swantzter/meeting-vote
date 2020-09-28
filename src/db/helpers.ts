import { DateTime } from 'luxon'

export const DateTransformer = {
  from: (dbValue?: string) => !dbValue ? null : DateTime.fromISO(dbValue, { zone: 'utc' }).toJSDate(),
  to: (entityValue?: Date) => !entityValue ? null : DateTime.fromJSDate(entityValue, { zone: 'utc' }).toISODate()
}
