<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: string
  iconColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const classNames = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  { 'btn-full': props.fullWidth, 'btn-loading': props.loading },
])

const iconStyle = computed(() => ({
  color: props.iconColor,
}))

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="classNames"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
    <span v-else-if="icon" class="btn-icon" aria-hidden="true" :style="iconStyle">{{ icon }}</span>
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s, transform 0.1s;
  font-family: inherit;
  white-space: nowrap;
}

.btn:disabled,
.btn-loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:active:not(:disabled):not(.btn-loading) {
  transform: scale(0.98);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-md {
  padding: 10px 20px;
  font-size: 14px;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
}

.btn-full {
  width: 100%;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled):not(.btn-loading) {
  background: #1565c0;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover:not(:disabled):not(.btn-loading) {
  background: #d5d5d5;
}

.btn-danger {
  background: #d32f2f;
  color: white;
}

.btn-danger:hover:not(:disabled):not(.btn-loading) {
  background: #c62828;
}

.btn-ghost {
  background: transparent;
  color: #1976d2;
}

.btn-ghost:hover:not(:disabled):not(.btn-loading) {
  background: rgba(25, 118, 210, 0.08);
}

.btn-loading {
  position: relative;
  color: transparent;
}

.btn-spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  opacity: 1;
}

.btn-primary .btn-spinner,
.btn-danger .btn-spinner {
  color: white;
}

.btn-secondary .btn-spinner,
.btn-ghost .btn-spinner {
  color: #333;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>