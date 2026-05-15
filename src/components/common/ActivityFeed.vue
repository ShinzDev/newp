<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Activity Feed</h3>
    </div>

    <div class="max-h-96 overflow-y-auto">
      <template v-if="activities.length > 0">
        <transition-group name="activity-list">
          <div
            v-for="activity in displayedActivities"
            :key="activity.id"
            :class="[
              'p-4 border-b border-gray-100 dark:border-gray-700 transition-all duration-200',
              'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer',
              getSeverityBgColor(activity.severity)
            ]"
          >
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                <div :class="['w-2 h-2 rounded-full mt-2', getSeverityIndicatorColor(activity.severity)]"></div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ activity.source }}</p>
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded-full font-medium',
                      getActivityTypeBgColor(activity.type)
                    ]"
                  >
                    {{ activity.type.toUpperCase() }}
                  </span>
                </div>

                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ activity.message }}</p>

                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {{ formatActivityTime(activity.timestamp) }}
                </p>
              </div>

              <button
                @click="removeActivity(activity.id)"
                class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
        </transition-group>
      </template>

      <div
        v-else
        class="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400"
      >
        No activities yet
      </div>
    </div>

    <div v-if="activities.length > maxDisplay" class="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 text-center">
      <button
        @click="showAll = !showAll"
        class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        {{ showAll ? 'Show less' : `Show ${activities.length - maxDisplay} more` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatTimestamp } from '@/utils';
import type { ActivityEvent } from '@/types';

interface Props {
  activities: ActivityEvent[];
  maxDisplay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 5
});

const emit = defineEmits<{
  remove: [id: string];
}>();

const showAll = ref(false);

const displayedActivities = computed(() => {
  if (showAll.value) {
    return props.activities;
  }
  return props.activities.slice(0, props.maxDisplay);
});

function formatActivityTime(timestamp: number): string {
  return formatTimestamp(timestamp);
}

function getSeverityIndicatorColor(severity: string): string {
  const colors: Record<string, string> = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  };
  return colors[severity] || 'bg-gray-500';
}

function getSeverityBgColor(severity: string): string {
  const colors: Record<string, string> = {
    low: 'bg-blue-50 dark:bg-blue-950',
    medium: 'bg-yellow-50 dark:bg-yellow-950',
    high: 'bg-orange-50 dark:bg-orange-950',
    critical: 'bg-red-50 dark:bg-red-950'
  };
  return colors[severity] || 'bg-gray-50 dark:bg-gray-700';
}

function getActivityTypeBgColor(type: string): string {
  const colors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
  };
  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
}

function removeActivity(id: string) {
  emit('remove', id);
}
</script>

<style scoped>
.activity-list-enter-active,
.activity-list-leave-active {
  transition: all 0.3s ease;
}

.activity-list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.activity-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
