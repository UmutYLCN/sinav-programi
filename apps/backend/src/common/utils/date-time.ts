/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { DateTime } from 'luxon';

export const DEFAULT_TIMEZONE = 'Europe/Istanbul';

export function toZonedDateTime(
  value: string | Date,
  timezone = DEFAULT_TIMEZONE,
): DateTime {
  return typeof value === 'string'
    ? DateTime.fromISO(value, { zone: timezone })
    : DateTime.fromJSDate(value, { zone: timezone });
}

export function combineDateAndTime(
  date: string,
  time: string,
  timezone = DEFAULT_TIMEZONE,
): DateTime {
  return DateTime.fromISO(`${date}T${time}`, { zone: timezone });
}

export function durationsOverlap(
  startA: DateTime,
  endA: DateTime,
  startB: DateTime,
  endB: DateTime,
): boolean {
  return startA < endB && startB < endA;
}
