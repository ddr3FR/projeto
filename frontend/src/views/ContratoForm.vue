<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContratoStore } from '@/stores/contrato'
import { useFuncionarioStore } from '@/stores/funcionario'
import { useToast } from '@/composables/useToast'
import { Input, Button, Alert, ConfirmModal, Modal } from '@/components/ui'
import type { Funcionario, Contrato } from '@/services/api'

const route = useRoute()
const router = useRouter()
const contratoStore = useContratoStore()
const funcionarioStore = useFuncionarioStore()
const { success, error: showError } = useToast()

const isEditing = ref(false)
const loading = ref(false)
const loadingFuncionarios = ref(false)
const formErrors = ref<Record<string, string>>({})

interface ContratoForm {
  nome: string
  descricao: string
  status: Status
}

const form = ref<ContratoForm>({
  nome: '',
  descricao: '',
  status: 'ATIVO',
})

const selectedFuncionarios = ref<string[]>([])
const availableFuncionarios = ref<Funcionario[]>([])
const showFuncionarioModal = ref(false)
const funcionarioSearch = ref('')

const statusOptions = ['ATIVO', 'ENCERRADO', 'SUSPENSO'] as const
type Status = (typeof statusOptions)[number]

const filteredFuncionarios = computed(() => {
  if (!funcionarioSearch.value) return availableFuncionarios.value
  const search = funcionarioSearch.value.toLowerCase()
  return availableFuncionarios.value.filter(
    (f) =>
      f.nome.toLowerCase().includes(search) ||
      f.cpf.includes(search) ||
      f.email.toLowerCase().includes(search) ||
      f.departamento.toLowerCase().includes(search)
  )
})

onMounted(async () => {
  await loadFuncionarios()
  if (route.params.id) {
    isEditing.value = true
    await loadContrato(route.params.id as string)
  }
})

const loadFuncionarios = async () => {
  loadingFuncionarios.value = true
  try {
    await funcionarioStore.fetchFuncionarios({ page: 1, limit: 100 })
    availableFuncionarios.value = funcionarioStore.funcionarios
  } catch (err: any) {
    showError(err.message ?? 'Erro ao carregar funcionários')
  } finally {
    loadingFuncionarios.value = false
  }
}

const loadContrato = async (id: string) => {
  loading.value = true
  try {
    const contrato = await contratoStore.getContrato(id)
    if (contrato) {
      form.value.nome = contrato.nome
      form.value.descricao = contrato.descricao ?? ''
      form.value.status = contrato.status
      selectedFuncionarios.value = contrato.funcionarios?.map((f) => f.funcionarioId) ?? []
    }
  } catch (err: any) {
    showError(err.message ?? 'Erro ao carregar contrato')
  } finally {
    loading.value = false
  }
}

const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'nome':
      if (!value.trim()) return 'Nome é obrigatório'
      if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
      break
    case 'descricao':
      if (value.length > 1000) return 'Descrição deve ter no máximo 1000 caracteres'
      break
  }
  return null
}

const validateForm = (): boolean => {
  let isValid = true
  const errors: Record<string, string> = {}

  for (const [key, value] of Object.entries(form.value)) {
    if (typeof value === 'string') {
      const error = validateField(key, value)
      if (error) {
        errors[key] = error
        isValid = false
      }
    }
  }

  formErrors.value = errors
  return isValid
}

const handleFieldBlur = (field: string) => {
  const value = form.value[field as keyof typeof form.value]
  if (typeof value === 'string') {
    const error = validateField(field, value)
    if (error) {
      formErrors.value = { ...formErrors.value, [field]: error }
    } else {
      const { [field]: _, ...rest } = formErrors.value
      formErrors.value = rest
    }
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    if (isEditing.value && route.params.id) {
      await contratoStore.updateContrato(route.params.id as string, form.value)
      await contratoStore.replaceFuncionarios(route.params.id as string, selectedFuncionarios.value)
      success('Contrato atualizado com sucesso')
    } else {
      const newContrato = await contratoStore.createContrato(form.value)
      if (newContrato && selectedFuncionarios.value.length > 0) {
        await contratoStore.replaceFuncionarios(newContrato.id, selectedFuncionarios.value)
      }
      success('Contrato criado com sucesso')
    }

    router.push({ name: 'ContratosList' })
  } catch (err: any) {
    const message = err.message ?? 'Erro ao salvar contrato'
    showError(message)
    formErrors.value = { form: message }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'ContratosList' })
}

const toggleFuncionario = (id: string) => {
  const index = selectedFuncionarios.value.indexOf(id)
  if (index === -1) {
    selectedFuncionarios.value.push(id)
  } else {
    selectedFuncionarios.value.splice(index, 1)
  }
}

const removeFuncionario = (id: string) => {
  selectedFuncionarios.value = selectedFuncionarios.value.filter((f) => f !== id)
}

