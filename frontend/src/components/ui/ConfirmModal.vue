<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  modelValue: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'secondary'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmação',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

// Local ref for modal visibility
const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  isOpen.value = val
})

watch(isOpen, (val) => {
  if (val !== props.modelValue) {
    emit('update:modelValue', val)
  }
})

const handleConfirm = () => {
  if (props.loading) return
  emit('confirm')
  isOpen.value = false
}

const handleCancel = () => {
  if (props.loading) return
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <Modal
    v-model="isOpen"
    :title="title"
    size="sm"
    :closeOnEscape="!loading"
    :closeOnOverlayClick="!loading"
    :showCloseButton="!loading"
  >
    <div class="confirm-content">
      <p class="confirm-message">{{ message }}</p>
    </div>
    <template #footer>
      <div class="confirm-actions">
        <Button
          variant="secondary"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </Button>
        <Button
          :variant="variant"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.confirm-content {
  margin-bottom: 8px;
}

.confirm-message {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}
</style>