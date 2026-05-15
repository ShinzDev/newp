/**
 * Real-Time Analytics Dashboard - Core Type Definitions
 */

// Metric data point
export interface MetricDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

// Metric series with historical data
export interface MetricSeries {
  id: string;
  name: string;
  color: string;
  unit?: string;
  data: MetricDataPoint[];
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastValue: number;
  changePercent: number;
}

// Activity event
export interface ActivityEvent {
  id: string;
  timestamp: number;
  source: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Dashboard filters and controls
export interface DashboardFilters {
  timeRange: '1m' | '5m' | '1h' | '24h' | 'live';
  selectedMetrics: string[];
  isStreaming: boolean;
  chartType: 'line' | 'bar' | 'area';
}

// Connection state
export interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastUpdate: number;
  reconnectAttempts: number;
  error?: string;
}

// Dashboard state
export interface DashboardState {
  metrics: MetricSeries[];
  activities: ActivityEvent[];
  filters: DashboardFilters;
  connection: ConnectionState;
  isDarkMode: boolean;
}

// Chart configuration
export interface ChartConfig {
  title: string;
  type: 'line' | 'bar' | 'area';
  metrics: string[];
  height: number;
  responsive: boolean;
}

// Real-time update payload
export interface StreamingUpdate {
  metricId: string;
  value: number;
  timestamp: number;
}

// API response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}
