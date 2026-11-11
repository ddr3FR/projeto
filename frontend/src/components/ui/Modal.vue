<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlayClick: true,
  closeOnEscape: true,
  showCloseButton: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const modalRef = ref<HTMLDivElement>()
const focusableElementsRef = ref<HTMLElement[]>([])
let lastFocusedElement: HTMLElement | null = null

const sizeClasses = {
  sm: 'modal-sm',
  md: 'modal-md',
  lg: 'modal-lg',
  xl: 'modal-xl',
  full: 'modal-full',
}

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (props.closeOnOverlayClick && event.target === event.currentTarget) {
    close()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.modelValue) return

  if (event.key === 'Escape' && props.closeOnEscape) {
    close()
    return
  }

  if (event.key === 'Tab') {
    trapFocus(event)
  }
}

const trapFocus = (event: KeyboardEvent) => {
  const focusableElements = modalRef.value?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  if (!focusableElements?.length) return

  const firstElement = focusableElements[0]!
  const lastElement = focusableElements[focusableElements.length - 1]!

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

const handleOpen = () => {
  lastFocusedElement = document.activeElement as HTMLElement
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    const firstFocusable = modalRef.value?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
  })
}

const handleClose = () => {
  document.body.style.overflow = ''
  lastFocusedElement?.focus()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) handleOpen()
    else handleClose()
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

import { nextTick } from 'vue'
</script>

<template>
  <Transition name="modal">
    <div
      v-if="modelValue"
      class="modal-overlay"
      @click="handleOverlayClick"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? 'modal-title' : undefined"
    >
      <div
        ref="modalRef"
        :class="['modal', sizeClasses[size]]"
        @click.stop
      >
        <div class="modal-header" v-if="title || showCloseButton">
          <h2 v-if="title" id="modal-title" class="modal-title">{{ title }}</h2>
          <button
            v-if="showCloseButton"
            type="button"
            class="modal-close"
            @click="close"
            aria-label="Fechar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  animation: slideUp 0.2s ease-out;
}

.modal-sm { max-width: 400px; }
.modal-md { max-width: 600px; }
.modal-lg { max-width: 800px; }
.modal-xl { max-width: 1000px; }
.modal-full { max-width: 100%; max-height: 100vh; border-radius: 0; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #fafafa;
  border-radius: 0 0 8px 8px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(20px);
}
</style>