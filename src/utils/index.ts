/**
 * Utility functions for data formatting and filtering
 */

import { formatDistanceToNow, format } from 'date-fns';
import type { MetricDataPoint } from '../types';

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

/**
 * Format timestamp as HH:mm
 */
export function formatTimeHM(timestamp: number): string {
  return format(new Date(timestamp), 'HH:mm');
}

/**
 * Format metric value with unit
 */
export function formatMetricValue(value: number, unit?: string): string {
  let formatted: string;

  if (value >= 1000000) {
    formatted = (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    formatted = (value / 1000).toFixed(2) + 'K';
  } else {
    formatted = value.toFixed(2);
  }

  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Get percent change display with color
 */
export function getChangeDisplay(changePercent: number): { text: string; color: string } {
  const sign = changePercent > 0 ? '+' : '';
  const color =
    changePercent > 0 ? 'text-green-500' : changePercent < 0 ? 'text-red-500' : 'text-gray-500';
  return {
    text: `${sign}${changePercent.toFixed(2)}%`,
    color
  };
}

/**
 * Filter metric data by time range
 */
export function filterDataByTimeRange(
  data: MetricDataPoint[],
  timeRange: '1m' | '5m' | '1h' | '24h' | 'live'
): MetricDataPoint[] {
  if (timeRange === 'live') return data;

  const now = Date.now();
  const ranges: Record<string, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000
  };

  const cutoff = now - ranges[timeRange];
  return data.filter((point) => point.timestamp >= cutoff);
}

/**
 * Aggregate data points for downsampling
 */
export function aggregateDataPoints(
  data: MetricDataPoint[],
  bucketSize: number
): MetricDataPoint[] {
  if (data.length <= bucketSize) return data;

  const buckets: Record<number, number[]> = {};
  const aggregated: MetricDataPoint[] = [];

  // Group data into buckets
  data.forEach((point) => {
    const bucketIndex = Math.floor(point.timestamp / bucketSize);
    if (!buckets[bucketIndex]) {
      buckets[bucketIndex] = [];
    }
    buckets[bucketIndex].push(point.value);
  });

  // Average each bucket
  Object.entries(buckets)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([bucketIndex, values]) => {
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      aggregated.push({
        timestamp: Number(bucketIndex) * bucketSize,
        value: Math.round(average * 100) / 100
      });
    });

  return aggregated;
}

/**
 * Calculate statistics for a metric
 */
export function calculateMetricStats(data: MetricDataPoint[]) {
  if (data.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      latest: 0
    };
  }

  const values = data.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  const latest = values[values.length - 1];

  return { min, max, avg, latest };
}

/**
 * Get severity color
 */
export function getSeverityColor(
  severity: 'low' | 'medium' | 'high' | 'critical'
): string {
  const colors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
}

/**
 * Get status color
 */
export function getStatusColor(status: 'normal' | 'warning' | 'critical'): string {
  const colors: Record<string, string> = {
    normal: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500'
  };
  return colors[status] || 'text-gray-500';
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    const clearTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    if (now - lastCall >= delay) {
      lastCall = now;
      clearTimer();
      func(...args);
    } else {
      clearTimer();
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Generate mock data for testing
 */
export function generateMockData(count: number, baseValue: number = 50): MetricDataPoint[] {
  const now = Date.now();
  const data: MetricDataPoint[] = [];

  for (let i = count - 1; i >= 0; i--) {
    data.push({
      timestamp: now - i * 1000,
      value: baseValue + Math.random() * 30 - 15
    });
  }

  return data;
}
