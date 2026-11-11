import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  api,
  type Funcionario,
  type PaginatedResponse,
  type QueryFuncionarioParams,
} from '@/services/api'

export const useFuncionarioStore = defineStore('funcionario', () => {
  const funcionarios = ref<Funcionario[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const totalPages = ref(0)
  const search = ref('')
  const departamento = ref('')
  const contratoId = ref('')

  const departamentos = [
    'Engenharia Civil',
    'Elétrica',
    'Mecânica',
    'Segurança do Trabalho',
    'Administrativo',
  ]

  const hasData = computed(() => funcionarios.value.length > 0)
  const isEmpty = computed(() => !loading.value && funcionarios.value.length === 0)

  async function fetchFuncionarios(params: QueryFuncionarioParams = {}) {
    loading.value = true
    error.value = null

    try {
      const queryParams = {
        page: params.page ?? page.value,
        limit: params.limit ?? limit.value,
        search: params.search ?? search.value,
        departamento: params.departamento ?? departamento.value,
        contratoId: params.contratoId ?? contratoId.value,
      }

      const response = await api.funcionarios.list(queryParams)

      funcionarios.value = response.data
      total.value = response.total
      page.value = response.page
      limit.value = response.limit
      totalPages.value = response.totalPages
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao carregar funcionários'
      funcionarios.value = []
    } finally {
      loading.value = false
    }
  }

  async function getFuncionario(id: string) {
    loading.value = true
    error.value = null

    try {
      return await api.funcionarios.get(id)
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao carregar funcionário'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createFuncionario(data: Partial<Funcionario>) {
    loading.value = true
    error.value = null

    try {
      await api.funcionarios.create(data)
      await fetchFuncionarios()
      return true
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao criar funcionário'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateFuncionario(id: string, data: Partial<Funcionario>) {
    loading.value = true
    error.value = null

    try {
      await api.funcionarios.update(id, data)
      await fetchFuncionarios()
      return true
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao atualizar funcionário'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteFuncionario(id: string) {
    loading.value = true
    error.value = null

    try {
      await api.funcionarios.delete(id)
      await fetchFuncionarios()
      return true
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao excluir funcionário'
      return false
    } finally {
      loading.value = false
    }
  }

  function setSearch(value: string) {
    search.value = value
    page.value = 1
  }

  function setDepartamento(value: string) {
    departamento.value = value
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
    departamento.value = ''
    contratoId.value = ''
    page.value = 1
  }

  return {
    funcionarios,
    loading,
    error,
    total,
    page,
    limit,
    totalPages,
    search,
    departamento,
    contratoId,
    departamentos,
    hasData,
    isEmpty,
    fetchFuncionarios,
    getFuncionario,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario,
    setSearch,
    setDepartamento,
    setPage,
    setLimit,
    clearFilters,
  }
})
