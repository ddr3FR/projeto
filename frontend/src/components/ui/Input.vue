<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  maxlength?: number
  autocomplete?: string
  id?: string
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  maxlength: undefined,
  autocomplete: 'off',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}>()

const inputId = computed(() => props.id ?? props.name ?? `input-${Math.random().toString(36).slice(2)}`)
const inputRef = ref<HTMLInputElement>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = () => {
  emit('blur')
}

const ariaDescribedBy = computed(() => {
  if (props.error) return `${inputId.value}-error`
  if (props.hint) return `${inputId.value}-hint`
  return undefined
})
</script>

<template>
  <div class="form-field">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      ref="inputRef"
      :id="inputId"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :class="['form-input', { 'has-error': error }]"
      @input="handleInput"
      @blur="handleBlur"
      :aria-invalid="error ? true : false"
      :aria-describedby="ariaDescribedBy"
    />
    <p v-if="error" :id="`${inputId}-error`" class="form-error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${inputId}-hint`" class="form-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #d32f2f;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.form-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-input.has-error {
  border-color: #d32f2f;
}

.form-input.has-error:focus {
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2);
}

.form-error {
  margin: 0;
  font-size: 12px;
  color: #d32f2f;
}

.form-hint {
  margin: 0;
  font-size: 12px;
  color: #666;
}
</style>