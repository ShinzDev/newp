<template>
  <div class="h-full w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
      <div class="flex gap-2">
        <button
          v-for="type in chartTypes"
          :key="type"
          @click="selectedType = type"
          :class="[
            'px-3 py-1 rounded text-sm font-medium transition-colors',
            selectedType === type
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ type.toUpperCase() }}
        </button>
      </div>
    </div>

    <div class="h-96 w-full">
      <LineChart
        v-if="selectedType === 'line'"
        :data="chartData"
        :metrics="metrics"
        :responsive="true"
      />
      <BarChart
        v-else-if="selectedType === 'bar'"
        :data="chartData"
        :metrics="metrics"
        :responsive="true"
      />
      <AreaChart
        v-else-if="selectedType === 'area'"
        :data="chartData"
        :metrics="metrics"
        :responsive="true"
      />
    </div>

    <div class="mt-4 grid grid-cols-3 gap-4">
      <div
        v-for="metric in metrics"
        :key="metric.id"
        class="p-2 bg-gray-50 dark:bg-gray-700 rounded"
      >
        <p class="text-xs text-gray-600 dark:text-gray-400">{{ metric.name }}</p>
        <p class="text-lg font-bold" :style="{ color: metric.color }">{{ metric.lastValue }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { MetricSeries } from '@/types';
import LineChart from './LineChart.vue';
import BarChart from './BarChart.vue';
import AreaChart from './AreaChart.vue';

interface Props {
  title: string;
  metrics: MetricSeries[];
  defaultType?: 'line' | 'bar' | 'area';
}

const props = withDefaults(defineProps<Props>(), {
  defaultType: 'line'
});

const selectedType = ref<'line' | 'bar' | 'area'>(props.defaultType);
const chartTypes: Array<'line' | 'bar' | 'area'> = ['line', 'bar', 'area'];

const chartData = computed(() => {
  if (props.metrics.length === 0) return [];

  // Use the first metric's timestamps as the base
  const baseMetric = props.metrics[0];
  return baseMetric.data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    timestamp: point.timestamp,
    ...props.metrics.reduce(
      (acc, metric) => {
        const dataPoint = metric.data.find((d) => d.timestamp === point.timestamp);
        return {
          ...acc,
          [metric.id]: dataPoint?.value || 0
        };
      },
      {} as Record<string, number>
    )
  }));
});

watch(
  () => props.defaultType,
  (value) => {
    selectedType.value = value;
  }
);
</script>
