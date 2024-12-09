export interface TimePeriod {
  label: string;
  value: string;
  unit: 'minute' | 'hour' | 'day' | 'week' | 'month';
}
