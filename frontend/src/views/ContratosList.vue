<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useContratoStore } from '@/stores/contrato'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { Table, Button, Input, Alert, ConfirmModal } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Contrato } from '@/services/api'

const router = useRouter()
const store = useContratoStore()
const { success, error } = useToast()
const { isOpen: confirmOpen, options: confirmOptions, open: openConfirm, confirm: doConfirm, close: closeConfirm } = useConfirm()

const searchInput = ref('')
const statusSelect = ref('')

onMounted(() => {
  store.fetchContratos()
})

watch(
  () => store.page,
  () => {
    store.fetchContratos()
  },
)

const columns: Column<Contrato>[] = [
  { key: 'nome', label: 'Nome', sortable: true },
  {
    key: 'descricao',
    label: 'Descrição',
    render: (row: Contrato) => row.descricao || '-',
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: Contrato) => getStatusLabel(row.status),
  },
  {
    key: 'funcionariosCount',
    label: 'Funcionários',
    render: (row: Contrato) => row._count?.funcionarios ?? 0,
    class: 'funcionarios-count-cell',
  },
  {
    key: 'actions',
    label: 'Ações',
    width: '140px',
    render: () => '',
  },
]

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    ATIVO: 'status-ativo',
    ENCERRADO: 'status-encerrado',
    SUSPENSO: 'status-suspenso',
  }
  return classes[status] ?? ''
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ATIVO: 'Ativo',
    ENCERRADO: 'Encerrado',
    SUSPENSO: 'Suspenso',
  }
  return labels[status] ?? status
}

const handleSearch = (value: string) => {
  searchInput.value = value
  store.setSearch(value)
  store.fetchContratos()
}

const handleStatusChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  statusSelect.value = value
  store.setStatus(value)
  store.fetchContratos()
}

const handleClearFilters = () => {
  searchInput.value = ''
  statusSelect.value = ''
  store.clearFilters()
  store.fetchContratos()
}

const handleEdit = (id: string) => {
  router.push({ name: 'ContratoEdit', params: { id } })
}

const handleDelete = (id: string, nome: string) => {
  openConfirm({
    title: 'Excluir Contrato',
    message: `Tem certeza que deseja excluir o contrato "${nome}"? Esta ação não pode ser desfeita.`,
    variant: 'danger',
    confirmText: 'Excluir',
  }).then(async (confirmed) => {
    if (confirmed) {
      try {
        await store.deleteContrato(id)
        success('Contrato excluído com sucesso')
      } catch (err: any) {
        error(err.message ?? 'Erro ao excluir contrato')
      }
    }
  })
}

const goToCreate = () => {
  router.push({ name: 'ContratoCreate' })
}
</script>

<template>
  <div class="container">
    <div class="page-header">
      <h1>Contratos</h1>
      <Button variant="primary" @click="goToCreate" icon="➕" icon-color="black">
        Novo Contrato
      </Button>
    </div>

    <div class="filters">
      <Input
        v-model="searchInput"
        label="Buscar"
        placeholder="Nome ou descrição..."
        @update:modelValue="handleSearch"
        @blur="handleSearch(searchInput)"
      />

      <div class="filter-select">
        <label for="status" class="form-label">Status</label>
        <select
          id="status"
          v-model="statusSelect"
          class="form-input"
          @change="handleStatusChange($event)"
        >
          <option value="">Todos</option>
          <option v-for="s in store.statusOptions" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <div v-if="store.search || store.status" class="filter-actions">
        <Button variant="secondary" @click="handleClearFilters" size="sm">
          Limpar Filtros
        </Button>
      </div>
    </div>

    <Alert v-if="store.error" type="error" :message="store.error" dismissible @dismiss="store.error = null" />

    <Table
      v-else
      :columns="columns"
      :rows="store.contratos"
      key-field="id"
      :loading="store.loading"
      :empty-message="store.isEmpty ? 'Nenhum contrato encontrado.' : ''"
      :striped="true"
      :hoverable="true"
    >
      <template #cell-status="{ row }">
        <span :class="['status-badge', getStatusClass(row.status)]">
          {{ getStatusLabel(row.status) }}
        </span>
      </template>

      <template #cell-funcionariosCount="{ row }">
        <span class="funcionarios-count">{{ row._count?.funcionarios ?? 0 }}</span>
      </template>

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

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-ativo {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-encerrado {
  background: #f5f5f5;
  color: #616161;
}

.status-suspenso {
  background: #fff3e0;
  color: #e65100;
}

.funcionarios-count {
  font-weight: 600;
  color: #1976d2;
}

.funcionarios-count-cell {
  text-align: center;
}
</style>