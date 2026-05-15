<template>
  <div
    :class="[
      'rounded-lg p-4 mb-4 text-sm font-medium',
      connection.isConnected
        ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
        : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
    ]"
  >
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="font-semibold">Connection Status</p>
        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {{ connectionMessage }}
        </p>
      </div>
      <div class="text-right">
        <p>
          {{ connection.isConnected ? 'Online' : 'Offline' }}
        </p>
        <p v-if="connection.isReconnecting" class="text-xs text-yellow-700 dark:text-yellow-300">
          Reconnecting... (Attempt {{ connection.reconnectAttempts }})
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ConnectionState } from '@/types';

interface Props {
  connection: ConnectionState;
}

const props = defineProps<Props>();

const connectionMessage = computed(() => {
  if (props.connection.isConnected) {
    return `Last updated ${new Date(props.connection.lastUpdate).toLocaleTimeString()}`;
  }
  if (props.connection.error) {
    return `Error: ${props.connection.error}`;
  }
  return 'Disconnected. Attempting reconnect.';
});
</script>
