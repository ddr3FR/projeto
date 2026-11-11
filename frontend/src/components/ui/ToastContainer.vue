<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '@/composables/useToast'
import Alert from '@/components/ui/Alert.vue'

const { toasts, dismiss } = useToast()

const reversedToasts = computed(() => [...toasts.value].reverse())
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="toast-container">
    <div
      v-for="toast in reversedToasts"
      :key="toast.id"
      class="toast-item"
    >
      <Alert
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        :dismissible="true"
        @dismiss="dismiss(toast.id)"
      />
    </div>
  </TransitionGroup>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  max-width: 400px;
  width: 100%;
}

.toast-item {
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .toast-container {
    top: 12px;
    right: 12px;
    left: 12px;
    max-width: none;
  }
}
</style>