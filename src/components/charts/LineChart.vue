<template>
  <div ref="chartRef" class="w-full h-full">
    <div id="line-chart-container"></div>
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
  // This will be populated with actual Recharts implementation
  // For now, using canvas as a placeholder
  if (!chartRef.value) return;

  const canvas = document.createElement('canvas');
  canvas.width = chartRef.value.offsetWidth || 800;
  canvas.height = chartRef.value.offsetHeight || 400;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Simple line chart rendering
  const padding = 40;
  const width = canvas.width - 2 * padding;
  const height = canvas.height - 2 * padding;

  // Draw background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid and axes
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (i * height) / 5;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + width, y);
    ctx.stroke();
  }

  // Vertical grid lines
  const points = props.data.length;
  const stepX = width / Math.max(1, points - 1);
  for (let i = 0; i < points; i += Math.max(1, Math.floor(points / 10))) {
    const x = padding + i * stepX;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + height);
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

  const maxValue = Math.max(
    1,
    ...props.metrics.flatMap((metric) =>
      props.data.map((point) => point[metric.id] || 0)
    )
  );

  // Draw data lines for each metric
  props.metrics.forEach((metric) => {
    ctx.strokeStyle = metric.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    props.data.forEach((point, index) => {
      const value = point[metric.id] || 0;
      const x = padding + index * stepX;
      const y = padding + height - (value / maxValue) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  });

  // Clear previous and set new canvas
  const container = document.getElementById('line-chart-container');
  if (container) {
    container.innerHTML = '';
    container.appendChild(canvas);
  }
}
</script>
