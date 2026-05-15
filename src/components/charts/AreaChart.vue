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

  const points = props.data.length;
  const stepX = points > 1 ? chartWidth / (points - 1) : chartWidth;

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
    ctx.moveTo(padding, padding + chartHeight);

    props.data.forEach((point, index) => {
      const value = point[metric.id] || 0;
      const x = padding + index * stepX;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = metric.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    props.data.forEach((point, index) => {
      const value = point[metric.id] || 0;
      const x = padding + index * stepX;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  });

  const container = chartContainer.value;
  container.innerHTML = '';
  container.appendChild(canvas);
}

function toRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const fullHex = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;
  const bigint = parseInt(fullHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
</script>
