<template>
  <div ref="chartRef" class="w-full h-full">
    <div id="bar-chart-container"></div>
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

  // Draw grid and axes
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

  const maxValue = Math.max(
    1,
    ...props.metrics.flatMap((metric) =>
      props.data.map((point) => point[metric.id] || 0)
    )
  );

  // Draw bars
  const points = props.data.length;
  const totalSeries = props.metrics.length || 1;
  const groupSpacing = width / Math.max(1, points);
  const barWidth = Math.max(8, (groupSpacing * 0.8) / totalSeries);

  props.data.forEach((point, index) => {
    const baseX = padding + index * groupSpacing + groupSpacing * 0.1;
    let barX = baseX;

    props.metrics.forEach((metric) => {
      const value = point[metric.id] || 0;
      const barHeight = (value / maxValue) * height;
      const barY = padding + height - barHeight;

      ctx.fillStyle = metric.color;
      ctx.fillRect(barX, barY, barWidth, barHeight);
      barX += barWidth + 4;
    });
  });

  const container = document.getElementById('bar-chart-container');
  if (container) {
    container.innerHTML = '';
    container.appendChild(canvas);
  }
}
</script>
