<template>
  <div :class="['min-h-screen transition-colors duration-300', isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-900']">
    <div class="mx-auto max-w-7xl px-4 py-6">
      <header class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Realtime Analytics Platform</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Live Streaming Operations Dashboard</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Smooth live metrics, interactive charts, and an event feed built to feel production-ready.
          </p>
        </div>

        <button
          @click="toggleTheme"
          class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {{ isDarkMode ? 'Switch to Light' : 'Switch to Dark' }}
        </button>
      </header>

      <ConnectionBanner :connection="connection" />

      <DashboardControls
        :filters="filters"
        @update:timeRange="setTimeRange"
        @update:chartType="setChartType"
        @toggleStreaming="toggleStreaming"
      />

      <section class="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              v-for="metric in selectedMetrics"
              :key="metric.id"
              :metric="metric"
            />
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
            <div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Overview</p>
                <h2 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Operational Metrics</h2>
              </div>
              <p class="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Inspect the current stream across multiple metrics with responsive chart layers and fast updates.
              </p>
            </div>
            <ChartWrapper title="System Metrics" :metrics="selectedMetrics" :defaultType="filters.chartType" />
          </div>
        </div>

        <div class="space-y-6">
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
            <div class="mb-5">
              <p class="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Activity</p>
              <h2 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Live Event Feed</h2>
            </div>
            <ActivityFeed :activities="activities" @remove="removeActivity" />
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
            <div class="mb-4">
              <p class="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Stream Control</p>
              <h2 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Connection Health</h2>
            </div>
            <div class="grid gap-4">
              <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <p class="text-sm text-slate-500 dark:text-slate-400">Status</p>
                <p class="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ connection.isConnected ? 'Connected' : 'Offline' }}</p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Last update: {{ new Date(connection.lastUpdate).toLocaleTimeString() }}</p>
              </div>
              <button
                @click="toggleStreaming"
                class="rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {{ filters.isStreaming ? 'Pause Stream' : 'Resume Stream' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { streamingService } from '@/services/streamingService'
import { filterDataByTimeRange } from '@/utils'
import type { DashboardFilters, MetricSeries } from '@/types'
import ActivityFeed from '@/components/common/ActivityFeed.vue'
import ChartWrapper from '@/components/charts/ChartWrapper.vue'
import ConnectionBanner from '@/components/common/ConnectionBanner.vue'
import DashboardControls from '@/components/common/DashboardControls.vue'
import MetricCard from '@/components/common/MetricCard.vue'

const store = useDashboardStore()

const filters = store.filters
const activities = store.activities
const connection = store.connection
const isDarkMode = computed(() => store.isDarkMode)

const selectedMetrics = computed<MetricSeries[]>(() =>
  store.selectedMetrics.map((metric) => ({
    ...metric,
    data: filterDataByTimeRange(metric.data, filters.timeRange)
  }))
)

let updateUnsubscribe: (() => void) | null = null
let activityUnsubscribe: (() => void) | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

function connectStream() {
  try {
    store.setConnected(true)
    store.resetReconnectAttempts()
    store.setConnectionError(undefined)
    store.setReconnecting(false)

    updateUnsubscribe = streamingService.onUpdate((update) => {
      if (store.filters.isStreaming) {
        store.updateMetric(update)
      }
    })

    activityUnsubscribe = streamingService.onActivity((activity) => {
      store.addActivity(activity)
    })

    streamingService.start()
  } catch (error) {
    store.setConnectionError((error as Error).message)
    store.setConnected(false)
    scheduleReconnect()
  }
}

function scheduleReconnect() {
  store.setReconnecting(true)
  store.incrementReconnectAttempts()

  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }

  reconnectTimer = setTimeout(() => {
    connectStream()
  }, 5000)
}

function cleanup() {
  if (updateUnsubscribe) updateUnsubscribe()
  if (activityUnsubscribe) activityUnsubscribe()
  streamingService.stop()
  if (reconnectTimer) clearTimeout(reconnectTimer)
}

function toggleTheme() {
  store.toggleDarkMode()
}

function setTimeRange(range: DashboardFilters['timeRange']) {
  store.setTimeRange(range)
}

function setChartType(type: DashboardFilters['chartType']) {
  store.setChartType(type)
}

function toggleStreaming() {
  store.toggleStreaming()
}

function removeActivity(id: string) {
  store.removeActivity(id)
}

onMounted(() => {
  document.documentElement.classList.toggle('dark', store.isDarkMode)
  const initialMetrics = streamingService.initializeMetrics()
  store.setMetrics(initialMetrics)
  connectStream()
})

onUnmounted(() => {
  cleanup()
})

watch(
  () => store.filters.isStreaming,
  (isStreaming) => {
    if (isStreaming) {
      streamingService.start()
    } else {
      streamingService.stop()
    }
  }
)

watch(
  () => store.isDarkMode,
  (value) => {
    document.documentElement.classList.toggle('dark', value)
  }
)
</script>
