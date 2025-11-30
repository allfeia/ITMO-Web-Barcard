import { describe, it, beforeEach, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../src/AuthContext.jsx'

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('инициализируется из sessionStorage', () => {
    sessionStorage.setItem('token', 'abc123')
    sessionStorage.setItem('roles', JSON.stringify(['user', 'bar_admin']))
    sessionStorage.setItem('barId', '42')

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.token).toBe('abc123')
    expect(result.current.roles).toEqual(['user', 'bar_admin'])
    expect(result.current.barId).toBe(42)
  })

  it('сохраняет token/roles/barId в sessionStorage при изменении', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.setToken('tkn')
      result.current.setRoles(['user'])
      result.current.setBarId(7)
    })

    expect(sessionStorage.getItem('token')).toBe('tkn')
    expect(JSON.parse(sessionStorage.getItem('roles'))).toEqual(['user'])
    expect(sessionStorage.getItem('barId')).toBe('7')
  })

  it('logout очищает token/roles/barId и sessionStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.setToken('tkn')
      result.current.setRoles(['user', 'bar_admin'])
      result.current.setBarId(99)
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.token).toBeNull()
    expect(result.current.roles).toEqual([])
    expect(result.current.barId).toBeNull()
    expect(sessionStorage.getItem('token')).toBeNull()
    expect(sessionStorage.getItem('roles')).toBe('[]')
    expect(sessionStorage.getItem('barId')).toBeNull()
  })

  it('при удалении token удаляет его из sessionStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.setToken('tkn')
    })
    expect(sessionStorage.getItem('token')).toBe('tkn')

    act(() => {
      result.current.setToken(null)
    })
    expect(sessionStorage.getItem('token')).toBeNull()
  })

  it('roles всегда сериализуются как JSON-строка', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.setRoles(undefined)
    })
    expect(sessionStorage.getItem('roles')).toBe('[]')

    act(() => {
      result.current.setRoles(['a', 'b'])
    })
    expect(sessionStorage.getItem('roles')).toBe(JSON.stringify(['a', 'b']))
  })

  it('barId: число → строка, null/undefined → remove', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.setBarId(10)
    })
    expect(sessionStorage.getItem('barId')).toBe('10')

    act(() => {
      result.current.setBarId(null)
    })
    expect(sessionStorage.getItem('barId')).toBeNull()
  })
})