import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContratoStore } from '../stores/contrato'

describe('ContratoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have correct initial state', () => {
    const store = useContratoStore()
    expect(store.contratos).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.total).toBe(0)
    expect(store.page).toBe(1)
    expect(store.limit).toBe(10)
    expect(store.totalPages).toBe(0)
    expect(store.search).toBe('')
    expect(store.status).toBe('')
  })

  it('should have correct status options', () => {
    const store = useContratoStore()
    expect(store.statusOptions).toEqual(['ATIVO', 'ENCERRADO', 'SUSPENSO'])
  })

  it('should set search and reset page', () => {
    const store = useContratoStore()
    store.setSearch('construção')
    expect(store.search).toBe('construção')
    expect(store.page).toBe(1)
  })

  it('should set status and reset page', () => {
    const store = useContratoStore()
    store.setStatus('ATIVO')
    expect(store.status).toBe('ATIVO')
    expect(store.page).toBe(1)
  })

  it('should clear filters', () => {
    const store = useContratoStore()
    store.setSearch('construção')
    store.setStatus('ATIVO')
    store.clearFilters()
    expect(store.search).toBe('')
    expect(store.status).toBe('')
    expect(store.page).toBe(1)
  })

  it('should set page', () => {
    const store = useContratoStore()
    store.setPage(2)
    expect(store.page).toBe(2)
  })

  it('should set limit and reset page', () => {
    const store = useContratoStore()
    store.setLimit(50)
    expect(store.limit).toBe(50)
    expect(store.page).toBe(1)
  })
})
