import { describe, it, beforeEach, expect} from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider} from '../../src/authContext/AuthContext.jsx'
import { useAuth } from '../../src/authContext/useAuth.js'

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('инициализируется из sessionStorage', () => {
    sessionStorage.setItem('roles', JSON.stringify(['user', 'bar_admin']))
    sessionStorage.setItem('barId', '42')

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.roles).toEqual(['user', 'bar_admin'])
    expect(result.current.barId).toBe(42)
  })

  it('сохраняет roles/barId в sessionStorage при изменении', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.setRoles(['user'])
      result.current.setBarId(7)
    })

    expect(JSON.parse(sessionStorage.getItem('roles'))).toEqual(['user'])
    expect(sessionStorage.getItem('barId')).toBe('7')
  })

  it('logout очищает roles/barId и sessionStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.setRoles(['user', 'bar_admin'])
      result.current.setBarId(99)
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.roles).toEqual([])
    expect(result.current.barId).toBeNull()
    expect(sessionStorage.getItem('roles')).toBe('[]')
    expect(sessionStorage.getItem('barId')).toBeNull()
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