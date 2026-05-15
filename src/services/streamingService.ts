/**
 * Real-Time Data Streaming Service
 * Simulates live data from various sources
 * Can be replaced with actual WebSocket/SSE connections
 */

import type { MetricSeries, ActivityEvent, StreamingUpdate } from '../types';

// Metric definitions
const METRICS: Record<string, Omit<MetricSeries, 'data'>> = {
  cpu: {
    id: 'cpu',
    name: 'CPU Usage',
    color: '#ef4444',
    unit: '%',
    status: 'normal',
    trend: 'stable',
    lastValue: 45,
    changePercent: 0
  },
  memory: {
    id: 'memory',
    name: 'Memory Usage',
    color: '#3b82f6',
    unit: '%',
    status: 'normal',
    trend: 'stable',
    lastValue: 62,
    changePercent: 0
  },
  network: {
    id: 'network',
    name: 'Network I/O',
    color: '#10b981',
    unit: 'Mbps',
    status: 'normal',
    trend: 'stable',
    lastValue: 245,
    changePercent: 0
  },
  latency: {
    id: 'latency',
    name: 'Request Latency',
    color: '#f59e0b',
    unit: 'ms',
    status: 'normal',
    trend: 'stable',
    lastValue: 125,
    changePercent: 0
  },
  throughput: {
    id: 'throughput',
    name: 'Throughput',
    color: '#8b5cf6',
    unit: 'req/s',
    status: 'normal',
    trend: 'stable',
    lastValue: 8420,
    changePercent: 0
  },
  errors: {
    id: 'errors',
    name: 'Error Rate',
    color: '#ec4899',
    unit: '%',
    status: 'normal',
    trend: 'stable',
    lastValue: 0.8,
    changePercent: 0
  }
};

// Activity messages
const ACTIVITY_MESSAGES = [
  { message: 'High CPU usage detected', type: 'warning' as const, severity: 'high' as const },
  { message: 'Memory allocation increased', type: 'info' as const, severity: 'low' as const },
  { message: 'Request latency spike', type: 'warning' as const, severity: 'medium' as const },
  { message: 'Database query optimized', type: 'success' as const, severity: 'low' as const },
  { message: 'Cache hit rate improved', type: 'success' as const, severity: 'low' as const },
  { message: 'Network connection established', type: 'success' as const, severity: 'low' as const },
  { message: 'API endpoint responding normally', type: 'info' as const, severity: 'low' as const },
  { message: 'Disk usage at 85%', type: 'warning' as const, severity: 'high' as const },
  { message: 'Server health check passed', type: 'success' as const, severity: 'low' as const },
  { message: 'Authentication tokens refreshed', type: 'info' as const, severity: 'low' as const }
];

export interface StreamingServiceConfig {
  updateInterval?: number;
  activityInterval?: number;
  minVariation?: number;
  maxVariation?: number;
}

export class StreamingService {
  private updateInterval: number;
  private activityInterval: number;
  private minVariation: number;
  private maxVariation: number;
  private updateSubscribers: ((update: StreamingUpdate) => void)[] = [];
  private activitySubscribers: ((activity: ActivityEvent) => void)[] = [];
  private updateTimer: ReturnType<typeof setInterval> | null = null;
  private activityTimer: ReturnType<typeof setInterval> | null = null;
  private currentValues: Record<string, number> = {};
  private activityId = 0;

  constructor(config: StreamingServiceConfig = {}) {
    this.updateInterval = config.updateInterval ?? 1000;
    this.activityInterval = config.activityInterval ?? 5000;
    this.minVariation = config.minVariation ?? -5;
    this.maxVariation = config.maxVariation ?? 5;

    // Initialize current values
    Object.entries(METRICS).forEach(([key, metric]) => {
      this.currentValues[key] = metric.lastValue;
    });
  }