const getFuncionarioName = (id: string) => {
  const func = availableFuncionarios.value.find((f) => f.id === id)
  return func ? `${func.nome} (${formatCpf(func.cpf)}) - ${func.departamento}` : id
}

const isSelected = (id: string) => selectedFuncionarios.value.includes(id)

const formatCpf = (cpf: string) => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
</script>

<template>
  <div class="container">
    <div class="page-header">
      <h1>{{ isEditing ? 'Editar Contrato' : 'Novo Contrato' }}</h1>
      <Button variant="secondary" @click="goBack">Voltar</Button>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <Alert v-if="formErrors.form" type="error" :message="formErrors.form" dismissible @dismiss="formErrors.form = ''" />

      <div class="form-section">
        <h2>Dados do Contrato</h2>

        <Input
          v-model="form.nome"
          label="Nome"
          :error="formErrors.nome"
          placeholder="Nome do contrato"
          required
          :maxlength="150"
          @blur="handleFieldBlur('nome')"
        />

        <div class="form-field">
          <label for="descricao" class="form-label">Descrição</label>
          <textarea
            id="descricao"
            v-model="form.descricao"
            class="form-input"
            :class="{ 'has-error': formErrors.descricao }"
            rows="4"
            :maxlength="1000"
            @blur="handleFieldBlur('descricao')"
          ></textarea>
          <p v-if="formErrors.descricao" class="form-error" role="alert">{{ formErrors.descricao }}</p>
        </div>

        <div class="form-field">
          <label for="status" class="form-label">Status <span class="required">*</span></label>
          <select
            id="status"
            v-model="form.status"
            class="form-input"
            required
          >
            <option v-for="s in statusOptions" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">
          <h2>Funcionários Vinculados</h2>
          <Button
            variant="secondary"
            size="sm"
            icon="➕"
            icon-color="black"
            @click="showFuncionarioModal = true"
            :disabled="loadingFuncionarios || availableFuncionarios.length === 0"
          >
            Adicionar Funcionários
          </Button>
        </div>

        <div v-if="loadingFuncionarios" class="loading">Carregando funcionários...</div>
        <div v-else-if="availableFuncionarios.length === 0" class="empty">
          Nenhum funcionário cadastrado.
        </div>
        <div v-else class="selected-funcionarios">
          <div v-if="selectedFuncionarios.length === 0" class="empty-selection">
            Nenhum funcionário vinculado. Clique em "Adicionar Funcionários" para selecionar.
          </div>
          <div v-else class="selected-list">
            <div
              v-for="funcId in selectedFuncionarios"
              :key="funcId"
              class="selected-item"
            >
              <span>
                {{ getFuncionarioName(funcId) }}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon="🗑️"
                @click="removeFuncionario(funcId)"
                aria-label="Remover funcionário"
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        v-model="showFuncionarioModal"
        title="Selecionar Funcionários"
        size="lg"
      >
        <div class="modal-funcionario-select">
          <Input
            v-model="funcionarioSearch"
            placeholder="Buscar por nome, CPF, e-mail ou departamento..."
            label="Buscar"
            class="mb-16"
          />
          <div class="funcionario-list">
            <label
              v-for="func in filteredFuncionarios"
              :key="func.id"
              class="funcionario-checkbox"
            >
              <input
                type="checkbox"
                :value="func.id"
                :checked="selectedFuncionarios.includes(func.id)"
                @change="toggleFuncionario(func.id)"
              />
              <span>
                {{ func.nome }} ({{ formatCpf(func.cpf) }}) - {{ func.departamento }}
              </span>
            </label>
          </div>
          <div v-if="filteredFuncionarios.length === 0" class="empty">
            Nenhum funcionário encontrado.
          </div>
        </div>
        <template #footer>
          <div class="confirm-actions">
            <Button variant="secondary" @click="showFuncionarioModal = false">
              Cancelar
            </Button>
            <Button variant="primary" @click="showFuncionarioModal = false">
              Confirmar ({{ selectedFuncionarios.length }} selecionado(s))
            </Button>
          </div>
        </template>
      </Modal>

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
  max-width: 800px;
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

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
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

.selected-funcionarios {
  min-height: 80px;
}

.empty-selection {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #eee;
}

.selected-item span {
  font-size: 14px;
  color: #333;
}

.modal-funcionario-select {
  max-height: 60vh;
  overflow-y: auto;
}

.mb-16 {
  margin-bottom: 16px;
}

.funcionario-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 40vh;
  overflow-y: auto;
  padding-right: 8px;
}

.funcionario-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.funcionario-checkbox:hover {
  background: #f5f5f5;
  border-color: #1976d2;
}

.funcionario-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #1976d2;
}

.funcionario-checkbox span {
  font-size: 14px;
  color: #333;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.empty {
  padding: 20px;
  text-align: center;
  color: #666;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
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