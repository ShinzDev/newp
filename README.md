# Realtime Analytics Dashboard

A production-style real-time monitoring dashboard built with Vue 3, TypeScript, Pinia, Tailwind CSS, and custom streaming visualizations.

## Features

- Real-time streaming simulation with metric updates and event activity feed
- Responsive line, bar, and area charts with smooth canvas rendering
- Interactive dashboard controls for time range, chart type, and streaming toggle
- Centralized typed state management with Pinia
- Dark mode support and responsive dashboard layout
- Graceful connection handling and reconnect behavior

## Setup

```bash
cd c:\Users\Islands Region\Desktop\newp
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
npm run preview
```

## Architecture

- `src/App.vue` - top-level dashboard layout, connection banner, controls, and section wiring
- `src/stores/dashboardStore.ts` - centralized Pinia store for metrics, activities, filters, and connection state
- `src/services/streamingService.ts` - simulated streaming engine with metric update and activity event subscriptions
- `src/components/charts/*` - reusable chart components with canvas-based rendering
- `src/components/common/*` - metric cards, controls, connection banner, and activity feed
- `src/utils/index.ts` - reusable formatting, filtering, throttling, and aggregation helpers
- `src/types/index.ts` - typed payloads and state models

## State Management

The dashboard uses Pinia for reactive state in Vue:

- `metrics` store real-time values and history
- `activities` store live event feed entries
- `filters` store UI state for range, chart type, and streaming status
- `connection` tracks connectivity, errors, and reconnect attempts
- `isDarkMode` persists user theme preference to localStorage

## Rendering Optimization

- Custom canvas chart components render data directly to avoid repeated DOM updates
- Metric history is capped at the latest 200 points per series
- Activity feed retains only the 100 most recent entries
- Streaming updates are handled through a central subscription model

## Data Streaming Approach

The app uses a mock `StreamingService` to simulate live data:

- Periodic metric updates on a configurable interval
- Event generation for live activity logs
- Reconnection scheduling and error capture
- Historical metric initialization for instant chart rendering

## Tradeoffs

- Custom canvas chart rendering keeps dependencies light but uses simpler visuals than a full charting library
- The current streaming layer is simulated; a real WebSocket or SSE integration can be layered on top of `StreamingService`
- Tailwind CSS is used for rapid styling and responsive UI layout

## Notes

This dashboard is designed for a production-style real-time analytics experience, with clean state separation, modern UI, and live update handling.
