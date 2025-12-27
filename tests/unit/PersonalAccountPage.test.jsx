import React from 'react'
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PersonalAccountPage from '../../src/personal-acount-page/PersonalAccountPage.jsx'
import { AuthProvider } from '../../src/authContext/AuthContext.jsx'


vi.mock('../icons/heartIcon.js', () => ({
  default: vi.fn(() => {}),
}))
vi.mock('../icons/starIcon.js', () => ({
  default: vi.fn(() => {}),
}))
vi.mock('../icons/userIcon.js', () => ({
  default: vi.fn(() => {}),
}))

describe('PersonalAccountPage', () => {
  const renderWithProviders = () =>
    render(
      <MemoryRouter>
        <AuthProvider>
          <PersonalAccountPage />
        </AuthProvider>
      </MemoryRouter>
    )

  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('делает запрос /api/me через apiFetch с credentials, показывает username и points', async () => {
    useAuth.mockReturnValue({ roles: ['user'] })

    const mockData = { login: 'john', points: 123 }
    const apiFetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })
    useApiFetch.mockReturnValue(apiFetchMock)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument()
      expect(screen.getByText('123')).toBeInTheDocument()
    })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/me', {
      credentials: 'include',
    })
  })

  it('если роль bar_admin — рендерит ссылку "Добавить сотрудника"', async () => {
    useAuth.mockReturnValue({ roles: ['user', 'bar_admin'] })

    const apiFetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ login: 'admin', points: 5 }),
    })
    useApiFetch.mockReturnValue(apiFetchMock)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: 'Добавить сотрудника' })).toBeInTheDocument()
  })

  it('если нет роли bar_admin — нет ссылки "Добавить сотрудника"', async () => {
    useAuth.mockReturnValue({ roles: ['user'] })

    const apiFetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ login: 'usr', points: 10 }),
    })
    useApiFetch.mockReturnValue(apiFetchMock)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('usr')).toBeInTheDocument()
    })

    expect(screen.queryByRole('link', { name: 'Добавить сотрудника' })).not.toBeInTheDocument()
  })

  it('мягко обрабатывает не-OK ответ /api/me (оставляет username пустым, points = 0)', async () => {
    useAuth.mockReturnValue({ roles: ['user'] })

    const apiFetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })
    useApiFetch.mockReturnValue(apiFetchMock)

    renderPage()

    // username останется пустой, points — 0
    await waitFor(() => {
      expect(screen.getByText('Рейтинг:')).toBeInTheDocument()
    })
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('по клику "Сменить пароль" вызывает POST /api/password/request-reset (с include и JSON headers)', async () => {
    useAuth.mockReturnValue({ roles: ['user'] })

    const apiFetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ login: 'john', points: 1 }),
    })
    useApiFetch.mockReturnValue(apiFetchMock)

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    renderPage()

    // Дождёмся, что профиль подгрузился (чтобы эффект apiFetch отработал)
    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('link', { name: 'Сменить пароль' }))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/password/request-reset', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    })
  })
})