import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFuncionarioStore } from '../stores/funcionario'

describe('FuncionarioStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have correct initial state', () => {
    const store = useFuncionarioStore()
    expect(store.funcionarios).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.total).toBe(0)
    expect(store.page).toBe(1)
    expect(store.limit).toBe(10)
    expect(store.totalPages).toBe(0)
    expect(store.search).toBe('')
    expect(store.departamento).toBe('')
  })

  it('should have correct departamentos list', () => {
    const store = useFuncionarioStore()
    expect(store.departamentos).toEqual([
      'Engenharia Civil',
      'Elétrica',
      'Mecânica',
      'Segurança do Trabalho',
      'Administrativo',
    ])
  })

  it('should set search and reset page', () => {
    const store = useFuncionarioStore()
    store.setSearch('João')
    expect(store.search).toBe('João')
    expect(store.page).toBe(1)
  })

  it('should set departamento and reset page', () => {
    const store = useFuncionarioStore()
    store.setDepartamento('Engenharia Civil')
    expect(store.departamento).toBe('Engenharia Civil')
    expect(store.page).toBe(1)
  })

  it('should clear filters', () => {
    const store = useFuncionarioStore()
    store.setSearch('João')
    store.setDepartamento('Engenharia Civil')
    store.clearFilters()
    expect(store.search).toBe('')
    expect(store.departamento).toBe('')
    expect(store.page).toBe(1)
  })

  it('should set page', () => {
    const store = useFuncionarioStore()
    store.setPage(3)
    expect(store.page).toBe(3)
  })

  it('should set limit and reset page', () => {
    const store = useFuncionarioStore()
    store.setLimit(20)
    expect(store.limit).toBe(20)
    expect(store.page).toBe(1)
  })
})
