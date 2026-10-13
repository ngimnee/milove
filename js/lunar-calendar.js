/* --------------------------------------------------------------------------
   LUNAR CALENDAR (Vietnamese, UTC+7)
   Solar → lunar date, after Hồ Ngọc Đức's astronomical algorithm. Used by the
   special days to find Tết Nguyên Đán (1/1 âm), Rằm Trung thu (15/8 âm), ...
   Not Intl's "chinese" calendar: that one follows China's UTC+8 midnight and is
   a day off from the Vietnamese calendar in some years.
   -------------------------------------------------------------------------- */

const LunarCalendar = (function () {
  'use strict';

  const TIME_ZONE = 7;
  const SYNODIC_MONTH = 29.530588853;
  const DEG = Math.PI / 180;
  const int = Math.floor;

  function julianDay(day, month, year) {
    const a = int((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;
  }

  // Julian day number of the local day holding the k-th new moon
  function newMoonDay(k) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    let jd = 2415020.75933 + SYNODIC_MONTH * k + 0.0001178 * T2 - 0.000000155 * T3;
    jd += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * DEG);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;       // Sun's mean anomaly
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;    // Moon's mean anomaly
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;       // Moon's argument of latitude
    let c = (0.1734 - 0.000393 * T) * Math.sin(M * DEG) + 0.0021 * Math.sin(2 * DEG * M);
    c -= 0.4068 * Math.sin(Mpr * DEG) - 0.0161 * Math.sin(DEG * 2 * Mpr);
    c -= 0.0004 * Math.sin(DEG * 3 * Mpr);
    c += 0.0104 * Math.sin(DEG * 2 * F) - 0.0051 * Math.sin(DEG * (M + Mpr));
    c -= 0.0074 * Math.sin(DEG * (M - Mpr)) - 0.0004 * Math.sin(DEG * (2 * F + M));
    c -= 0.0004 * Math.sin(DEG * (2 * F - M)) + 0.0006 * Math.sin(DEG * (2 * F + Mpr));
    c += 0.0010 * Math.sin(DEG * (2 * F - Mpr)) + 0.0005 * Math.sin(DEG * (2 * Mpr + M));
    const deltaT = T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return int(jd + c - deltaT + 0.5 + TIME_ZONE / 24);
  }

  // The sun's longitude at local midnight of that day, in 30° sectors (0–11)
  function sunSector(jdn) {
    const T = (jdn - 2451545.5 - TIME_ZONE / 24) / 36525;
    const T2 = T * T;
    const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let dl = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(DEG * M);
    dl += (0.019993 - 0.000101 * T) * Math.sin(DEG * 2 * M) + 0.00029 * Math.sin(DEG * 3 * M);
    let L = (L0 + dl) * DEG;
    L -= Math.PI * 2 * int(L / (Math.PI * 2));
    return int((L / Math.PI) * 6);
  }

  // First day of the lunar month 11 (the one holding the winter solstice) of that solar year
  function lunarMonth11(year) {
    const k = int((julianDay(31, 12, year) - 2415021) / SYNODIC_MONTH);
    const nm = newMoonDay(k);
    return sunSector(nm) >= 9 ? newMoonDay(k - 1) : nm;
  }

  // Which month after month 11 is the leap one (the first without a major solar term)
  function leapMonthOffset(a11) {
    const k = int((a11 - 2415021.076998695) / SYNODIC_MONTH + 0.5);
    let i = 1;
    let arc = sunSector(newMoonDay(k + i));
    let last;
    do {
      last = arc;
      i++;
      arc = sunSector(newMoonDay(k + i));
    } while (arc !== last && i < 14);
    return i - 1;
  }

  /**
   * @param {Date} date local calendar date (its own day, month and year are used)
   * @returns {{ day: number, month: number, year: number, isLeap: boolean }}
   */
  function fromDate(date) {
    const dayNumber = julianDay(date.getDate(), date.getMonth() + 1, date.getFullYear());
    const k = int((dayNumber - 2415021.076998695) / SYNODIC_MONTH);
    let monthStart = newMoonDay(k + 1);
    if (monthStart > dayNumber) monthStart = newMoonDay(k);

    const solarYear = date.getFullYear();
    let a11 = lunarMonth11(solarYear);
    let b11 = a11;
    let year;
    if (a11 >= monthStart) {
      year = solarYear;
      a11 = lunarMonth11(solarYear - 1);
    } else {
      year = solarYear + 1;
      b11 = lunarMonth11(solarYear + 1);
    }

    const diff = int((monthStart - a11) / 29);
    let month = diff + 11;
    let isLeap = false;
    if (b11 - a11 > 365) {
      const leap = leapMonthOffset(a11);
      if (diff >= leap) {
        month = diff + 10;
        isLeap = diff === leap;
      }
    }
    if (month > 12) month -= 12;
    if (month >= 11 && diff < 4) year -= 1;

    return { day: dayNumber - monthStart + 1, month, year, isLeap };
  }

  return { fromDate };
})();
