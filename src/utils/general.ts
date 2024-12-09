// src/utils.ts

/**
 * Formats a number with the appropriate suffix (K, M, B, T) based on its size.
 * @param num The number to format.
 * @param decimals The number of decimal places to include.
 * @returns The formatted number as a string.
 */
export const formatNumber = (
  num: number | undefined | null,
  decimals = 2
): string => {
  if (num === undefined || num === null) return '0';

  // Convert string numbers to actual numbers
  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  // Check if it's a valid number after conversion
  if (isNaN(numValue)) return '0';

  if (numValue >= 1e12) return (numValue / 1e12).toFixed(decimals) + 'T';
  if (numValue >= 1e9) return (numValue / 1e9).toFixed(decimals) + 'B';
  if (numValue >= 1e6) return (numValue / 1e6).toFixed(decimals) + 'M';
  if (numValue >= 1e3) return (numValue / 1e3).toFixed(decimals) + 'K';
  return numValue.toFixed(decimals);
};

/**
 * Formats a number as a percentage.
 * @param num The number to format.
 * @returns The formatted percentage as a string.
 */
export const formatPercentage = (num: number | undefined | null): string => {
  // console.log('formatPercentage input:', num, 'type:', typeof num);

  if (num === undefined || num === null) return '0%';

  // Convert string numbers to actual numbers
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  // console.log('formatPercentage converted:', numValue, 'type:', typeof numValue);

  // Check if it's a valid number after conversion
  if (isNaN(numValue)) return '0%';

  return numValue > 0 ? `+${numValue.toFixed(2)}%` : `${numValue.toFixed(2)}%`;
};
