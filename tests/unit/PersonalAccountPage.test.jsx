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

  it('делает запрос /api/me с cookie, показывает username и points', async () => {
    sessionStorage.setItem('roles', JSON.stringify(['user']))

    const mockData = { login: 'john', points: 123 }
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument()
      expect(screen.getByText('123')).toBeInTheDocument()
    })

    expect(fetchSpy).toHaveBeenCalledWith('/api/me', {
      credentials: 'include',
    })
  })

  it('если роль bar_admin — рендерит ссылку "Добавить сотрудника"', async () => {
    sessionStorage.setItem('roles', JSON.stringify(['user', 'bar_admin']))

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ login: 'admin', points: 5 }),
    })

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    expect(
      screen.getByRole('link', { name: 'Добавить сотрудника' })
    ).toBeInTheDocument()
  })

  it('если нет роли bar_admin — нет ссылки "Добавить сотрудника"', async () => {
    sessionStorage.setItem('roles', JSON.stringify(['user']))

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ login: 'usr', points: 10 }),
    })

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('usr')).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('link', { name: 'Добавить сотрудника' })
    ).not.toBeInTheDocument()
  })

  it('мягко обрабатывает не-OK ответ', async () => {
    sessionStorage.setItem('roles', JSON.stringify(['user']))

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    renderWithProviders()

    // username останется пустой, points — 0
    await waitFor(() => {
      expect(screen.getByText('Рейтинг:')).toBeInTheDocument()
    })
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})