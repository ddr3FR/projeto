import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  api,
  type Contrato,
  type PaginatedResponse,
  type QueryContratoParams,
} from '@/services/api'

export const useContratoStore = defineStore('contrato', () => {
  const contratos = ref<Contrato[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const totalPages = ref(0)
  const search = ref('')
  const status = ref('')

  const statusOptions = ['ATIVO', 'ENCERRADO', 'SUSPENSO'] as const
  const hasData = computed(() => contratos.value.length > 0)
  const isEmpty = computed(() => !loading.value && contratos.value.length === 0)

  async function fetchContratos(params: QueryContratoParams = {}) {
    loading.value = true
    error.value = null

    try {
      const queryParams = {
        page: params.page ?? page.value,
        limit: params.limit ?? limit.value,
        search: params.search ?? search.value,
        status: params.status ?? status.value,
      }

      const response = await api.contratos.list(queryParams)

      contratos.value = response.data
      total.value = response.total
      page.value = response.page
      limit.value = response.limit
      totalPages.value = response.totalPages
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao carregar contratos'
      contratos.value = []
    } finally {
      loading.value = false
    }
  }

  async function getContrato(id: string) {
    loading.value = true
    error.value = null

    try {
      return await api.contratos.get(id)
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao carregar contrato'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createContrato(data: Partial<Contrato>) {
    loading.value = true
    error.value = null

    try {
      const newContrato = await api.contratos.create(data)
      await fetchContratos()
      return newContrato
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao criar contrato'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateContrato(id: string, data: Partial<Contrato>) {
    loading.value = true
    error.value = null

    try {
      await api.contratos.update(id, data)
      await fetchContratos()
      return true
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao atualizar contrato'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteContrato(id: string) {
    loading.value = true
    error.value = null

    try {
      await api.contratos.delete(id)
      await fetchContratos()
      return true
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao excluir contrato'
      return false
    } finally {
      loading.value = false
    }
  }

  async function replaceFuncionarios(id: string, funcionarioIds: string[]) {
    loading.value = true
    error.value = null

    try {
      await api.contratos.replaceFuncionarios(id, funcionarioIds)
      await fetchContratos()
      return true
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao atualizar funcionários do contrato'
      return false
    } finally {
      loading.value = false
    }
  }

  function setSearch(value: string) {
    search.value = value
    page.value = 1
  }

  function setStatus(value: string) {
    status.value = value
    page.value = 1
  }

  function setPage(newPage: number) {
    page.value = newPage
  }

  function setLimit(newLimit: number) {
    limit.value = newLimit
    page.value = 1
  }

  function clearFilters() {
    search.value = ''
    status.value = ''
    page.value = 1
  }

  return {
    contratos,
    loading,
    error,
    total,
    page,
    limit,
    totalPages,
    search,
    status,
    statusOptions,
    hasData,
    isEmpty,
    fetchContratos,
    getContrato,
    createContrato,
    updateContrato,
    deleteContrato,
    replaceFuncionarios,
    setSearch,
    setStatus,
    setPage,
    setLimit,
    clearFilters,
  }
})
