const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

export default function dateParser (key: string, value: any): Date | any {
  return typeof value === 'string' && reISO.test(value)
    ? new Date(value)
    : value
}
