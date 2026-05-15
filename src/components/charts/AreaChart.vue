<template>
  <div ref="chartRef" class="w-full h-full">
    <div id="area-chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { MetricSeries } from '@/types';

interface Props {
  data: Array<Record<string, any>>;
  metrics: MetricSeries[];
  responsive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  responsive: true
});

const chartRef = ref<HTMLDivElement>();

onMounted(() => {
  renderChart();
});

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true }
);

function renderChart() {
  if (!chartRef.value) return;

  const canvas = document.createElement('canvas');
  canvas.width = chartRef.value.offsetWidth || 800;
  canvas.height = chartRef.value.offsetHeight || 400;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const padding = 40;
  const width = canvas.width - 2 * padding;
  const height = canvas.height - 2 * padding;

  // Draw background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const y = padding + (i * height) / 5;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + width, y);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + height);
  ctx.lineTo(padding + width, padding + height);
  ctx.stroke();

  // Draw filled areas for each metric
  const points = props.data.length;
  const stepX = width / Math.max(1, points - 1);

  const maxValue = Math.max(
    1,
    ...props.metrics.flatMap((metric) =>
      props.data.map((point) => point[metric.id] || 0)
    )
  );

  props.metrics.forEach((metric) => {
    const alpha = 0.3;
    ctx.fillStyle = toRgba(metric.color, alpha);

    ctx.beginPath();
    ctx.moveTo(padding, padding + height);

    props.data.forEach((point, index) => {
      const value = point[metric.id] || 0;
      const x = padding + index * stepX;
      const y = padding + height - (value / maxValue) * height;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(padding + width, padding + height);
    ctx.closePath();
    ctx.fill();

    // Draw line on top
    ctx.strokeStyle = metric.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    props.data.forEach((point, index) => {
      const value = point[metric.id] || 0;
      const x = padding + index * stepX;
      const y = padding + height - (value / 100) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  });

  const container = document.getElementById('area-chart-container');
  if (container) {
    container.innerHTML = '';
    container.appendChild(canvas);
  }
}
function toRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}</script>
