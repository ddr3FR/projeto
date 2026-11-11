import { ref, type Ref } from 'vue'
import { api, type PaginatedResponse, type QueryFuncionarioParams, type QueryContratoParams, type Funcionario, type Contrato } from '@/services/api'

interface ApiState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
}

interface UseApiOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): ApiState<T> & { execute: () => Promise<T | null>; reset: () => void } {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall()
      data.value = result
      options.onSuccess?.(result)
      return result
    } catch (err: any) {
      const message = err.message ?? 'Erro desconhecido'
      error.value = message
      options.onError?.(message)
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  if (options.immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

// Hooks específicos para cada entidade
export function useFuncionarios(params?: QueryFuncionarioParams) {
  const state = useApi(() => api.funcionarios.list(params), {
    onError: (msg) => console.error('[useFuncionarios]', msg),
  })

  return {
    ...state,
    create: (data: Partial<Funcionario>) => api.funcionarios.create(data),
    update: (id: string, data: Partial<Funcionario>) => api.funcionarios.update(id, data),
    remove: (id: string) => api.funcionarios.delete(id),
  }
}

export function useContratos(params?: QueryContratoParams) {
  const state = useApi(() => api.contratos.list(params), {
    onError: (msg) => console.error('[useContratos]', msg),
  })

  return {
    ...state,
    get: (id: string) => api.contratos.get(id),
    create: (data: Partial<Contrato>) => api.contratos.create(data),
    update: (id: string, data: Partial<Contrato>) => api.contratos.update(id, data),
    remove: (id: string) => api.contratos.delete(id),
    replaceFuncionarios: (id: string, funcionarioIds: string[]) => api.contratos.replaceFuncionarios(id, funcionarioIds),
  }
}

export function useDeleteConfirmation() {
  const confirmDelete = async (message: string = 'Tem certeza que deseja excluir?'): Promise<boolean> => {
    return window.confirm(message)
  }

  return { confirmDelete }
}