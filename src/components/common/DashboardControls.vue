<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-sm text-gray-500 dark:text-gray-400">Time Range:</span>
        <button
          v-for="range in timeRanges"
          :key="range"
          @click="$emit('update:timeRange', range)"
          :class="buttonClass(filters.timeRange === range)"
        >
          {{ rangeLabels[range] }}
        </button>
      </div>

      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-sm text-gray-500 dark:text-gray-400">Chart:</span>
        <button
          v-for="type in chartTypes"
          :key="type"
          @click="$emit('update:chartType', type)"
          :class="buttonClass(filters.chartType === type)"
        >
          {{ type.toUpperCase() }}
        </button>
      </div>

      <div class="flex gap-2 items-center">
        <button
          @click="$emit('toggleStreaming')"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-all duration-200',
            filters.isStreaming ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
          ]"
        >
          {{ filters.isStreaming ? 'Pause Stream' : 'Resume Stream' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardFilters } from '@/types';

interface Props {
  filters: DashboardFilters;
}

const props = defineProps<Props>();

const timeRanges: DashboardFilters['timeRange'][] = ['1m', '5m', '1h', '24h', 'live'];
const chartTypes: DashboardFilters['chartType'][] = ['line', 'bar', 'area'];

const rangeLabels: Record<DashboardFilters['timeRange'], string> = {
  '1m': '1 Minute',
  '5m': '5 Minutes',
  '1h': '1 Hour',
  '24h': '24 Hours',
  live: 'Live'
};

function buttonClass(active: boolean) {
  return [
    'px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200',
    active
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
  ];
}
</script>
