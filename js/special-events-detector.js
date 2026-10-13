/* --------------------------------------------------------------------------
   SPECIAL DAYS - DETECTOR
   Decides which event (if any) belongs to today, using the browser's local
   calendar date only (never UTC), so 00:05 on 20/10 in Vietnam is 20/10.

   Debug (read from the URL on every load, never stored):
     ?specialEvent=valentine     force one event by id, ignoring its date/enabled flag
     ?specialDate=2027-02-14     pretend today is that date (also MM-DD) and run normal detection
   -------------------------------------------------------------------------- */

const SpecialEventsDetector = (function () {
  'use strict';

  const DEBUG_EVENT_PARAM = 'specialEvent';
  const DEBUG_DATE_PARAM = 'specialDate';
  const DEBUG_DATE_PATTERN = /^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})$/;

  /**
   * @returns {{ event: object, stamp: { day: number, month: number }, years: number|null, days: number|null } | null}
   *   stamp = the date engraved on the seal (the event's own day, even when forced for debugging)
   *   years = years since a `since` date; days = days since a `daysSince` date (for {years} / {days} in the text)
   */
  function detect() {
    const debug = readDebugOverrides();
    const today = debug.date || new Date();

    if (debug.eventId) return forceEvent(debug.eventId, today);

    // Highest priority wins; stable sort keeps config order for ties.
    // Returning the whole list here instead would allow one combined experience later.
    const matches = SpecialEventsData.events
      .filter(event => event.enabled !== false)
      .map(event => matchEvent(event, today))
      .filter(Boolean)
      .sort((a, b) => b.event.priority - a.event.priority);

    return matches[0] || null;
  }

  function matchEvent(event, date) {
    const rule = toRule(event.date);
    return rule && occursOn(rule, date) ? createOccurrence(event, date, rule) : null;
  }

  function forceEvent(id, date) {
    const event = SpecialEventsData.events.find(item => item.id === id);
    if (!event) {
      console.warn(`[SpecialEvents] Unknown debug event "${id}". Known ids:`, SpecialEventsData.events.map(item => item.id));
      return null;
    }
    return createOccurrence(event, date, toRule(event.date));
  }

  // Normalizes the config `date` into one of:
  //   { month, day, year?, sinceYear? }   solar date (every year / one year / yearly after `since`)
  //   { lunar: { month, day } }           lunar date, every year
  //   { startDate, milestones: [days] }   the days counted since startDate (as the site's counter shows them)
  function toRule(date) {
    if (!date) return null;
    if (isValidDate(date.since)) {
      return {
        month: date.since.getMonth() + 1,
        day: date.since.getDate(),
        sinceYear: date.since.getFullYear()
      };
    }
    if (date.lunar) {
      const { month, day } = date.lunar;
      return Number.isInteger(month) && Number.isInteger(day) ? { lunar: { month, day } } : null;
    }
    if (isValidDate(date.daysSince) && Array.isArray(date.milestones)) {
      return { startDate: date.daysSince, milestones: date.milestones };
    }
    return Number.isInteger(date.month) && Number.isInteger(date.day) ? date : null;
  }

  function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }

  // Whole calendar days from `from` to `to` (both read as local dates, so DST never shifts the count)
  function daysBetween(from, to) {
    const day = date => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.round((day(to) - day(from)) / 86400000);
  }

  function occursOn(rule, date) {
    if (rule.lunar) return isLunarDay(rule.lunar, date);
    if (rule.milestones) return rule.milestones.includes(daysBetween(rule.startDate, date));
    const year = date.getFullYear();
    if (rule.year !== undefined && rule.year !== year) return false;
    if (rule.sinceYear !== undefined && year <= rule.sinceYear) return false;
    if (date.getMonth() + 1 !== rule.month) return false;
    return date.getDate() === rule.day || isLeapDayFallback(rule, date);
  }

  // A 29/02 birthday still gets its day in non-leap years, on 28/02
  function isLeapDayFallback(rule, date) {
    return rule.month === 2 && rule.day === 29 && date.getDate() === 28 && !isLeapYear(date.getFullYear());
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // The 15th of the leap 8th month is not Trung thu: only the regular month counts
  function isLunarDay({ month, day }, date) {
    const lunar = LunarCalendar.fromDate(date);
    return !lunar.isLeap && lunar.month === month && lunar.day === day;
  }

  function createOccurrence(event, date, rule) {
    const years = rule && rule.sinceYear !== undefined
      ? Math.max(1, date.getFullYear() - rule.sinceYear)
      : null;
    const days = rule && rule.milestones ? daysBetween(rule.startDate, date) : null;
    // The seal shows the event's own solar date; for lunar / counted days that is simply today's
    const stamp = rule && rule.day !== undefined
      ? { day: rule.day, month: rule.month }
      : { day: date.getDate(), month: date.getMonth() + 1 };
    return { event: withDefaults(event), stamp, years, days };
  }

  function withDefaults(event) {
    const { defaults } = SpecialEventsData;
    return {
      ...defaults,
      ...event,
      content: { ...defaults.content, ...event.content }
    };
  }

  // ── Debug overrides ─────────────────────────────────────────────────────

  function readDebugOverrides() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get(DEBUG_EVENT_PARAM);
    const date = parseDebugDate(params.get(DEBUG_DATE_PARAM));

    if (params.has(DEBUG_DATE_PARAM) && !date) {
      console.warn(`[SpecialEvents] Ignoring invalid ${DEBUG_DATE_PARAM}; use YYYY-MM-DD or MM-DD.`);
    }
    if (eventId || date) {
      console.info('[SpecialEvents] Debug mode:', { event: eventId, date: date ? date.toDateString() : null });
    }
    return { eventId, date };
  }

  function parseDebugDate(value) {
    const match = DEBUG_DATE_PATTERN.exec(value || '');
    if (!match) return null;

    const now = new Date();
    const year = match[1] ? Number(match[1]) : now.getFullYear();
    const month = Number(match[2]);
    const day = Number(match[3]);
    // Built from local fields on purpose: new Date('2027-02-14') parses as UTC midnight
    // and lands on 13/02 in timezones west of UTC.
    const date = new Date(year, month - 1, day, now.getHours(), now.getMinutes());
    return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }

  return { detect };
})();
