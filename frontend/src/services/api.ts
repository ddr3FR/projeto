const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(error.message ?? 'Erro na requisição')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export interface Funcionario {
  id: string
  nome: string
  cpf: string
  email: string
  departamento: string
  createdAt: string
  updatedAt: string
  contratos?: Array<{
    contratoId: string
    funcionarioId: string
    vinculadoEm: string
    contrato?: {
      id: string
      nome: string
      status: string
    }
  }>
}

export interface Contrato {
  id: string
  nome: string
  descricao: string
  status: 'ATIVO' | 'ENCERRADO' | 'SUSPENSO'
  createdAt: string
  updatedAt: string
  _count?: {
    funcionarios: number
  }
  funcionarios?: Array<{
    contratoId: string
    funcionarioId: string
    vinculadoEm: string
    funcionario?: Funcionario
  }>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface QueryFuncionarioParams {
  page?: number
  limit?: number
  search?: string
  departamento?: string
  contratoId?: string
}

export interface QueryContratoParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export const api = {
  funcionarios: {
    list: (params: QueryFuncionarioParams = {}) =>
      request<PaginatedResponse<Funcionario>>('/api/funcionarios', {
        method: 'GET',
        body: undefined,
      }),

    get: (id: string) => request<Funcionario>(`/api/funcionarios/${id}`),

    create: (data: Partial<Funcionario>) =>
      request<Funcionario>('/api/funcionarios', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Funcionario>) =>
      request<Funcionario>(`/api/funcionarios/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<void>(`/api/funcionarios/${id}`, {
        method: 'DELETE',
      }),
  },

  contratos: {
    list: (params: QueryContratoParams = {}) =>
      request<PaginatedResponse<Contrato>>('/api/contratos', {
        method: 'GET',
        body: undefined,
      }),

    get: (id: string) => request<Contrato>(`/api/contratos/${id}`),

    create: (data: Partial<Contrato>) =>
      request<Contrato>('/api/contratos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Contrato>) =>
      request<Contrato>(`/api/contratos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<void>(`/api/contratos/${id}`, {
        method: 'DELETE',
      }),

    replaceFuncionarios: (id: string, funcionarioIds: string[]) =>
      request<Contrato>(`/api/contratos/${id}/funcionarios`, {
        method: 'PUT',
        body: JSON.stringify({ funcionarioIds }),
      }),
  },
}
