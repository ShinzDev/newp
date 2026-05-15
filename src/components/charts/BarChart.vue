<template>
  <div ref="chartRef" class="w-full h-full">
    <div ref="chartContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
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
const chartContainer = ref<HTMLDivElement>();

onMounted(() => {
  renderChart();
  window.addEventListener('resize', renderChart);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderChart);
});

watch(
  [() => props.data, () => props.metrics],
  () => {
    renderChart();
  },
  { deep: true }
);

function renderChart() {
  if (!chartRef.value || !chartContainer.value) return;

  const width = chartRef.value.clientWidth || 800;
  const height = chartRef.value.clientHeight || 400;
  const dpr = window.devicePixelRatio || 1;

  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const y = padding + (i * chartHeight) / 5;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + chartWidth, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + chartHeight);
  ctx.lineTo(padding + chartWidth, padding + chartHeight);
  ctx.stroke();

  const maxValue = Math.max(
    1,
    ...props.metrics.flatMap((metric) =>
      props.data.map((point) => point[metric.id] || 0)
    )
  );

  const points = props.data.length;
  const totalSeries = props.metrics.length || 1;
  const groupWidth = points ? chartWidth / points : chartWidth;
  const barWidth = Math.max(8, Math.min(32, (groupWidth * 0.75) / totalSeries));
  const groupPadding = (groupWidth - barWidth * totalSeries) / 2;

  props.data.forEach((point, index) => {
    let barX = padding + index * groupWidth + groupPadding;

    props.metrics.forEach((metric) => {
      const value = point[metric.id] || 0;
      const barHeight = (value / maxValue) * chartHeight;
      const barY = padding + chartHeight - barHeight;

      ctx.fillStyle = metric.color;
      ctx.fillRect(barX, barY, barWidth, barHeight);
      barX += barWidth + 4;
    });
  });

  const container = chartContainer.value;
  container.innerHTML = '';
  container.appendChild(canvas);
}
</script>
