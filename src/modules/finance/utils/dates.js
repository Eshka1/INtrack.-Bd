function toMidnightUTC(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: ${dateInput}`);
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function diffDays(date1, date2) {
  const d1 = toMidnightUTC(date1);
  const d2 = toMidnightUTC(date2);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY);
}

function getMonthRange(month, year) {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(m) || m < 1 || m > 12 || isNaN(y) || y < 1970) {
    throw new Error('Invalid month or year for date range');
  }

  const startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { startDate, endDate };
}

function getYearRange(year) {
  const y = parseInt(year, 10);
  if (isNaN(y) || y < 1970) {
    throw new Error('Invalid year for date range');
  }
  const startDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
  return { startDate, endDate };
}

module.exports = {
  toMidnightUTC,
  diffDays,
  getMonthRange,
  getYearRange
};
