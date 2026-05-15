import { defineStore } from 'pinia'
import type {
  ActivityEvent,
  DashboardFilters,
  DashboardState,
  MetricSeries,
  StreamingUpdate
} from '../types'

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState & { isDarkMode: boolean } => ({
    metrics: [],
    activities: [],
    isDarkMode: typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false,
    filters: {
      timeRange: 'live',
      selectedMetrics: [],
      isStreaming: true,
      chartType: 'line'
    },
    connection: {
      isConnected: false,
      isReconnecting: false,
      lastUpdate: Date.now(),
      reconnectAttempts: 0
    }
  }),
  getters: {
    selectedMetrics(state): MetricSeries[] {
      if (state.filters.selectedMetrics.length === 0) return state.metrics
      return state.metrics.filter((metric) => state.filters.selectedMetrics.includes(metric.id))
    }
  },
  actions: {
    setMetrics(metrics: MetricSeries[]) {
      this.metrics = metrics
    },

    updateMetric(update: StreamingUpdate) {
      this.metrics = this.metrics.map((metric) => {
        if (metric.id !== update.metricId) return metric

        const newData = [...metric.data, { timestamp: update.timestamp, value: update.value }]
        const limitedData = newData.slice(-200)
        const oldValue = metric.lastValue
        const newValue = update.value
        const changePercent = oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0
        const trend = newValue > oldValue ? 'up' : newValue < oldValue ? 'down' : 'stable'
        let status: 'normal' | 'warning' | 'critical' = 'normal'

        if (newValue > 80) status = 'critical'
        else if (newValue > 60) status = 'warning'

        return {
          ...metric,
          data: limitedData,
          lastValue: newValue,
          changePercent,
          trend,
          status
        }
      })
      this.connection.lastUpdate = Date.now()
    },

    addMetricDataPoint(metricId: string, value: number) {
      const update: StreamingUpdate = {
        metricId,
        value,
        timestamp: Date.now()
      }
      this.updateMetric(update)
    },

    toggleMetric(metricId: string) {
      const selected = this.filters.selectedMetrics.includes(metricId)
      this.filters.selectedMetrics = selected
        ? this.filters.selectedMetrics.filter((id) => id !== metricId)
        : [...this.filters.selectedMetrics, metricId]
    },

    addActivity(activity: ActivityEvent) {
      this.activities = [activity, ...this.activities].slice(0, 100)
    },

    clearActivities() {
      this.activities = []
    },

    removeActivity(id: string) {
      this.activities = this.activities.filter((activity) => activity.id !== id)
    },

    setTimeRange(timeRange: DashboardFilters['timeRange']) {
      this.filters.timeRange = timeRange
    },

    setChartType(chartType: DashboardFilters['chartType']) {
      this.filters.chartType = chartType
    },

    toggleStreaming() {
      this.filters.isStreaming = !this.filters.isStreaming
    },

    setConnected(isConnected: boolean) {
      this.connection.isConnected = isConnected
      if (isConnected) {
        this.connection.isReconnecting = false
        this.connection.reconnectAttempts = 0
      }
    },

    setReconnecting(isReconnecting: boolean) {
      this.connection.isReconnecting = isReconnecting
    },

    incrementReconnectAttempts() {
      this.connection.reconnectAttempts = Math.min(this.connection.reconnectAttempts + 1, 10)
    },

    resetReconnectAttempts() {
      this.connection.reconnectAttempts = 0
    },

    setConnectionError(error?: string) {
      this.connection.error = error
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(this.isDarkMode))
      }
    }
  }
})