  /**
   * Initialize metrics with historical data
   */
  public initializeMetrics(): MetricSeries[] {
    return Object.values(METRICS).map((metric) => ({
      ...metric,
      data: this.generateHistoricalData(metric.id, 60)
    }));
  }

  /**
   * Generate historical data for initialization
   */
  private generateHistoricalData(metricId: string, points: number) {
    const now = Date.now();
    const data = [];
    let value = this.currentValues[metricId];

    for (let i = points - 1; i >= 0; i--) {
      data.push({
        timestamp: now - i * this.updateInterval,
        value: value + Math.random() * (this.maxVariation - this.minVariation) + this.minVariation
      });
      value = data[data.length - 1].value;
    }

    return data;
  }

  /**
   * Subscribe to metric updates
   */
  public onUpdate(callback: (update: StreamingUpdate) => void) {
    this.updateSubscribers.push(callback);
    return () => {
      this.updateSubscribers = this.updateSubscribers.filter((cb) => cb !== callback);
    };
  }

  /**
   * Subscribe to activity events
   */
  public onActivity(callback: (activity: ActivityEvent) => void) {
    this.activitySubscribers.push(callback);
    return () => {
      this.activitySubscribers = this.activitySubscribers.filter((cb) => cb !== callback);
    };
  }

  /**
   * Start streaming updates
   */
  public start() {
    if (this.updateTimer) return; // Already running

    this.updateTimer = setInterval(() => {
      this.emitUpdates();
    }, this.updateInterval);

    this.activityTimer = setInterval(() => {
      this.emitActivity();
    }, this.activityInterval);
  }

  /**
   * Stop streaming updates
   */
  public stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  /**
   * Emit metric updates to subscribers
   */
  private emitUpdates() {
    Object.keys(METRICS).forEach((metricId) => {
      const currentValue = this.currentValues[metricId];
      const variation = Math.random() * (this.maxVariation - this.minVariation) + this.minVariation;
      let newValue = currentValue + variation;

      // Add realistic patterns
      const hour = new Date().getHours();
      
      // Business hours spike
      if (hour >= 9 && hour <= 17) {
        newValue *= 1.1;
      }

      // Clamp values to realistic ranges
      switch (metricId) {
        case 'cpu':
        case 'memory':
        case 'errors':
          newValue = Math.max(0, Math.min(100, newValue));
          break;
        case 'network':
          newValue = Math.max(0, Math.min(1000, newValue));
          break;
        case 'latency':
          newValue = Math.max(10, Math.min(1000, newValue));
          break;
        case 'throughput':
          newValue = Math.max(100, Math.min(50000, newValue));
          break;
      }

      this.currentValues[metricId] = newValue;

      const update: StreamingUpdate = {
        metricId,
        value: Math.round(newValue * 100) / 100,
        timestamp: Date.now()
      };

      this.updateSubscribers.forEach((cb) => cb(update));
    });
  }

  /**
   * Emit activity events
   */
  private emitActivity() {
    // Random chance to emit activity (30%)
    if (Math.random() > 0.3) return;

    const msgConfig = ACTIVITY_MESSAGES[Math.floor(Math.random() * ACTIVITY_MESSAGES.length)];
    const sources = ['System', 'API', 'Database', 'Cache', 'Network', 'Auth'];

    const activity: ActivityEvent = {
      id: `activity-${this.activityId++}`,
      timestamp: Date.now(),
      source: sources[Math.floor(Math.random() * sources.length)],
      message: msgConfig.message,
      type: msgConfig.type,
      severity: msgConfig.severity
    };

    this.activitySubscribers.forEach((cb) => cb(activity));
  }

  /**
   * Get current metric values
   */
  public getCurrentValues(): Record<string, number> {
    return { ...this.currentValues };
  }

  /**
   * Reset to initial state
   */
  public reset() {
    this.stop();
    Object.entries(METRICS).forEach(([key, metric]) => {
      this.currentValues[key] = metric.lastValue;
    });
    this.activityId = 0;
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
