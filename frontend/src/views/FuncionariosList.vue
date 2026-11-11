<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFuncionarioStore } from '@/stores/funcionario'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { Table, Button, Input, Alert, ConfirmModal } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Funcionario } from '@/services/api'

const router = useRouter()
const store = useFuncionarioStore()
const { success, error } = useToast()
const { isOpen: confirmOpen, options: confirmOptions, open: openConfirm, confirm: doConfirm, close: closeConfirm } = useConfirm()

const searchInput = ref('')
const departamentoSelect = ref('')

onMounted(() => {
  store.fetchFuncionarios()
})

watch(
  () => store.page,
  () => {
    store.fetchFuncionarios()
  },
)

const columns: Column<Funcionario>[] = [
  { key: 'nome', label: 'Nome', sortable: true },
  {
    key: 'cpf',
    label: 'CPF',
    render: (row: Funcionario) => row.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  },
  { key: 'email', label: 'E-mail' },
  { key: 'departamento', label: 'Departamento' },
  {
    key: 'actions',
    label: 'Ações',
    width: '140px',
    render: () => '',
  },
]

const handleSearch = (value: string) => {
  searchInput.value = value
  store.setSearch(value)
  store.fetchFuncionarios()
}

const handleDepartamentoChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  departamentoSelect.value = value
  store.setDepartamento(value)
  store.fetchFuncionarios()
}

const handleClearFilters = () => {
  searchInput.value = ''
  departamentoSelect.value = ''
  store.clearFilters()
  store.fetchFuncionarios()
}

const handleEdit = (id: string) => {
  router.push({ name: 'FuncionarioEdit', params: { id } })
}

const handleDelete = (id: string, nome: string) => {
  openConfirm({
    title: 'Excluir Funcionário',
    message: `Tem certeza que deseja excluir o funcionário "${nome}"? Esta ação não pode ser desfeita.`,
    variant: 'danger',
    confirmText: 'Excluir',
  }).then(async (confirmed) => {
    if (confirmed) {
      try {
        await store.deleteFuncionario(id)
        success('Funcionário excluído com sucesso')
      } catch (err: any) {
        error(err.message ?? 'Erro ao excluir funcionário')
      }
    }
  })
}

const goToCreate = () => {
  router.push({ name: 'FuncionarioCreate' })
}
</script>

<template>
  <div class="container">
    <div class="page-header">
      <h1>Funcionários</h1>
      <Button variant="primary" @click="goToCreate" icon="➕" icon-color="black">
        Novo Funcionário
      </Button>
    </div>

    <div class="filters">
      <Input
        v-model="searchInput"
        label="Buscar"
        placeholder="Nome, CPF ou e-mail..."
        @update:modelValue="handleSearch"
        @blur="handleSearch(searchInput)"
      />

      <div class="filter-select">
        <label for="departamento" class="form-label">Departamento</label>
        <select
          id="departamento"
          v-model="departamentoSelect"
          class="form-input"
          @change="handleDepartamentoChange($event)"
        >
          <option value="">Todos</option>
          <option v-for="dep in store.departamentos" :key="dep" :value="dep">
            {{ dep }}
          </option>
        </select>
      </div>

      <div v-if="store.search || store.departamento" class="filter-actions">
        <Button variant="secondary" @click="handleClearFilters" size="sm">
          Limpar Filtros
        </Button>
      </div>
    </div>

    <Alert v-if="store.error" type="error" :message="store.error" dismissible @dismiss="store.error = null" />

    <Table
      v-else
      :columns="columns"
      :rows="store.funcionarios"
      key-field="id"
      :loading="store.loading"
      :empty-message="store.isEmpty ? 'Nenhum funcionário encontrado.' : ''"
      :striped="true"
      :hoverable="true"
    >
      <template #cell-actions="{ row }">
        <div class="actions">
          <Button variant="secondary" size="sm" @click="handleEdit(row.id)" icon="✏️">
            Editar
          </Button>
          <Button variant="danger" size="sm" @click="handleDelete(row.id, row.nome)" icon="🗑️">
            Excluir
          </Button>
        </div>
      </template>
    </Table>

    <div v-if="store.totalPages > 1" class="pagination">
      <Button variant="secondary" size="sm" :disabled="store.page === 1" @click="store.setPage(store.page - 1)">
        Anterior
      </Button>
      <span class="pagination-info">
        Página {{ store.page }} de {{ store.totalPages }} ({{ store.total }} registros)
      </span>
      <Button variant="secondary" size="sm" :disabled="store.page === store.totalPages" @click="store.setPage(store.page + 1)">
        Próxima
      </Button>
    </div>

    <ConfirmModal
      v-model="confirmOpen"
      :title="confirmOptions?.title ?? 'Confirmação'"
      :message="confirmOptions?.message ?? ''"
      :confirm-text="confirmOptions?.confirmText ?? 'Confirmar'"
      :cancel-text="confirmOptions?.cancelText ?? 'Cancelar'"
      :variant="confirmOptions?.variant ?? 'danger'"
      @confirm="doConfirm"
      @cancel="closeConfirm"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  align-items: flex-end;
}

.filters > * {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-select .form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.filter-select select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.filter-select select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.filter-actions {
  min-width: auto;
  flex: none;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>