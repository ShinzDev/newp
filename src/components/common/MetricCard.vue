<template>
  <div
    :class="[
      'p-4 rounded-lg border-2 transition-all duration-300',
      statusColors[metric.status],
      'bg-white dark:bg-gray-800',
      'hover:shadow-lg cursor-pointer'
    ]"
  >
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ metric.name }}</h3>
      <span
        :class="['text-xs font-bold px-2 py-1 rounded', getStatusBadgeColor(metric.status)]"
      >
        {{ metric.status.toUpperCase() }}
      </span>
    </div>

    <div class="flex items-end justify-between">
      <div>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ metric.lastValue }}</p>
        <p v-if="metric.unit" class="text-xs text-gray-500">{{ metric.unit }}</p>
      </div>

      <div class="text-right">
        <div class="flex items-center gap-1 justify-end">
          <span :class="['text-sm font-medium', trendColors[metric.trend]]">
            {{ getTrendIcon(metric.trend) }} {{ Math.abs(metric.changePercent).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <div class="mt-4 h-12 bg-gray-100 dark:bg-gray-700 rounded">
      <canvas ref="sparklineRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { MetricSeries } from '@/types';

interface Props {
  metric: MetricSeries;
}

const props = defineProps<Props>();

const sparklineRef = ref<HTMLCanvasElement>();

const statusColors = computed(() => ({
  normal: 'border-green-500',
  warning: 'border-yellow-500',
  critical: 'border-red-500'
}));

const trendColors = {
  up: 'text-red-500',
  down: 'text-green-500',
  stable: 'text-gray-500'
};

function getTrendIcon(trend: string): string {
  if (trend === 'up') return '📈';
  if (trend === 'down') return '📉';
  return '➡️';
}

function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    normal: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function drawSparkline() {
  if (!sparklineRef.value) return;

  const canvas = sparklineRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const data = props.metric.data;
  if (data.length < 2) return;

  const padding = 2;
  const width = canvas.width - 2 * padding;
  const height = canvas.height - 2 * padding;

  // Get min and max
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Draw background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw area
  ctx.fillStyle = props.metric.color + '40';
  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);

  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * width;
    const y = canvas.height - padding - ((point.value - min) / range) * height;
    ctx.lineTo(x, y);
  });

  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.closePath();
  ctx.fill();

  // Draw line
  ctx.strokeStyle = props.metric.color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * width;
    const y = canvas.height - padding - ((point.value - min) / range) * height;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

onMounted(() => {
  drawSparkline();
});

watch(
  () => props.metric.data,
  () => {
    drawSparkline();
  },
  { deep: true }
);
</script>
