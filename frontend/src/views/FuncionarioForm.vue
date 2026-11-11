<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFuncionarioStore } from '@/stores/funcionario'
import { useToast } from '@/composables/useToast'
import { Input, Button, Alert, Alert as AlertComponent } from '@/components/ui'

const route = useRoute()
const router = useRouter()
const store = useFuncionarioStore()
const { success, error: showError } = useToast()

const isEditing = ref(false)
const loading = ref(false)
const formErrors = ref<Record<string, string>>({})

const form = ref({
  nome: '',
  cpf: '',
  email: '',
  departamento: '',
})

const departamentos = [
  'Engenharia Civil',
  'Elétrica',
  'Mecânica',
  'Segurança do Trabalho',
  'Administrativo',
]

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return value
}

const handleCpfInput = (value: string) => {
  form.value.cpf = formatCpf(value)
}

const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'nome':
      if (!value.trim()) return 'Nome é obrigatório'
      if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
      break
    case 'cpf':
      if (!value.trim()) return 'CPF é obrigatório'
      const cpfDigits = value.replace(/\D/g, '')
      if (cpfDigits.length !== 11) return 'CPF deve ter 11 dígitos'
      break
    case 'email':
      if (!value.trim()) return 'E-mail é obrigatório'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'E-mail inválido'
      break
    case 'departamento':
      if (!value) return 'Departamento é obrigatório'
      break
  }
  return null
}

const validateForm = (): boolean => {
  let isValid = true
  const errors: Record<string, string> = {}

  for (const [key, value] of Object.entries(form.value)) {
    const error = validateField(key, value)
    if (error) {
      errors[key] = error
      isValid = false
    }
  }

  formErrors.value = errors
  return isValid
}

const handleFieldBlur = (field: string) => {
  const error = validateField(field, form.value[field as keyof typeof form.value])
  if (error) {
    formErrors.value = { ...formErrors.value, [field]: error }
  } else {
    const { [field]: _, ...rest } = formErrors.value
    formErrors.value = rest
  }
}

const loadFuncionario = async (id: string) => {
  loading.value = true
  try {
    const funcionario = await store.getFuncionario(id)
    if (funcionario) {
      form.value = {
        nome: funcionario.nome,
        cpf: funcionario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
        email: funcionario.email,
        departamento: funcionario.departamento,
      }
    }
  } catch (err: any) {
    showError(err.message ?? 'Erro ao carregar funcionário')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.params.id) {
    isEditing.value = true
    loadFuncionario(route.params.id as string)
  }
})

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const cpfDigits = form.value.cpf.replace(/\D/g, '')
    const data = {
      ...form.value,
      cpf: cpfDigits,
    }

    if (isEditing.value && route.params.id) {
      await store.updateFuncionario(route.params.id as string, data)
      success('Funcionário atualizado com sucesso')
    } else {
      await store.createFuncionario(data)
      success('Funcionário criado com sucesso')
    }

    router.push({ name: 'FuncionariosList' })
  } catch (err: any) {
    const message = err.message ?? 'Erro ao salvar funcionário'
    showError(message)
    formErrors.value = { form: message }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'FuncionariosList' })
}
</script>

<template>
  <div class="container">
    <div class="page-header">
      <h1>{{ isEditing ? 'Editar Funcionário' : 'Novo Funcionário' }}</h1>
      <Button variant="secondary" @click="goBack">Voltar</Button>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <Alert v-if="formErrors.form" type="error" :message="formErrors.form" dismissible @dismiss="formErrors.form = ''" />

      <Input
        v-model="form.nome"
        label="Nome"
        :error="formErrors.nome"
        placeholder="Nome completo"
        required
        :maxlength="100"
        @blur="handleFieldBlur('nome')"
      />

      <Input
        v-model="form.cpf"
        label="CPF"
        :error="formErrors.cpf"
        placeholder="000.000.000-00"
        required
        :maxlength="14"
        @update:modelValue="handleCpfInput"
        @blur="handleFieldBlur('cpf')"
      />

      <Input
        v-model="form.email"
        label="E-mail"
        type="email"
        :error="formErrors.email"
        placeholder="email@exemplo.com"
        required
        :maxlength="150"
        @blur="handleFieldBlur('email')"
      />

      <div class="form-field">
        <label for="departamento" class="form-label">Departamento <span class="required">*</span></label>
        <select
          id="departamento"
          v-model="form.departamento"
          class="form-input"
          :class="{ 'has-error': formErrors.departamento }"
          @blur="handleFieldBlur('departamento')"
          required
        >
          <option value="">Selecione um departamento</option>
          <option v-for="dep in departamentos" :key="dep" :value="dep">
            {{ dep }}
          </option>
        </select>
        <p v-if="formErrors.departamento" class="form-error" role="alert">{{ formErrors.departamento }}</p>
      </div>

      <div class="form-actions">
        <Button type="button" variant="secondary" @click="goBack">Cancelar</Button>
        <Button type="submit" variant="primary" :loading="loading">
          {{ isEditing ? 'Atualizar' : 'Salvar' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}
</style>