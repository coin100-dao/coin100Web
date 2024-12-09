export interface DateRange {
  start: string;
  end: string;
}

export const convertPeriodToDates = (period: string): DateRange => {
  const now = new Date();
  const end = now.toISOString();
  const start = new Date(now);

  // Extract numeric value and unit from period string
  const match = period.match(/^(\d+)([mhdwy])$/);
  if (!match) {
    throw new Error(
      'Invalid period format. Use: [number][m/h/d/w/y] (e.g., 5m, 1h, 1d)'
    );
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  if (value <= 0) {
    throw new Error('Period value must be positive');
  }

  switch (unit) {
    case 'm': // minutes
      start.setMinutes(start.getMinutes() - value);
      break;
    case 'h': // hours
      start.setHours(start.getHours() - value);
      break;
    case 'd': // days
      start.setDate(start.getDate() - value);
      break;
    case 'w': // weeks
      start.setDate(start.getDate() - value * 7);
      break;
    case 'y': // years
      start.setFullYear(start.getFullYear() - value);
      break;
    default:
      throw new Error(
        'Invalid period unit. Use: m (minutes), h (hours), d (days), w (weeks), y (years)'
      );
  }

  // Ensure dates are in UTC format
  return {
    start: start.toISOString(),
    end: end,
  };
};

// Helper function to validate ISO date string
export const isValidISODate = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

// Helper function to format a date to ISO string
export const formatToISO = (date: Date): string => {
  return date.toISOString();
};
