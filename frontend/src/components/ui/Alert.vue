<script setup lang="ts">
import { computed, h } from 'vue'

interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  dismissible?: boolean
  icon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: false,
  icon: true,
})

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const icons = {
  success: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' }, [
      h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
      h('polyline', { points: '22 4 12 14.01 9 11.01' }),
    ]),
  error: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
      h('line', { x1: '9', y1: '9', x2: '15', y2: '15' }),
    ]),
  warning: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' }, [
      h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
      h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
      h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }),
    ]),
  info: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
      h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' }),
    ]),
}

const classNames = computed(() => [
  'alert',
  `alert-${props.type}`,
  { 'alert-dismissible': props.dismissible },
])

const handleDismiss = () => {
  emit('dismiss')
}
</script>

<template>
  <div :class="classNames" role="alert">
    <div class="alert-content">
      <div v-if="icon" class="alert-icon" aria-hidden="true">
        <component :is="icons[type]" />
      </div>
      <div class="alert-text">
        <p v-if="title" class="alert-title">{{ title }}</p>
        <p class="alert-message">{{ message }}</p>
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="alert-dismiss"
      @click="handleDismiss"
      aria-label="Fechar"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid;
  animation: slideDown 0.3s ease-out;
}

.alert-content {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.alert-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.alert-icon svg {
  width: 100%;
  height: 100%;
}

.alert-text {
  min-width: 0;
}

.alert-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
}

.alert-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.alert-dismiss {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s, background 0.2s;
}

.alert-dismiss:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

.alert-success {
  background: #e8f5e9;
  border-color: #c8e6c9;
  color: #2e7d32;
}

.alert-success .alert-icon {
  color: #2e7d32;
}

.alert-error {
  background: #ffebee;
  border-color: #ffcdd2;
  color: #c62828;
}

.alert-error .alert-icon {
  color: #c62828;
}

.alert-warning {
  background: #fff8e1;
  border-color: #ffecb3;
  color: #f57f17;
}

.alert-warning .alert-icon {
  color: #f57f17;
}

.alert-info {
  background: #e3f2fd;
  border-color: #bbdefb;
  color: #1565c0;
}

.alert-info .alert-icon {
  color: #1565c0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>